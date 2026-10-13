import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Fallback Speed Test - Upload Endpoint
 * Reads incoming stream and returns total bytes received.
 */
export async function POST(request: NextRequest) {
  try {
    const reader = request.body?.getReader();
    let totalBytes = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) totalBytes += value.length;
      }
    }

    return NextResponse.json(
      { success: true, bytesReceived: totalBytes },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
