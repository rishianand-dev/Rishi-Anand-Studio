import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { createStorageKey, getStorageClient, getStorageObjectUrl, storageBucket } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'A file is required' }, { status: 400 });
    }

    const safeFolder = typeof folder === 'string' && /^[a-z0-9-]+$/.test(folder) ? folder : 'uploads';
    const key = createStorageKey(safeFolder, file.name);
    const client = getStorageClient();

    await client.send(new PutObjectCommand({
      Bucket: storageBucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || 'application/octet-stream',
    }));

    return NextResponse.json({
      success: true,
      url: getStorageObjectUrl(key),
    });
  } catch (error) {
    console.error('Neon storage upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
