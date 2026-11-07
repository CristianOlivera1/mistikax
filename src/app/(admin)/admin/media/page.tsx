import type { Metadata } from "next";
import { Icon } from "@/components/icons/icon";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MediaGrid } from "@/features/media/components/media-grid";
import { MediaUploadButton } from "@/features/media/components/media-upload-button";
import { getMediaFiles } from "@/features/media/queries";

export const metadata: Metadata = {
  title: "Medios",
};

export default async function MediaPage() {
  const files = await getMediaFiles();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Medios"
        description={`${files.length} archivos locales`}
        actions={<MediaUploadButton />}
      />
      <Alert className="bg-muted/40">
        <Icon icon="lucide:info" width={15} height={15} aria-hidden="true" />
        <AlertDescription>
          Sube imágenes nuevas y reutilízalas en tus productos. Los archivos de
          ejemplo están bloqueados para evitar borrados accidentales.
        </AlertDescription>
      </Alert>
      <MediaGrid files={files} />
    </div>
  );
}

export const dynamic = "force-dynamic";
