// Esse arquivo só é usado quando você roda o backend localmente
// (npm run dev). Na Vercel, quem entra em ação é api/index.js.
import app from "./app.js"

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
