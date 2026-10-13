import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Fallback Speed Test - Download Stream Endpoint
 * Streams requested number of bytes to measure download throughput.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawBytes = searchParams.get('bytes');
  let targetBytes = rawBytes ? parseInt(rawBytes, 10) : 2_000_000; // default 2MB
  if (isNaN(targetBytes) || targetBytes <= 0) targetBytes = 1_000_000;
  // Cap at 25MB per connection to prevent abuse
  const maxBytes = 25_000_000;
  const finalBytes = Math.min(targetBytes, maxBytes);

  const chunkSize = 64 * 1024; // 64KB chunks
  const chunk = new Uint8Array(chunkSize);
  // Fill chunk with pseudo-random pattern
  for (let i = 0; i < chunkSize; i++) {
    chunk[i] = (i * 31 + 7) & 0xff;
  }

  let bytesSent = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= finalBytes) {
        controller.close();
        return;
      }
      const remaining = finalBytes - bytesSent;
      if (remaining >= chunkSize) {
        controller.enqueue(chunk);
        bytesSent += chunkSize;
      } else {
        controller.enqueue(chunk.subarray(0, remaining));
        bytesSent += remaining;
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': finalBytes.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
