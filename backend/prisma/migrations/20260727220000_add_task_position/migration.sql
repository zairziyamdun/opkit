-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Backfill positions per user+status by createdAt
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", status
      ORDER BY "createdAt" ASC, id ASC
    ) - 1 AS new_position
  FROM "tasks"
)
UPDATE "tasks"
SET "position" = ranked.new_position
FROM ranked
WHERE "tasks".id = ranked.id;

-- CreateIndex
CREATE INDEX "tasks_userId_status_position_idx" ON "tasks"("userId", "status", "position");
