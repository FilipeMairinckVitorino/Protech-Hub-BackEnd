import { Router } from "express"
import bcrypt from "bcryptjs"
import { supabase } from "../config/supabaseClient.js"
import { authenticate } from "../middleware/authenticate.js"
import { authorize } from "../middleware/authorize.js"

export const alunosRouter = Router()

const SALT_ROUNDS = 10

// Cadastrar um novo aluno (só admin). A senha chega em texto puro (via HTTPS)
// e é transformada em hash aqui, antes de ir pro banco.
alunosRouter.post("/", authenticate, authorize("admin"), async (req, res) => {
    const { ctr, senha } = req.body

    if (!ctr || !senha) {
        return res.status(400).json({ erro: "CTR e senha são obrigatórios" })
    }

    const hash = await bcrypt.hash(senha, SALT_ROUNDS)

    const { error } = await supabase.from("Alunos").insert({
        CTR: parseInt(ctr),
        Senha: hash,
        Kit1: false,
        Kit2: false
    })

    if (error) {
        if (error.code === "23505") {
            return res.status(409).json({ erro: "Aluno já cadastrado" })
        }
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível cadastrar o aluno" })
    }

    res.status(201).json({ mensagem: "Aluno cadastrado com sucesso" })
})

// Consultar os kits liberados de um CTR (só admin).
// Repare que a senha (nem o hash dela) nunca é devolvida por essa rota.
alunosRouter.get("/:ctr", authenticate, authorize("admin"), async (req, res) => {
    const { ctr } = req.params

    const { data, error } = await supabase
        .from("Alunos")
        .select("CTR, Kit1, Kit2, userLv")
        .eq("CTR", parseInt(ctr))
        .maybeSingle()

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível buscar o CTR" })
    }

    if (!data) {
        return res.status(404).json({ erro: "CTR não encontrado" })
    }

    res.json(data)
})

// Editar Kit1/Kit2 de um aluno (só admin)
alunosRouter.patch("/:ctr/kits", authenticate, authorize("admin"), async (req, res) => {
    const { ctr } = req.params
    const { kit1, kit2 } = req.body

    const { error } = await supabase
        .from("Alunos")
        .update({ Kit1: !!kit1, Kit2: !!kit2 })
        .eq("CTR", parseInt(ctr))

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível alterar os kits" })
    }

    res.json({ mensagem: "Kits alterados com sucesso" })
})
