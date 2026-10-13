/**
 * Talqa Net - Production Speed Test Engine
 * Real HTTP measurements with Cloudflare + Fallback Local Route Handlers
 */

import {
  calculateMedian,
  calculateJitter,
  calculateTrimmedMean,
  bytesToMbps,
} from './math';

export interface SpeedTestProvider {
  id: string;
  name: string;
  getPingUrl: () => string;
  getDownloadUrl: (bytes: number) => string;
  getUploadUrl: () => string;
}

export const CLOUDFLARE_PROVIDER: SpeedTestProvider = {
  id: 'cloudflare',
  name: 'Cloudflare Global Edge',
  getPingUrl: () => `https://speed.cloudflare.com/__down?bytes=0&_t=${Date.now()}`,
  getDownloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}&_t=${Date.now()}`,
  getUploadUrl: () => 'https://speed.cloudflare.com/__up',
};

export const LOCAL_PROVIDER: SpeedTestProvider = {
  id: 'local',
  name: 'سيرفر طلقة نت الاحتياطي (LAN / Edge)',
  getPingUrl: () => `/api/speed/down?bytes=0&_t=${Date.now()}`,
  getDownloadUrl: (bytes: number) => `/api/speed/down?bytes=${bytes}&_t=${Date.now()}`,
  getUploadUrl: () => '/api/speed/up',
};

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'completed' | 'error';

export interface SpeedProgress {
  phase: TestPhase;
  currentPing: number;
  jitter: number;
  currentMbps: number;
  progressPercent: number; // 0 - 100
  providerName: string;
  error?: string;
}

export interface SpeedTestResult {
  id: string;
  timestamp: number;
  ping: number; // ms
  jitter: number; // ms
  downloadMbps: number; // Mbps
  uploadMbps: number; // Mbps
  providerId: string;
  providerName: string;
  connectionType?: string;
}

const STORAGE_KEY = 'talqa_speed_history';

/**
 * Retrieves the last 10 speed test results from local storage
 */
export function getSpeedTestHistory(): SpeedTestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new speed test result to history (maintaining max 10 entries)
 */
export function saveSpeedTestResult(result: SpeedTestResult): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSpeedTestHistory();
    const updated = [result, ...existing.filter((item) => item.id !== result.id)].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Also update legacy single ping for home view compatibility
    localStorage.setItem('talqa_last_ping', result.ping.toString());
    localStorage.setItem('talqa_last_download', result.downloadMbps.toString());
    window.dispatchEvent(new Event('talqa_speed_updated'));
  } catch {
    // Ignore storage quota errors
  }
}

export class SpeedTestRunner {
  private abortController: AbortController | null = null;
  private provider: SpeedTestProvider = CLOUDFLARE_PROVIDER;

  constructor(preferredProvider?: SpeedTestProvider) {
    if (preferredProvider) {
      this.provider = preferredProvider;
    }
  }

  public abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Probes whether the primary provider is accessible; falls back if CORS/blocked.
   */
  private async selectAccessibleProvider(signal: AbortSignal): Promise<SpeedTestProvider> {
    try {
      const probeStart = performance.now();
      const res = await fetch(CLOUDFLARE_PROVIDER.getPingUrl(), {
        method: 'GET',
        cache: 'no-store',
        signal,
      });
      if (res.ok && performance.now() - probeStart < 4000) {
        return CLOUDFLARE_PROVIDER;
      }
    } catch {
      // Primary unreachable or blocked by CORS / local firewall
    }
    return LOCAL_PROVIDER;
  }

  public async runTest(onProgress: (progress: SpeedProgress) => void): Promise<SpeedTestResult> {
    this.abort();
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // Detect connection type if available in modern browsers
    let connectionType: string | undefined = undefined;
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const navConn = (navigator as unknown as { connection?: { effectiveType?: string; type?: string } }).connection;
      if (navConn?.effectiveType) {
        connectionType = navConn.effectiveType;
      }
    }

    try {
      // Step 0: Provider selection
      onProgress({
        phase: 'ping',
        currentPing: 0,
        jitter: 0,
        currentMbps: 0,
        progressPercent: 5,
        providerName: 'جاري فحص الخادم الأقرب...',
      });

      this.provider = await this.selectAccessibleProvider(signal);

      // Step 1: Ping & Jitter measurement (10 samples)
      const pingSamples: number[] = [];
      const totalPings = 10;

      for (let i = 0; i < totalPings; i++) {
        if (signal.aborted) throw new Error('تم إلغاء الفحص');
        const start = performance.now();
        await fetch(this.provider.getPingUrl(), {
          method: 'GET',
          cache: 'no-store',
          signal,
        });
        const duration = performance.now() - start;

        // Skip first sample as TLS / connection warmup
        if (i > 0) {
          pingSamples.push(duration);
        }

        const currentMedian = calculateMedian(pingSamples.length > 0 ? pingSamples : [duration]);
        const currentJitter = calculateJitter(pingSamples);

        onProgress({
          phase: 'ping',
          currentPing: currentMedian,
          jitter: currentJitter,
          currentMbps: 0,
          progressPercent: 10 + Math.round((i / totalPings) * 20),
          providerName: this.provider.name,
        });

        // Small 50ms pause between pings
        await new Promise((r) => setTimeout(r, 50));
      }

      const finalPing = calculateMedian(pingSamples);
      const finalJitter = calculateJitter(pingSamples);

      // Step 2: Download Throughput (8 seconds test with 3-4 parallel streams)
      onProgress({
        phase: 'download',
        currentPing: finalPing,
        jitter: finalJitter,
        currentMbps: 0,
        progressPercent: 35,
        providerName: this.provider.name,
      });

      const downloadMbpsSamples: number[] = [];
      const downloadStartTime = performance.now();
      const downloadDurationMs = 8000;
      let totalBytesDownloaded = 0;
      let lastReportTime = downloadStartTime;
      let lastReportBytes = 0;

      const runParallelDownloadStream = async (targetBytes: number) => {
        while (performance.now() - downloadStartTime < downloadDurationMs && !signal.aborted) {
          try {
            const res = await fetch(this.provider.getDownloadUrl(targetBytes), {
              method: 'GET',
              cache: 'no-store',
              signal,
            });
            if (!res.body) break;
            const reader = res.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done || signal.aborted) break;
              if (value) {
                totalBytesDownloaded += value.length;
              }
              const now = performance.now();
              const elapsedSinceLast = (now - lastReportTime) / 1000;
              if (elapsedSinceLast >= 0.25) {
                const intervalBytes = totalBytesDownloaded - lastReportBytes;
                const instantMbps = bytesToMbps(intervalBytes, elapsedSinceLast);
                const totalElapsed = (now - downloadStartTime) / 1000;

                // Only record samples after 1.5s warmup
                if (totalElapsed > 1.5) {
                  downloadMbpsSamples.push(instantMbps);
                }

                const smoothedMbps = downloadMbpsSamples.length > 0
                  ? calculateTrimmedMean(downloadMbpsSamples)
                  : instantMbps;

                const percent = 35 + Math.min(30, Math.round((totalElapsed / (downloadDurationMs / 1000)) * 30));

                onProgress({
                  phase: 'download',
                  currentPing: finalPing,
                  jitter: finalJitter,
                  currentMbps: smoothedMbps,
                  progressPercent: percent,
                  providerName: this.provider.name,
                });

                lastReportTime = now;
                lastReportBytes = totalBytesDownloaded;
              }
            }
          } catch {
            break;
          }
        }
      };

      // Launch 3 parallel streams with adaptive chunk sizes (1MB to 3MB)
      await Promise.all([
        runParallelDownloadStream(1_500_000),
        runParallelDownloadStream(2_500_000),
        runParallelDownloadStream(2_000_000),
      ]);

      const finalDownloadMbps = downloadMbpsSamples.length > 0
        ? calculateTrimmedMean(downloadMbpsSamples)
        : bytesToMbps(totalBytesDownloaded, 8);

      // Step 3: Upload Throughput (6 seconds test with parallel POST chunks)
      onProgress({
        phase: 'upload',
        currentPing: finalPing,
        jitter: finalJitter,
        currentMbps: 0,
        progressPercent: 68,
        providerName: this.provider.name,
      });

      const uploadMbpsSamples: number[] = [];
      const uploadStartTime = performance.now();
      const uploadDurationMs = 6000;
      let totalBytesUploaded = 0;
      let lastUploadReportTime = uploadStartTime;
      let lastUploadReportBytes = 0;

      // 512KB random chunk to upload
      const uploadChunkSize = 512 * 1024;
      const uploadBuffer = new Uint8Array(uploadChunkSize);
      for (let i = 0; i < uploadChunkSize; i++) {
        uploadBuffer[i] = (i * 17 + 3) & 0xff;
      }

      const runParallelUploadStream = async () => {
        while (performance.now() - uploadStartTime < uploadDurationMs && !signal.aborted) {
          try {
            const chunkStart = performance.now();
            await fetch(this.provider.getUploadUrl(), {
              method: 'POST',
              body: uploadBuffer,
              headers: { 'Content-Type': 'application/octet-stream' },
              signal,
            });
            totalBytesUploaded += uploadChunkSize;

            const now = performance.now();
            const elapsedSinceLast = (now - lastUploadReportTime) / 1000;
            if (elapsedSinceLast >= 0.25) {
              const intervalBytes = totalBytesUploaded - lastUploadReportBytes;
              const instantMbps = bytesToMbps(intervalBytes, elapsedSinceLast);
              const totalElapsed = (now - uploadStartTime) / 1000;

              if (totalElapsed > 1.0) {
                uploadMbpsSamples.push(instantMbps);
              }

              const smoothedMbps = uploadMbpsSamples.length > 0
                ? calculateTrimmedMean(uploadMbpsSamples)
                : instantMbps;

              const percent = 68 + Math.min(30, Math.round((totalElapsed / (uploadDurationMs / 1000)) * 30));

              onProgress({
                phase: 'upload',
                currentPing: finalPing,
                jitter: finalJitter,
                currentMbps: smoothedMbps,
                progressPercent: percent,
                providerName: this.provider.name,
              });

              lastUploadReportTime = now;
              lastUploadReportBytes = totalBytesUploaded;
            }
          } catch {
            break;
          }
        }
      };

      await Promise.all([
        runParallelUploadStream(),
        runParallelUploadStream(),
      ]);

      const finalUploadMbps = uploadMbpsSamples.length > 0
        ? calculateTrimmedMean(uploadMbpsSamples)
        : bytesToMbps(totalBytesUploaded, 6);

      const result: SpeedTestResult = {
        id: `speed_${Date.now()}`,
        timestamp: Date.now(),
        ping: Math.max(1, Math.round(finalPing)),
        jitter: Math.max(0.1, Number(finalJitter.toFixed(1))),
        downloadMbps: Math.max(0.1, Number(finalDownloadMbps.toFixed(2))),
        uploadMbps: Math.max(0.1, Number(finalUploadMbps.toFixed(2))),
        providerId: this.provider.id,
        providerName: this.provider.name,
        connectionType,
      };

      saveSpeedTestResult(result);

      onProgress({
        phase: 'completed',
        currentPing: result.ping,
        jitter: result.jitter,
        currentMbps: result.downloadMbps,
        progressPercent: 100,
        providerName: this.provider.name,
      });

      return result;
    } catch (err) {
      const isAbort = (err as Error).name === 'AbortError' || signal.aborted;
      const errorMessage = isAbort ? 'تم إيقاف الفحص' : ((err as Error).message || 'تعذر استكمال فحص السرعة');
      onProgress({
        phase: 'error',
        currentPing: 0,
        jitter: 0,
        currentMbps: 0,
        progressPercent: 0,
        providerName: this.provider.name,
        error: errorMessage,
      });
      throw err;
    } finally {
      this.abortController = null;
    }
  }
}
