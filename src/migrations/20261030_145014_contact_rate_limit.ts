import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "messages" ADD COLUMN "client_key" varchar;
  CREATE INDEX "messages_client_key_idx" ON "messages" USING btree ("client_key");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "messages_client_key_idx";
  ALTER TABLE "messages" DROP COLUMN "client_key";`)
}
