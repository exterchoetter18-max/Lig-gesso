import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const DOCUMENTS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "documentos";

let client: SupabaseClient | null = null;

/**
 * Cliente admin do Supabase (service role) — usado só no servidor
 * (Server Actions / Route Handlers) para ler/gravar no Storage.
 * Nunca importe este arquivo em um Client Component.
 *
 * Criado sob demanda (não no carregamento do módulo) para não quebrar
 * o build quando as variáveis de ambiente ainda não estão configuradas.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configurados no .env",
      );
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
