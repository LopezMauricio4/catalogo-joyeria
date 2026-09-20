# Backend y autenticación de Alpez

Trabaja desde la raíz `catalogo-joyeria` del proyecto abierto. La subcarpeta del mismo nombre es otra copia y no se modificó.

## Conexiones

Los productos se guardan en PostgreSQL con Prisma; las cuentas y contraseñas las gestiona Supabase Auth. No se usa la antigua tabla local de usuarios ni JWT propios.

1. En el proyecto de Supabase correspondiente, copia la URL y la clave pública (anon o publishable) a `.env.local` en la raíz:

   ```dotenv
   VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
   VITE_API_URL=/api
   ```

2. En `backend/.env`, conserva `DATABASE_URL` y Cloudinary. Añade `SUPABASE_URL` y `SUPABASE_ANON_KEY` del **mismo proyecto**. `SUPABASE_SERVICE_ROLE_KEY` es necesaria solo para el comando que asigna administradores; nunca debe tener prefijo `VITE_` ni entrar al navegador. `JWT_SECRET` y `JWT_EXPIRES_IN` ya no se utilizan.
3. En Supabase, Authentication → Providers: habilita Email y la confirmación del correo. En URL Configuration configura Site URL y añade `http://localhost:5173/auth` a las URL permitidas de redirección. Añade también el dominio real al publicar.
4. Reinicia Vite y el backend después de cambiar variables.

## Administrador real

Registra tu cuenta desde la web y confirma el correo. Copia su UUID desde Authentication → Users. Desde `backend` ejecuta:

```powershell
npm run admin:grant -- UUID_DEL_USUARIO
```

El comando conserva los metadatos existentes y asigna `app_metadata.role = admin` en Supabase. No crea cuentas ni modifica contraseñas. Cierra sesión y entra de nuevo. Las cuentas registradas públicamente son clientes. El backend consulta `auth.getUser(token)` y solo acepta el rol de `app_metadata`; un rol enviado por el formulario no da privilegios.

## Arranque y pruebas

Desde la raíz: `npm run dev` inicia web y backend juntos; `Ctrl + C` detiene ambos. Para acceso desde la red local usa `npm run dev:lan`. Para iniciarlos por separado, usa `npm run dev:web` y `npm run dev:api` desde la raíz, o `npm run dev` desde `backend` para arrancar solo la API.

- `GET /api/health`: proceso activo.
- `GET /api/health/ready`: comprueba lectura de la tabla Product.
- `GET /api/products`: catálogo público.
- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`: requieren token de Supabase y administrador.
- `npm run build` en cada carpeta compila el proyecto correspondiente.
- `npm test` en backend prueba validaciones y permisos con respuestas simuladas de Supabase.
- `$env:RUN_DATABASE_TESTS='1'; npm test` añade la prueba real de CRUD en una transacción revertida. No llama Cloudinary ni deja un producto de prueba.
- `npm run db:check` inspecciona conexión, estructura y permisos sin mostrar claves.
- `npm run db:secure` activa RLS y revoca escritura a `anon` y `authenticated`; solo permite lectura pública. Ya se aplicó a la base revisada. Las escrituras siguen pasando por el backend y sus permisos de administrador.

Al editar sin nuevas imágenes se conserva la galería. Borrar un producto elimina su registro de PostgreSQL; las imágenes se conservan en Cloudinary para no borrar recursos compartidos. La limpieza de imágenes no referenciadas es una tarea separada.

## Migraciones

La tabla remota actual es `Product`; la migración histórica local crea `Producto`. No ejecutes `prisma migrate reset` ni `db push --accept-data-loss`. Hay que reconciliar el historial antes de desplegar migraciones a otra base. El esquema restaurado reproduce la tabla observada; `uuid()` y `@updatedAt` son gestionados por Prisma y no requieren alterar las columnas existentes.

## Verificación manual de Supabase

Una vez configuradas las claves: registrar cliente, confirmar correo, iniciar/cerrar sesión, volver a cargar la página y comprobar persistencia; confirmar que un cliente recibe 403 al intentar escribir y que el administrador puede crear, editar y borrar, con cambios visibles al recargar. Sin claves, no se ha certificado este recorrido contra Supabase Auth real.

Documentación: https://supabase.com/docs/reference/javascript/auth-getuser y https://supabase.com/docs/guides/auth/redirect-urls
