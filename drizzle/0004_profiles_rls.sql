ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "profiles_select_own" ON "profiles" FOR SELECT TO "authenticated" USING ("id" = (SELECT "auth"."uid"()));
