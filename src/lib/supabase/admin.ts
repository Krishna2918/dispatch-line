import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseUrl } from "../env";

let admin: SupabaseClient | null = null;

/** Service-role client for Twilio webhooks. Server-only. */
export function createAdminSupabase(): SupabaseClient {
  admin ??= createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
