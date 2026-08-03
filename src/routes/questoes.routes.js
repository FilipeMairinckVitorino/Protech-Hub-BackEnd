import { Router } from "express"
import { supabase } from "../config/supabaseClient.js"
import { authenticate } from "../middleware/authenticate.js"

export const questoesRouter = Router()

// Lista as questões de uma atividade SEM o campo "resp" -
// o gabarito só é revelado depois do envio das respostas.
questoesRouter.get("/:atividade_id", authenticate, async (req, res) => {
    const { atividade_id } = req.params

    const { data, error } = await supabase
        .from("Questoes")
        .select("id, Pergunta, a, b, c, d, Atividade_id")
        .eq("Atividade_id", parseInt(atividade_id))

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível carregar as questões" })
    }

    res.json(data)
})

// Recebe as respostas do aluno, corrige no servidor (usando o gabarito
// que nunca saiu do banco), marca a atividade como concluída e só então
// devolve as respostas certas.
questoesRouter.post("/:atividade_id/submit", authenticate, async (req, res) => {
    const { atividade_id } = req.params
    const { respostas } = req.body // { "12": "a", "13": "c", ... } chave = id da questão
    const ctr = req.user.ctr

    if (!respostas || typeof respostas !== "object") {
        return res.status(400).json({ erro: "Envie as respostas" })
    }

    const { data: atividade, error: erroAtividade } = await supabase
        .from("Atividades")
        .select("id, apostila")
        .eq("id", parseInt(atividade_id))
        .maybeSingle()

    if (erroAtividade || !atividade) {
        return res.status(404).json({ erro: "Atividade não encontrada" })
    }

    const { data: questoes, error: erroQuestoes } = await supabase
        .from("Questoes")
        .select("id, Pergunta, a, b, c, d, resp")
        .eq("Atividade_id", parseInt(atividade_id))

    if (erroQuestoes) {
        console.error(erroQuestoes)
        return res.status(500).json({ erro: "Não foi possível corrigir as questões" })
    }

    let acertos = 0

    const correcoes = questoes.map(questao => {
        const respostaUsuario = respostas[questao.id]
        const correta = respostaUsuario === questao.resp

        if (correta) acertos++

        return {
            id: questao.id,
            respostaUsuario: respostaUsuario ?? null,
            respostaCorreta: questao.resp,
            correta
        }
    })

    // Reaproveita a mesma lógica de "upsert" da rota de progresso:
    // se já existe um registro para esse aluno+atividade, atualiza; senão, cria.
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
        await supabase
            .from("Atividades_concluidas")
            .update({ concluida: true })
            .eq("id", existente.id)
    } else {
        await supabase.from("Atividades_concluidas").insert({
            ctr,
            atividade_id: parseInt(atividade_id),
            concluida: true,
            apostila: atividade.apostila
        })
    }

    res.json({
        acertos,
        total: questoes.length,
        correcoes
    })
})
