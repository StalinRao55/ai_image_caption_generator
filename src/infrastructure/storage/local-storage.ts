import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import type { StorageProvider } from "./storage.interface";

export class LocalStorage implements StorageProvider {
  private dir = path.join(process.cwd(), "public", "uploads");

  async upload(buffer: Buffer, filename: string) {
    await mkdir(this.dir, { recursive: true });
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const stored = `${Date.now()}-${safe}`;
    await writeFile(path.join(this.dir, stored), buffer);
    return { url: `/uploads/${stored}`, path: stored };
  }

  async remove(filePath: string) {
    await unlink(path.join(this.dir, filePath)).catch(() => undefined);
  }
}
