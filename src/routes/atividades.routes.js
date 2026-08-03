import { Router } from "express"
import { supabase } from "../config/supabaseClient.js"
import { authenticate } from "../middleware/authenticate.js"
import { authorize } from "../middleware/authorize.js"

export const atividadesRouter = Router()

// Lista as atividades de uma apostila. Qualquer usuário logado.
atividadesRouter.get("/", authenticate, async (req, res) => {
    const { apostila } = req.query

    if (!apostila) {
        return res.status(400).json({ erro: "Informe a apostila" })
    }

    const { data, error } = await supabase
        .from("Atividades")
        .select("*")
        .eq("apostila", parseInt(apostila))

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível carregar as atividades" })
    }

    res.json(data)
})

// Lista todas as atividades (id, kit, apostila, paginas) - usado pela tela
// de progresso do professor para calcular quantas atividades cada apostila tem.
atividadesRouter.get("/todas", authenticate, authorize("professor", "admin"), async (req, res) => {
    const { data, error } = await supabase
        .from("Atividades")
        .select("id, kit, apostila, paginas")

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível carregar as atividades" })
    }

    res.json(data)
})
