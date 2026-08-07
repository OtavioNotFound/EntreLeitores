# Entre Leitores

Rede social de leitura construída com React, Vite e Supabase. O aplicativo não possui dados de demonstração: perfis, publicações, livros, clubes e interações são carregados do banco de dados.

## Funcionalidades

- Cadastro, confirmação de e-mail, login e sessão persistente com Supabase Auth
- Perfis públicos e edição do próprio perfil
- Feed com publicações, resenhas, citações e enquetes
- Curtidas, itens salvos e comentários persistentes
- Seguidores e notificações automáticas
- Clubes com participação de membros
- Catálogo comunitário de livros e estante pessoal
- Políticas de Row Level Security em todas as tabelas
- Bucket público de avatares com escrita restrita ao proprietário

## Configuração local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave
```

Nunca coloque a chave `service_role` no frontend.

Durante o desenvolvimento, configure em **Authentication → URL Configuration** a Site URL `http://localhost:5173`. Troque-a pela URL pública quando o aplicativo for implantado.

## Banco de dados

As migrações estão em [`supabase/migrations`](supabase/migrations). Para um projeto novo, execute os arquivos em ordem pelo Supabase CLI ou pelo SQL Editor.

Principais tabelas:

- `profiles`
- `books` e `user_books`
- `posts`, `comments`, `post_likes` e `saved_posts`
- `follows`
- `clubs` e `club_members`
- `events` e `event_attendees`
- `notifications`

O cadastro em `auth.users` cria automaticamente o registro correspondente em `profiles`. Curtidas, comentários e novos seguidores geram notificações por triggers no PostgreSQL.

## Comandos

```bash
npm run dev
npm run build
npm run preview
```
