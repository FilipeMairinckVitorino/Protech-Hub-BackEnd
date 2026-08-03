# Backend do Protech Hub

API em Node.js/Express que fica entre o frontend e o Supabase. A partir de
agora, o frontend não fala mais direto com o Supabase — ele fala com essa
API, e só essa API tem a `service_role key`.

## 1. Instalação

```bash
cd backend
npm install
cp .env.example .env
```

Preencha o `.env`:
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: em Project Settings > API no
  painel do Supabase. A `service_role key` é secreta — não é a mesma chave
  `anon` que estava no frontend.
- `JWT_SECRET`: gere um valor aleatório, por exemplo:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `ALLOWED_ORIGINS`: as URLs do seu frontend (GitHub Pages agora, depois
  adicione a do Netlify também), separadas por vírgula.

## 2. Migrar as senhas existentes para hash

As senhas na tabela `Alunos` hoje estão em texto puro. Rode isso **uma
única vez**, depois de configurar o `.env` (faça backup da tabela antes):

```bash
npm run hash-senhas
```

## 3. Rodar localmente

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000` (ou a porta que você definir).

## 4. Deploy

Funciona em qualquer serviço que rode Node (Render, Railway, Fly.io...).
Configure lá as mesmas variáveis de ambiente do `.env`. `ALLOWED_ORIGINS`
continua listando os domínios do frontend (GitHub Pages, Netlify), não o
domínio do próprio backend.

## 5. Rotas disponíveis

| Método | Rota | Quem pode | O que faz |
|---|---|---|---|
| POST | `/auth/login` | público | recebe `{ ctr, senha }`, devolve `{ token, user }` |
| POST | `/alunos` | admin | cadastra aluno: `{ ctr, senha }` |
| GET | `/alunos/:ctr` | admin | dados do aluno (sem a senha) |
| PATCH | `/alunos/:ctr/kits` | admin | `{ kit1, kit2 }` |
| GET | `/apostilas?kit=1` | logado | lista apostilas do kit |
| GET | `/atividades?apostila=3` | logado | lista atividades da apostila |
| GET | `/atividades/todas` | professor, admin | todas as atividades (id, kit, apostila, paginas) |
| GET | `/progresso?apostila=3` | logado | atividades concluídas do próprio aluno |
| POST | `/progresso/concluir` | logado | `{ atividade_id, apostila }` |
| GET | `/progresso/aluno/:ctr` | professor, admin | progresso de qualquer aluno |
| GET | `/questoes/:atividade_id` | logado | questões **sem** o gabarito |
| POST | `/questoes/:atividade_id/submit` | logado | `{ respostas: { "12": "a", ... } }`, corrige e devolve o gabarito |

Todas as rotas protegidas esperam o header:
```
Authorization: Bearer <token recebido no login>
```

## 6. O que muda no frontend (próximo passo)

Isso ainda não está pronto — é o que vamos fazer a seguir:

1. Trocar toda chamada ao Supabase no `API.js` por chamadas a essa API nova
   (mesma ideia, endereços diferentes).
2. Guardar o `token` retornado pelo login (não mais o registro inteiro do
   aluno com a senha).
3. Mandar `Authorization: Bearer <token>` em toda requisição autenticada.
4. **`cadastro.html`**: a tela que mostra a senha em texto puro de um aluno
   precisa mudar — o backend não devolve mais a senha (nem o hash), então
   essa exibição deixa de ser possível. A senha só pode ser mostrada uma vez,
   no momento em que é gerada (isso o fluxo atual já faz, então não muda).
5. **`questoes.js`**: agora existem duas chamadas em vez de uma — buscar as
   questões (sem gabarito) e, no envio, chamar `/submit` para corrigir. A
   função `mostrarResultado` deixa de calcular acertos no frontend; ela usa
   o que a rota `/submit` devolver.

## 7. Sobre RLS

Combinamos deixar RLS para depois. Com esse backend em produção, o risco
principal (chave exposta + qualquer um lendo/escrevendo qualquer tabela)
já desaparece, porque o frontend não terá mais nenhuma chave do Supabase.
RLS continua sendo uma boa camada extra de defesa para adicionar depois.
