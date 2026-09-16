# NeuroPsico

Sistema de gestão para clínica neuropsicológica.

## Executar localmente

Crie um arquivo `.env.local` com as variáveis do Supabase e execute:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Variáveis de ambiente

Use `.env.example` como referência. A chave `SUPABASE_SERVICE_ROLE_KEY` deve ficar apenas no servidor e nunca ser publicada no GitHub.

## Supabase

Execute `supabase/schema.sql` no SQL Editor do projeto Supabase antes do primeiro acesso.
