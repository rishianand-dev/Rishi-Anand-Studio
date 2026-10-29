import { S3Client } from '@aws-sdk/client-s3';

const requiredStorageVariables = [
  'AWS_ENDPOINT_URL_S3',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
] as const;

export const storageBucket = process.env.NEON_STORAGE_BUCKET || 'media';

export function getStorageClient() {
  const missing = requiredStorageVariables.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing Neon storage configuration: ${missing.join(', ')}`);
  }

  return new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
  });
}

export function getStorageObjectUrl(key: string) {
  return `/api/storage/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export function createStorageKey(folder: string, fileName: string) {
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${Date.now()}-${cleanName}`;
}
