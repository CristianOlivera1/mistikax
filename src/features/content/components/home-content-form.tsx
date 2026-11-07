"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SwitchField } from "@/components/shared/switch-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateHomeContentAction } from "../actions";
import type { HomeContent } from "../types";
import { homeContentSchema, type HomeContentFormValues } from "../schema";

type HomeContentFormProps = {
  content: HomeContent;
  images: string[];
};

function filename(path: string): string {
  const segments = path.split("/");
  return segments[segments.length - 1] ?? path;
}

export function HomeContentForm({ content, images }: HomeContentFormProps) {
  const form = useForm<HomeContentFormValues>({
    resolver: zodResolver(homeContentSchema),
    defaultValues: content,
  });
  const { errors } = form.formState;
  const announcement = useWatch({
    control: form.control,
    name: "announcement",
  });
  const hero = useWatch({ control: form.control, name: "hero" });
  const sections = useWatch({ control: form.control, name: "sections" }) ?? [];

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    form.setValue("sections", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function toggleSection(index: number, visible: boolean) {
    const next = sections.map((section, currentIndex) =>
      currentIndex === index ? { ...section, visible } : section,
    );
    form.setValue("sections", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  async function onSubmit(values: HomeContentFormValues) {
    const result = await updateHomeContentAction(values);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success("Portada actualizada.");
    form.reset(values);
  }

  return (
    <>
      <PageHeader
        title="Portada y banners"
        description="Controla lo que ven tus clientes al entrar a la tienda."
        actions={
          <Button type="submit" form="home-content-form">
            Guardar cambios
          </Button>
        }
      />


      <form
        id="home-content-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-4 grid gap-4 lg:grid-cols-3"
      >
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Barra de anuncio" bodyClassName="space-y-4 p-5">
            <SwitchField
              id="announcement-visible"
              label="Mostrar barra superior"
              checked={announcement.visible}
              onCheckedChange={(checked) =>
                form.setValue("announcement.visible", checked, {
                  shouldValidate: true,
                })
              }
            />
            <FormField
              label="Texto"
              htmlFor="announcement-text"
              error={errors.announcement?.text?.message}
            >
              <Input
                id="announcement-text"
                placeholder="Envío gratis desde S/ 200"
                aria-invalid={Boolean(errors.announcement?.text)}
                {...form.register("announcement.text")}
              />
            </FormField>
          </SectionCard>

          <SectionCard title="Banner principal" bodyClassName="space-y-4 p-5">
            <FormField
              label="Título"
              htmlFor="hero-title"
              error={errors.hero?.title?.message}
            >
              <Input
                id="hero-title"
                aria-invalid={Boolean(errors.hero?.title)}
                {...form.register("hero.title")}
              />
            </FormField>

            <FormField
              label="Subtítulo"
              htmlFor="hero-subtitle"
              error={errors.hero?.subtitle?.message}
            >
              <Textarea
                id="hero-subtitle"
                rows={2}
                aria-invalid={Boolean(errors.hero?.subtitle)}
                {...form.register("hero.subtitle")}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Texto del botón"
                htmlFor="hero-cta"
                error={errors.hero?.cta?.message}
              >
                <Input
                  id="hero-cta"
                  aria-invalid={Boolean(errors.hero?.cta)}
                  {...form.register("hero.cta")}
                />
              </FormField>

              <FormField
                label="Enlace del botón"
                htmlFor="hero-link"
                error={errors.hero?.link?.message}
                hint="Ruta interna o URL completa."
              >
                <Input
                  id="hero-link"
                  className="font-mono"
                  aria-invalid={Boolean(errors.hero?.link)}
                  {...form.register("hero.link")}
                />
              </FormField>
            </div>

            <FormField
              label="Imagen"
              htmlFor="hero-image"
              error={errors.hero?.image?.message}
            >
              <NativeSelect
                id="hero-image"
                aria-invalid={Boolean(errors.hero?.image)}
                {...form.register("hero.image")}
              >
                {images.map((path) => (
                  <option key={path} value={path}>
                    {filename(path)}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          </SectionCard>

          <SectionCard
            title="Secciones de la portada"
            description="Activa, oculta y ordena las secciones."
            bodyClassName="divide-border divide-y"
          >
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center gap-2 px-4 py-2"
              >
                <span className="flex-1 text-sm font-medium">
                  {section.label}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Subir ${section.label}`}
                  disabled={index === 0}
                  onClick={() => moveSection(index, -1)}
                >
                  <Icon
                    icon="lucide:arrow-up"
                    width={14}
                    height={14}
                    aria-hidden="true"
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Bajar ${section.label}`}
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, 1)}
                >
                  <Icon
                    icon="lucide:arrow-down"
                    width={14}
                    height={14}
                    aria-hidden="true"
                  />
                </Button>
                <Switch
                  checked={section.visible}
                  onCheckedChange={(checked) => toggleSection(index, checked)}
                  aria-label={`Mostrar ${section.label}`}
                />
              </div>
            ))}
          </SectionCard>

          <div className="flex justify-end">
            <Button type="submit">Guardar cambios</Button>
          </div>
        </div>

        <div>
          <div className="border-border bg-card sticky top-20 overflow-hidden rounded-lg border">
            <p className="border-border border-b px-4 py-3 text-sm font-medium">
              Vista previa
            </p>
            <div className="relative aspect-[3/4]">
              <Image
                src={hero.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 p-5 text-center text-white">
                <p className="text-3xl font-extrabold tracking-tight uppercase">
                  {hero.title || "Título"}
                </p>
                <p className="text-xs text-white/85">
                  {hero.subtitle || "Subtítulo del banner"}
                </p>
                <span className="mt-2 border border-white/40 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-widest uppercase">
                  {hero.cta || "Ver catálogo"}
                </span>
              </div>
            </div>
            {announcement.visible ? (
              <p className="bg-foreground text-background px-3 py-2 text-center text-xs">
                {announcement.text || "Texto del anuncio"}
              </p>
            ) : null}
          </div>
        </div>
      </form>
    </>
  );
}
