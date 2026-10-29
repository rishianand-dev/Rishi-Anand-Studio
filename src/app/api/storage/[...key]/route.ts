import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getStorageClient, storageBucket } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: { key: string[] } }
) {
  try {
    const key = params.key.join('/');
    const result = await getStorageClient().send(new GetObjectCommand({
      Bucket: storageBucket,
      Key: key,
    }));

    if (!result.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return new NextResponse(Buffer.from(await result.Body.transformToByteArray()), {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': result.ContentType || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Neon storage download error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
