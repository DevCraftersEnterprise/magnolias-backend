import { Readable } from 'stream';
import cloudinary from '../../config/cloudinary';

export const uploadQRToCloudinary = (
  buffer: Buffer,
  folder: string,
  fileName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(error.message || 'Upload failed'));
        }
        resolve(result!.secure_url);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
};

export const uploadPdfToCloudinary = (
  buffer: Buffer,
  folder: string,
  fileName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: fileName,
          resource_type: 'raw',
          type: 'upload',
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(new Error(error.message || 'Upload failed'));
          resolve(result!.secure_url);
        },
      )
      .end(buffer);
  });
};

export const uploadPictureToCloudinary = (
  buffer: Buffer,
  folder: string,
  fileName: string,
  retries: number = 3,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const attemptUpload = (attemptsLeft: number) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            public_id: fileName,
            overwrite: true,
            timeout: 60000,
          },
          (error, result) => {
            if (error) {
              if (attemptsLeft > 0 && (error.message.includes('timeout') || error.message.includes('ESOCKETTIMEDOUT'))) {
                console.log(`Upload failed, retrying... (${attemptsLeft} attempts left)`);
                setTimeout(() => attemptUpload(attemptsLeft - 1), 1000);
              } else {
                return reject(new Error(error.message || 'Upload failed'));
              }
            } else {
              resolve(result!.secure_url);
            }
          },
        )
        .end(buffer);
    };

    attemptUpload(retries);
  });
};

/**
 * Sube múltiples archivos a Cloudinary en lotes para evitar timeouts
 * @param files Array de archivos con sus buffers, folder y fileName
 * @param concurrentUploads Número de uploads simultáneos (default: 3)
 */
export const uploadMultiplePicturesToCloudinary = async (
  files: Array<{ buffer: Buffer; folder: string; fileName: string }>,
  concurrentUploads: number = 3,
): Promise<string[]> => {
  const results: string[] = [];

  for (let i = 0; i < files.length; i += concurrentUploads) {
    const chunk = files.slice(i, i + concurrentUploads);
    const chunkResults = await Promise.all(
      chunk.map(({ buffer, folder, fileName }) =>
        uploadPictureToCloudinary(buffer, folder, fileName),
      ),
    );
    results.push(...chunkResults);
  }

  return results;
};
