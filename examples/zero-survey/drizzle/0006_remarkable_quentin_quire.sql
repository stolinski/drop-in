ALTER TABLE "questions" RENAME COLUMN "order_num" TO "order";--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "config" jsonb DEFAULT '{"required":false}'::jsonb NOT NULL;