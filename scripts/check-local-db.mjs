import "dotenv/config";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 3000,
});

try {
  await client.connect();
  const result = await client.query("select current_database() as database, now() as checked_at");
  const row = result.rows[0];

  console.log(`Database reachable: ${row.database}`);
  console.log(`Checked at: ${row.checked_at.toISOString()}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Database check failed: ${message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
