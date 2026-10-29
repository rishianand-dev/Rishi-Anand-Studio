export async function uploadPortfolioFile(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/storage/upload');
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onerror = () => reject(new Error('File upload failed'));
    request.onload = () => {
      try {
        const data = JSON.parse(request.responseText) as { success?: boolean; url?: string; error?: string };
        if (request.status < 200 || request.status >= 300 || !data.success || !data.url) {
          reject(new Error(data.error || 'File upload failed'));
          return;
        }
        onProgress?.(100);
        resolve(data.url);
      } catch {
        reject(new Error('Invalid upload response'));
      }
    };
    request.send(formData);
  });
}
