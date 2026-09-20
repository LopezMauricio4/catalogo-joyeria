import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
try {
  await client.connect();
  const { rows } = await client.query(`SELECT table_name, column_name, data_type, column_default
    FROM information_schema.columns WHERE table_schema = 'public'
    AND table_name IN ('Product', 'Producto', 'users', '_prisma_migrations') ORDER BY table_name, ordinal_position`);
  console.log(JSON.stringify(rows, null, 2));
  console.log('Migraciones:', (await client.query('SELECT migration_name, finished_at IS NOT NULL AS applied FROM "_prisma_migrations"')).rows);
  console.log('Seguridad:', (await client.query(`SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'public."Product"'::regclass`)).rows);
  console.log('Permisos API:', (await client.query(`SELECT grantee, privilege_type FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND table_name = 'Product' AND grantee IN ('anon', 'authenticated')`)).rows);
} catch (error: any) {
  console.error('No se pudo consultar la estructura:', error.code ?? error.name);
  process.exitCode = 1;
} finally {
  await client.end();
}
