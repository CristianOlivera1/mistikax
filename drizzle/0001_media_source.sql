CREATE TYPE "public"."media_source" AS ENUM('catalog', 'upload');--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "source" "media_source" NOT NULL;