# Publicar Alpez con Vite y Vercel Functions

Se publica un único proyecto desde la raíz del repositorio. `vercel.json`
compila el frontend Vite y el backend Express dentro del mismo despliegue.
Las peticiones `/api` y `/api/*` llegan al backend conservando el prefijo;
las demás llegan al frontend, que tiene el fallback a `index.html` para React Router.

El backend usa `type: commonjs` con TypeScript NodeNext para que la salida
JavaScript use el mismo formato que el cargador de la función Express. Los
scripts administrativos usan `.mts` para conservar su ejecución ESM. El
frontend mantiene su configuración ESM independiente.

Vercel entra por la función estándar `api/index.js`, que importa
`backend/dist/app.js`. La instalación ejecuta `npm ci` tanto en la raíz como
en `backend`; `build:vercel` compila ambas partes. Se incluyen explícitamente
la salida del backend, su package.json y los archivos generados de Prisma.
Las demás dependencias se incluyen mediante el rastreo de imports de Vercel.
No se utiliza el modo Services.

## Pasos

1. Haz commit y push de `vercel.json` y de los cambios de la tienda a GitHub.
2. Importa el repositorio en Vercel. Selecciona **Vite** y la raíz del
   repositorio como Root Directory (no `backend` ni la copia anidada).
3. Si el proyecto ya existe, cambia el preset de Services a Vite en Settings.
   Conserva Root Directory en `./`. Quita overrides antiguos de instalación y
   compilación para usar los comandos de vercel.json. Despliega el commit nuevo
   sin reutilizar la caché de compilación al hacer esta transición.
4. Agrega las siguientes variables de entorno en el proyecto para Production
   y los entornos de Preview que vayas a utilizar. No subas archivos `.env` a GitHub.

| Variable | Valor |
| --- | --- |
| `VITE_API_URL` | `/api` |
| `VITE_SUPABASE_URL` | URL HTTPS del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave publicable de Supabase |
| `SUPABASE_URL` | La misma URL HTTPS de Supabase |
| `SUPABASE_ANON_KEY` | La misma clave publicable |
| `DATABASE_URL` | URI PostgreSQL de Supabase, Transaction pooler para el backend serverless |
| `CLOUDINARY_CLOUD_NAME` | Nombre de tu cuenta Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |

Los valores existentes están en `.env.local` y `backend/.env`. Nunca coloques
claves secretas en variables con prefijo `VITE_`: son públicas en el navegador.
`SUPABASE_SERVICE_ROLE_KEY` solo hace falta para herramientas administrativas
que la requieran, como el script local para conceder permisos; no es necesaria
para la autenticación normal cuando está configurada `SUPABASE_ANON_KEY`.

5. Pulsa **Deploy**. El comando de instalación instala ambos package-lock.json.
   El postinstall del backend ya genera Prisma Client. No se ejecutan migraciones
   ni se reinicia la base de datos durante el despliegue.
6. En Supabase → Authentication → URL Configuration, configura Site URL con
   el dominio publicado y añade `https://TU-DOMINIO/auth` a Redirect URLs.
7. Revisa `/api/health`, `/api/health/ready`, `/catalogo`, un detalle de producto
   y `/carrito`. Recarga las páginas para comprobar las rutas directas.
8. Comprueba el acceso de administrador y el flujo de productos y WhatsApp.

Frontend y API comparten dominio; no necesitas una URL de backend separada ni
agregar el dominio a CORS para estas peticiones del mismo origen. Si utilizas
un frontend en otro dominio, configura `FRONTEND_ORIGINS` en el backend.
Cuando cambies variables `VITE_`, vuelve a desplegar para recompilar el frontend.

## Límites pendientes para el lanzamiento

- Vercel Functions admite hasta 4,5 MB por petición completa. El formulario
  actual permite varias imágenes y el backend hasta 5 MB por imagen: una subida
  puede superar el límite. Para fotos grandes o múltiples fotos debe adaptarse
  la subida directa firmada a Cloudinary; esta configuración de despliegue no
  cambia el formulario de imágenes.
- Hobby es para uso personal no comercial; utiliza un plan que permita la tienda.
- El carrito permanece en el navegador donde se creó. El dominio local y el
  dominio publicado tienen carritos separados.

Documentación: https://vercel.com/docs/services
Rutas: https://vercel.com/docs/services/routing
Configuración: https://vercel.com/docs/services/config-reference
