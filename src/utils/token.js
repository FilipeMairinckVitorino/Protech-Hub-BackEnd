import jwt from "jsonwebtoken"
import "dotenv/config"

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET precisa estar definido no .env")
}

export function assinarToken(payload) {
    // payload leva só o essencial: CTR e o nível do usuário.
    // Nunca coloque a senha (nem o hash dela) dentro do token.
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || "8h" })
}

export function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET)
}
