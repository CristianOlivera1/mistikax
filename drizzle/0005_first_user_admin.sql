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
				THEN 'editor'::"public"."profile_role"
			ELSE 'admin'::"public"."profile_role"
		END
	)
	ON CONFLICT ("id") DO NOTHING;
	RETURN NEW;
END;
$$;
