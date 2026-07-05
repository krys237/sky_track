import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./env";

/**
 * Client Supabase côté serveur (Server Components, Server Actions, Route
 * Handlers). La session est portée par les cookies via @supabase/ssr.
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appelé depuis un Server Component : l'écriture de cookies est
          // ignorée (elle sera gérée par le middleware / une Server Action).
        }
      },
    },
  });
}
