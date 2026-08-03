// Rode esse script UMA VEZ para converter as senhas em texto puro que já
// estão na tabela Alunos para hash (bcrypt). Depois disso, o login e o
// cadastro de novos alunos já lidam com hash automaticamente.
//
// Como rodar (dentro da pasta backend):
//   npm run hash-senhas
//
// ATENÇÃO: faça um backup da tabela Alunos no Supabase antes de rodar isso.

import bcrypt from "bcryptjs"
import { supabase } from "../config/supabaseClient.js"

const SALT_ROUNDS = 10

// Um hash bcrypt sempre começa com $2a$, $2b$ ou $2y$ - usamos isso pra não
// gerar hash de um hash, caso o script seja rodado mais de uma vez sem querer.
function jaEhHash(valor) {
    return /^\$2[aby]\$/.test(valor)
}

async function main() {
    const { data: alunos, error } = await supabase.from("Alunos").select("CTR, Senha")

    if (error) {
        console.error("Não foi possível buscar os alunos:", error)
        process.exit(1)
    }

    let convertidos = 0

    for (const aluno of alunos) {
        if (!aluno.Senha || jaEhHash(aluno.Senha)) continue

        const hash = await bcrypt.hash(aluno.Senha, SALT_ROUNDS)

        const { error: erroUpdate } = await supabase
            .from("Alunos")
            .update({ Senha: hash })
            .eq("CTR", aluno.CTR)

        if (erroUpdate) {
            console.error(`Erro ao converter o CTR ${aluno.CTR}:`, erroUpdate)
            continue
        }

        convertidos++
    }

    console.log(`Pronto! ${convertidos} senha(s) convertida(s) para hash.`)
}

main()
