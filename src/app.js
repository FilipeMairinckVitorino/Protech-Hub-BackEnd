import express from "express"
import cors from "cors"
import "dotenv/config"

import { authRouter } from "./routes/auth.routes.js"
import { alunosRouter } from "./routes/alunos.routes.js"
import { apostilasRouter } from "./routes/apostilas.routes.js"
import { atividadesRouter } from "./routes/atividades.routes.js"
import { progressoRouter } from "./routes/progresso.routes.js"
import { questoesRouter } from "./routes/questoes.routes.js"

const app = express()

const origensPermitidas = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(origem => origem.trim())
    .filter(Boolean)

app.use(
    cors({
        origin(origem, callback) {
            // Permite chamadas sem origem (ex: Postman/curl) e as origens da lista.
            if (!origem || origensPermitidas.includes(origem)) {
                callback(null, true)
            } else {
                callback(new Error("Origem não permitida pelo CORS: " + origem))
            }
        }
    })
)

app.use(express.json())

app.get("/", (req, res) => {
    res.json({ status: "ok" })
})

app.use("/auth", authRouter)
app.use("/alunos", alunosRouter)
app.use("/apostilas", apostilasRouter)
app.use("/atividades", atividadesRouter)
app.use("/progresso", progressoRouter)
app.use("/questoes", questoesRouter)

// Handler de erro genérico (ex: erro de CORS lançado acima)
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ erro: err.message || "Erro interno" })
})

export default app
