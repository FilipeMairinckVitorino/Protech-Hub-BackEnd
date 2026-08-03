// Ponto de entrada usado pela Vercel. Ela detecta qualquer arquivo dentro
// de /api e o transforma numa função serverless. O vercel.json na raiz
// redireciona todas as rotas pra cá, e o Express (dentro de app.js) cuida
// do roteamento interno (/auth, /alunos, /apostilas...).
import app from "../src/app.js"

export default app
