import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
        "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos no .env"
    )
}

// Esse client usa a service_role key: ele ignora RLS e só deve ser
// usado aqui, no servidor. Nunca envie SUPABASE_SERVICE_ROLE_KEY para o frontend.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
})
