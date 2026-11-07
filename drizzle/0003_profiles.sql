CREATE TYPE "public"."profile_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"role" "profile_role" DEFAULT 'editor' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_auth_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "profiles" ("id", "full_name")
SELECT "id", COALESCE("raw_user_meta_data"->>'full_name', '')
FROM "auth"."users"
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
UPDATE "profiles"
SET "role" = 'admin'
WHERE "id" = (
	SELECT "id" FROM "auth"."users" ORDER BY "created_at" ASC LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM "profiles" WHERE "role" = 'admin');--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET "search_path" = public
AS $$
BEGIN
	INSERT INTO "public"."profiles" ("id", "full_name")
	VALUES (NEW."id", COALESCE(NEW."raw_user_meta_data"->>'full_name', ''))
	ON CONFLICT ("id") DO NOTHING;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "on_auth_user_created"
AFTER INSERT ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();
