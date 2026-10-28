import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promises" ADD COLUMN "number" numeric;
  ALTER TABLE "promises" ADD COLUMN "deadline" varchar;
  ALTER TABLE "promises" ADD COLUMN "is_new" boolean;
  ALTER TABLE "_promises_v" ADD COLUMN "version_number" numeric;
  ALTER TABLE "_promises_v" ADD COLUMN "version_deadline" varchar;
  ALTER TABLE "_promises_v" ADD COLUMN "version_is_new" boolean;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promises" DROP COLUMN "number";
  ALTER TABLE "promises" DROP COLUMN "deadline";
  ALTER TABLE "promises" DROP COLUMN "is_new";
  ALTER TABLE "_promises_v" DROP COLUMN "version_number";
  ALTER TABLE "_promises_v" DROP COLUMN "version_deadline";
  ALTER TABLE "_promises_v" DROP COLUMN "version_is_new";`)
}
