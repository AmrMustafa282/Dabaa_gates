import { prisma } from "./prisma";

let migrated = false;

export async function ensureSchema() {
  if (migrated) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "HealthLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "gateId" TEXT,
      "gateName" TEXT NOT NULL,
      "ip" TEXT,
      "type" TEXT NOT NULL,
      "status" TEXT,
      "pingTime" INTEGER,
      "message" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "HealthLog_createdAt_idx" ON "HealthLog"("createdAt")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "HealthLog_gateId_idx" ON "HealthLog"("gateId")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "HealthLog_type_idx" ON "HealthLog"("type")`
  );

  migrated = true;
}
