import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
try {
  const sql = await readFile(new URL('../../sql/secure-products.sql', import.meta.url), 'utf8');
  await client.connect();
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query(sql);
  await client.query('SELECT count(*) FROM public."Product"');
  const { rows: [access] } = await client.query(`SELECT
    has_table_privilege('anon', 'public."Product"', 'INSERT,UPDATE,DELETE,TRUNCATE') AS anon_write,
    has_table_privilege('authenticated', 'public."Product"', 'INSERT,UPDATE,DELETE,TRUNCATE') AS client_write`);
  if (access.anon_write || access.client_write) throw new Error('WRITE_ACCESS_REMAINS');
  await client.query('COMMIT');
  console.log('RLS activado; escritura pública revocada; lectura del backend verificada.');
} catch (error: any) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('No se aplicaron cambios:', error.code ?? error.message);
  process.exitCode = 1;
} finally { await client.end(); }
