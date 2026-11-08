ALTER TABLE "profiles" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TYPE "public"."profile_role" RENAME TO "profile_role_old";--> statement-breakpoint
CREATE TYPE "public"."profile_role" AS ENUM('admin', 'editor', 'customer');--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" TYPE "public"."profile_role" USING "role"::text::"public"."profile_role";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'customer';--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET "search_path" = public
AS $$
BEGIN
	INSERT INTO "public"."profiles" ("id", "full_name", "role")
	VALUES (
		NEW."id",
		COALESCE(NEW."raw_user_meta_data"->>'full_name', ''),
		CASE
			WHEN EXISTS (SELECT 1 FROM "public"."profiles" WHERE "role" = 'admin')
				THEN 'customer'::"public"."profile_role"
			ELSE 'admin'::"public"."profile_role"
		END
	)
	ON CONFLICT ("id") DO NOTHING;
	RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TYPE "public"."profile_role_old";
