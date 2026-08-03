import { verificarToken } from "../utils/token.js"

// Protege uma rota exigindo um token válido.
// Em caso de sucesso, disponibiliza req.user = { ctr, userLv }
export function authenticate(req, res, next) {
    const header = req.headers.authorization

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ erro: "Token não enviado" })
    }

    const token = header.slice("Bearer ".length)

    try {
        const payload = verificarToken(token)
        req.user = payload
        next()
    } catch {
        return res.status(401).json({ erro: "Token inválido ou expirado" })
    }
}
