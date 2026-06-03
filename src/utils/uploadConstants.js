export const MAX_UPLOAD_SIZE_MB = 25;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export function isFileTooLarge(file) {
  return file && file.size > MAX_UPLOAD_SIZE_BYTES;
}
