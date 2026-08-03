import { Router } from "express"
import bcrypt from "bcryptjs"
import { supabase } from "../config/supabaseClient.js"
import { assinarToken } from "../utils/token.js"

export const authRouter = Router()

authRouter.post("/login", async (req, res) => {
    const { ctr, senha } = req.body

    if (!ctr || !senha) {
        return res.status(400).json({ erro: "CTR e senha são obrigatórios" })
    }

    const { data, error } = await supabase
        .from("Alunos")
        .select("CTR, Senha, Kit1, Kit2, userLv")
        .eq("CTR", parseInt(ctr))
        .maybeSingle()

    if (error) {
        console.error(error)
        return res.status(500).json({ erro: "Não foi possível verificar o CTR" })
    }

    // Mensagem genérica em ambos os casos (CTR inexistente ou senha errada)
    // para não revelar se um CTR existe ou não no sistema.
    if (!data) {
        return res.status(401).json({ erro: "CTR ou senha incorretos" })
    }

    const senhaConfere = await bcrypt.compare(senha, data.Senha)

    if (!senhaConfere) {
        return res.status(401).json({ erro: "CTR ou senha incorretos" })
    }

    const token = assinarToken({ ctr: data.CTR, userLv: data.userLv })

    res.json({
        token,
        user: {
            ctr: data.CTR,
            userLv: data.userLv,
            kit1: data.Kit1,
            kit2: data.Kit2
        }
    })
})
