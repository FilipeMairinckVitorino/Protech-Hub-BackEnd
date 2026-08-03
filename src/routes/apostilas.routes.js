import { Router } from "express"
import { supabase } from "../config/supabaseClient.js"
import { authenticate } from "../middleware/authenticate.js"

export const apostilasRouter = Router()

// Lista as apostilas de um kit. Só exige estar logado (qualquer papel).
apostilasRouter.get("/", authenticate, async (req, res) => {
    const { kit } = req.query

    if (!kit) {
        return res.status(400).json({ erro: "Informe o kit" })
    }

    const { data, error } = await supabase
        .from("Apostilas")
        .select("*")
        .eq("kit", parseInt(kit))

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível carregar as apostilas" })
    }

    res.json(data)
})
