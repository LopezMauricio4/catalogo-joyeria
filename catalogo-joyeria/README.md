# React + Vite

## Autenticación con Supabase

1. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde Project Settings > API en Supabase.
2. Copia `backend/.env.example` a `backend/.env` y completa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. La service role key solo debe existir en el backend.
3. En Supabase, habilita Email en Authentication > Providers. Si mantienes la confirmación de correo activa, el registro mostrará un aviso para revisar el email.
4. Para dar acceso administrativo, asigna el claim `app_metadata.role = "admin"` al usuario desde una función segura del servidor o Supabase Dashboard. Nunca lo pongas en `user_metadata` ni en el frontend.

El frontend persiste la sesión mediante Supabase Auth. Las operaciones protegidas del catálogo envían el access token como `Authorization: Bearer ...` y el backend lo valida antes de permitir cambios.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
