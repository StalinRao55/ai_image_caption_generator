import type { StorageProvider } from "./storage.interface";
import { LocalStorage } from "./local-storage";
import { SupabaseStorage } from "./supabase-storage";

export function getStorage(): StorageProvider {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new SupabaseStorage();
  }
  return new LocalStorage();
}
