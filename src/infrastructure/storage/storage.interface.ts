export interface StorageProvider {
  upload(buffer: Buffer, filename: string, contentType: string): Promise<{ url: string; path: string }>;
  remove(path: string): Promise<void>;
}
