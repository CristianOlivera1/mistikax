UPDATE "pages" SET "id" = 'about' WHERE "id" = 'nosotros';--> statement-breakpoint
UPDATE "pages" SET "id" = 'shipping' WHERE "id" = 'envios';--> statement-breakpoint
UPDATE "pages" SET "id" = 'returns' WHERE "id" = 'cambios';--> statement-breakpoint
UPDATE "pages" SET "id" = 'contact' WHERE "id" = 'contacto';--> statement-breakpoint
UPDATE "pages" SET "id" = 'privacy' WHERE "id" = 'privacidad';--> statement-breakpoint
UPDATE "pages" SET "id" = 'terms-and-conditions' WHERE "id" = 'terminos-y-condiciones';--> statement-breakpoint
UPDATE "pages" SET "id" = 'terms-and-conditions' WHERE "id" = 'terminos-del-servicio' AND NOT EXISTS (SELECT 1 FROM "pages" WHERE "id" = 'terms-and-conditions');
