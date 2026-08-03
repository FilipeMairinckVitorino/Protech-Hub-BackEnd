// Uso: router.get("/rota", authenticate, authorize("admin"), handler)
// Uso com mais de um papel: authorize("admin", "professor")
export function authorize(...papeisPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ erro: "Não autenticado" })
        }

        if (!papeisPermitidos.includes(req.user.userLv)) {
            return res.status(403).json({ erro: "Sem permissão para essa ação" })
        }

        next()
    }
}
