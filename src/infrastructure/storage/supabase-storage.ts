import { createClient } from "@supabase/supabase-js";
import { AppError } from "@/domain/errors";
import type { StorageProvider } from "./storage.interface";

export class SupabaseStorage implements StorageProvider {
  private client;
  private bucket: string;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || "captions";
    if (!url || !key) {
      throw new AppError("Supabase storage is not configured.", "CONFIG", 500);
    }
    this.client = createClient(url, key, { auth: { persistSession: false } });
  }

  async upload(buffer: Buffer, filename: string, contentType: string) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `${Date.now()}-${safe}`;
    const { error } = await this.client.storage.from(this.bucket).upload(objectPath, buffer, {
      contentType,
      upsert: false,
    });
    if (error) throw new AppError(error.message, "STORAGE", 500);
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectPath);
    return { url: data.publicUrl, path: objectPath };
  }

  async remove(filePath: string) {
    await this.client.storage.from(this.bucket).remove([filePath]);
  }
}
