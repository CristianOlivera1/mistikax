"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/slug";
import { createPageAction, updatePageAction } from "../actions";
import { PAGE_STATUSES, type ContentPage } from "../types";
import { pageFormSchema, type PageFormValues } from "../schema";

type PageFormProps = {
  page?: ContentPage;
};

function buildDefaultValues(page: ContentPage | undefined): PageFormValues {
  return {
    title: page?.title ?? "",
    slug: page?.id ?? "",
    body: page?.body ?? "",
    seoDescription: page?.seoDescription ?? "",
    status: page?.status ?? "draft",
  };
}

export function PageForm({ page }: PageFormProps) {
  const isNew = !page;
  const router = useRouter();
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: buildDefaultValues(page),
  });
  const { errors } = form.formState;
  const title = useWatch({ control: form.control, name: "title" });
  const slug = useWatch({ control: form.control, name: "slug" });
  const body = useWatch({ control: form.control, name: "body" });
  const seoDescription = useWatch({
    control: form.control,
    name: "seoDescription",
  });
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!isNew || slugEdited) return;
    form.setValue("slug", slugify(title), { shouldValidate: false });
  }, [form, isNew, slugEdited, title]);

  async function onSubmit(values: PageFormValues) {
    const result = isNew
      ? await createPageAction(values)
      : await updatePageAction(page.id, values);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(isNew ? "Página creada." : "Página actualizada.");
    router.push("/admin/content/pages");
  }

  return (
    <>
      <PageHeader
        title={isNew ? "Nueva página" : (page?.title ?? "Página")}
        description={
          isNew
            ? "Crea un texto informativo para la tienda."
            : `/${page?.id ?? ""}`
        }
        backHref="/admin/content/pages"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/content/pages">Cancelar</Link>
            </Button>
            <Button type="submit" form="page-form">
              Guardar
            </Button>
          </>
        }
      />

      <form
        id="page-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-4 grid gap-4 lg:grid-cols-3"
      >
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Contenido" bodyClassName="space-y-4 p-5">
            <FormField
              label="Título"
              htmlFor="page-title"
              error={errors.title?.message}
            >
              <Input
                id="page-title"
                placeholder="Nosotros"
                aria-invalid={Boolean(errors.title)}
                {...form.register("title")}
              />
            </FormField>

            <FormField
              label="Contenido"
              htmlFor="page-body"
              error={errors.body?.message}
              hint="Separa los párrafos con una línea en blanco."
            >
              <Textarea
                id="page-body"
                rows={14}
                aria-invalid={Boolean(errors.body)}
                {...form.register("body")}
              />
            </FormField>
          </SectionCard>

          <SectionCard title="SEO" bodyClassName="space-y-4 p-5">
            <FormField
              label="Identificador (slug)"
              htmlFor="page-slug"
              error={errors.slug?.message}
              hint={
                isNew
                  ? `URL: /pages/${slug || slugify(title) || "pagina"}`
                  : "El identificador es estable; cambiarlo requiere una redirección."
              }
            >
              <Input
                id="page-slug"
                readOnly={!isNew}
                className="font-mono"
                aria-invalid={Boolean(errors.slug)}
                {...form.register("slug")}
                onInput={() => setSlugEdited(true)}
              />
            </FormField>

            <FormField
              label="Descripción para buscadores"
              htmlFor="page-seo-description"
              error={errors.seoDescription?.message}
              hint={`${seoDescription.length}/160 caracteres`}
            >
              <Textarea
                id="page-seo-description"
                rows={3}
                maxLength={160}
                aria-invalid={Boolean(errors.seoDescription)}
                {...form.register("seoDescription")}
              />
            </FormField>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Publicación" bodyClassName="space-y-4 p-5">
            <FormField
              label="Estado"
              htmlFor="page-status"
              error={errors.status?.message}
            >
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                  >
                    <SelectTrigger
                      id="page-status"
                      aria-invalid={Boolean(errors.status)}
                      onBlur={field.onBlur}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAGE_STATUSES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <p className="text-muted-foreground text-xs">
              Las páginas publicadas aparecen en la tienda.
            </p>
          </SectionCard>

          <SectionCard title="Vista previa" bodyClassName="p-5">
            <div className="space-y-3 text-sm leading-relaxed">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
                ))
              ) : (
                <p className="text-muted-foreground">Sin contenido todavía.</p>
              )}
            </div>
          </SectionCard>
        </div>
      </form>
    </>
  );
}
