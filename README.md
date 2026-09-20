# React + Vite

Guía actual del backend y autenticación: [backend/CONFIGURACION.md](backend/CONFIGURACION.md).

## Desarrollo local

Desde la raíz del proyecto ejecuta `npm run dev`: inicia el backend en el puerto 4000 y Vite en el 5173, con recarga automática. `Ctrl + C` detiene ambos procesos.

Para ejecutarlos por separado puedes usar `npm run dev:web` y `npm run dev:api`. Para acceder desde otro dispositivo de tu red, ejecuta `npm run dev:lan`.

En una instalación nueva, ejecuta primero `npm install` y `npm --prefix backend install`, y configura los archivos de entorno como se explica abajo. Si el puerto 5173 está ocupado, cierra el proceso anterior antes de volver a iniciar.

## Autenticación con Supabase

1. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local` desde Project Settings > API en Supabase. Ese archivo tiene prioridad sobre `.env`.
2. Conserva tu `backend/.env` existente y añade `SUPABASE_URL` y `SUPABASE_ANON_KEY`. La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el backend para asignar administradores.
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
