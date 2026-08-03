import { Router } from "express"
import { supabase } from "../config/supabaseClient.js"
import { authenticate } from "../middleware/authenticate.js"
import { authorize } from "../middleware/authorize.js"

export const progressoRouter = Router()

// Atividades concluídas do PRÓPRIO aluno logado, numa apostila.
// O CTR vem do token (req.user.ctr), nunca do que o cliente mandar -
// assim um aluno não consegue ver/alterar o progresso de outro CTR
// só trocando um parâmetro na requisição.
progressoRouter.get("/", authenticate, async (req, res) => {
    const { apostila } = req.query

    if (!apostila) {
        return res.status(400).json({ erro: "Informe a apostila" })
    }

    const { data, error } = await supabase
        .from("Atividades_concluidas")
        .select("atividade_id, concluida")
        .eq("ctr", req.user.ctr)
        .eq("apostila", parseInt(apostila))

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível carregar o progresso" })
    }

    res.json(data)
})

// Marca uma atividade como concluída para o aluno logado.
progressoRouter.post("/concluir", authenticate, async (req, res) => {
    const { atividade_id, apostila } = req.body
    const ctr = req.user.ctr

    if (!atividade_id || !apostila) {
        return res.status(400).json({ erro: "Informe atividade_id e apostila" })
    }

    const { data: existente, error: erroBusca } = await supabase
        .from("Atividades_concluidas")
        .select("id")
        .eq("ctr", ctr)
        .eq("atividade_id", parseInt(atividade_id))
        .maybeSingle()

    if (erroBusca) {
        console.error(erroBusca)
        return res.status(500).json({ erro: "Não foi possível salvar sua conclusão" })
    }

    if (existente) {
        const { error } = await supabase
            .from("Atividades_concluidas")
            .update({ concluida: true })
            .eq("id", existente.id)

        if (error) {
            console.error(error)
            return res.status(500).json({ erro: "Não foi possível salvar sua conclusão" })
        }
    } else {
        const { error } = await supabase.from("Atividades_concluidas").insert({
            ctr,
            atividade_id: parseInt(atividade_id),
            concluida: true,
            apostila: parseInt(apostila)
        })

        if (error) {
            console.error(error)
            return res.status(500).json({ erro: "Não foi possível salvar sua conclusão" })
        }
    }

    res.json({ mensagem: "Atividade concluída" })
})

// Progresso de um CTR qualquer - só professor/admin.
progressoRouter.get("/aluno/:ctr", authenticate, authorize("professor", "admin"), async (req, res) => {
    const { ctr } = req.params

    const { data, error } = await supabase
        .from("Atividades_concluidas")
        .select("atividade_id, apostila")
        .eq("ctr", parseInt(ctr))
        .eq("concluida", true)

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível buscar o CTR" })
    }

    res.json(data)
})
