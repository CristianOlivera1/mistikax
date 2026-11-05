"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SwitchField } from "@/components/shared/switch-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { AGE_GROUPS, PRODUCT_STATUSES, STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE, getSizes } from "../constants";
import {
  archiveProductAction,
  createProductAction,
  updateProductAction,
} from "../actions";
import { productFormSchema, type ProductFormValues } from "../schema";
import { slugify } from "@/lib/slug";
import type { CatalogCategory, CatalogColor, CatalogProduct } from "../types";
import { ProductImagesField } from "./product-images-field";

type ProductFormProps = {
  product?: CatalogProduct;
  categories: CatalogCategory[];
  colors: CatalogColor[];
  imageLibrary: string[];
};

function buildDefaultValues(
  product: CatalogProduct | undefined,
  categories: CatalogCategory[],
): ProductFormValues {
  const category = product
    ? (categories.find((item) => item.id === product.categoryId) ??
      categories[0])
    : categories[0];
  const ageGroup = product?.ageGroup ?? "adults";
  const sizes = getSizes(category?.sizeType ?? "clothing", ageGroup);

  return {
    name: product?.name ?? "",
    slug: product?.id ?? "",
    description: product?.description ?? "",
    seoDescription: product?.seoDescription ?? "",
    categoryId: category?.id ?? "",
    ageGroup,
    status: product?.status ?? "draft",
    price: product ? product.priceCents / 100 : 0,
    compareAt: product?.compareAtCents
      ? product.compareAtCents / 100
      : undefined,
    isNew: product?.isNew ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    colorIds: product?.colorIds ?? [],
    stock: sizes.map((size) => ({
      size,
      quantity: product?.stock[size] ?? 0,
    })),
    images: product?.images.length ? product.images : [PLACEHOLDER_IMAGE],
  };
}

export function ProductForm({
  product,
  categories,
  colors,
  imageLibrary,
}: ProductFormProps) {
  const isNew = !product;
  const router = useRouter();
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: buildDefaultValues(product, categories),
  });
  const { errors } = form.formState;
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "stock",
  });

  const name = useWatch({ control: form.control, name: "name" });
  const slug = useWatch({ control: form.control, name: "slug" });
  const seoDescription = useWatch({
    control: form.control,
    name: "seoDescription",
  });
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const ageGroup = useWatch({ control: form.control, name: "ageGroup" });
  const colorIds = useWatch({ control: form.control, name: "colorIds" });
  const images = useWatch({ control: form.control, name: "images" });
  const stock = useWatch({ control: form.control, name: "stock" });
  const isNewProduct = useWatch({ control: form.control, name: "isNew" });
  const isBestSeller = useWatch({
    control: form.control,
    name: "isBestSeller",
  });
  const activeCategory =
    categories.find((category) => category.id === categoryId) ?? categories[0];
  const sizes = useMemo(
    () => getSizes(activeCategory?.sizeType ?? "clothing", ageGroup),
    [activeCategory?.sizeType, ageGroup],
  );

  useEffect(() => {
    if (!isNew || slugEdited) return;
    form.setValue("slug", slugify(name), { shouldValidate: false });
  }, [form, isNew, name, slugEdited]);

  useEffect(() => {
    const current = form.getValues("stock");
    const next = sizes.map((size) => ({
      size,
      quantity: current.find((item) => item.size === size)?.quantity ?? 0,
    }));
    const changed =
      next.length !== current.length ||
      next.some((item, index) => item.size !== current[index]?.size);

    if (changed) replace(next);
  }, [form, replace, sizes]);

  const stockTotal = stock.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
  const previewId = slug || slugify(name) || "producto";

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const result = isNew
        ? await createProductAction(values)
        : await updateProductAction(product.id, values);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(isNew ? "Producto creado." : "Producto actualizado.");
      router.push(
        isNew ? `/admin/products/${result.id}` : "/admin/products",
      );
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title={isNew ? "Nuevo producto" : product.name}
        description={
          isNew ? "Completa los datos y guarda." : `ID: ${product.id}`
        }
        backHref="/admin/products"
        actions={
          <>
            {!isNew ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setArchiveOpen(true)}
              >
                Archivar
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/admin/products">Cancelar</Link>
            </Button>
            <Button type="submit" form="product-form" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </>
        }
      />

      <Alert className="bg-muted/40 mt-4">
        <Icon icon="lucide:info" width={15} height={15} aria-hidden="true" />
        <AlertDescription>
          Los cambios se guardan en la base de datos cuando pulses Guardar.
        </AlertDescription>
      </Alert>

      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-4 grid gap-4 lg:grid-cols-3"
      >
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Información" bodyClassName="space-y-4 p-5">
            <FormField
              label="Nombre"
              htmlFor="product-name"
              error={errors.name?.message}
            >
              <Input
                id="product-name"
                placeholder="Polo piqué clásico"
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
            </FormField>
            <FormField
              label="Descripción"
              htmlFor="product-description"
              error={errors.description?.message}
              hint="Texto plano; usa líneas en blanco para separar párrafos."
            >
              <Textarea
                id="product-description"
                rows={5}
                maxLength={2000}
                placeholder="Describe el material, el corte y los detalles."
                aria-invalid={Boolean(errors.description)}
                {...form.register("description")}
              />
            </FormField>
          </SectionCard>

          <SectionCard title="Imágenes" bodyClassName="p-5">
            <ProductImagesField
              name={name}
              images={images}
              library={imageLibrary}
              onChange={(next) =>
                form.setValue("images", next, { shouldValidate: true })
              }
            />
            {errors.images?.message ? (
              <p className="text-destructive mt-2 text-xs" role="alert">
                {errors.images.message}
              </p>
            ) : null}
          </SectionCard>

          <SectionCard
            title="Inventario por talla"
            description="Las tallas cambian según la categoría y la edad."
            bodyClassName="space-y-4 p-5"
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <Label
                    htmlFor={`stock-${field.id}`}
                    className="text-muted-foreground mb-1.5 block text-center text-xs font-medium"
                  >
                    {field.size}
                  </Label>
                  <Input
                    id={`stock-${field.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className="h-9 text-center"
                    aria-label={`Stock talla ${field.size}`}
                    {...form.register(`stock.${index}.quantity`, {
                      setValueAs: (value) => (value === "" ? 0 : Number(value)),
                    })}
                  />
                  <input
                    type="hidden"
                    {...form.register(`stock.${index}.size`)}
                  />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Stock total:{" "}
              <strong className="text-foreground">{stockTotal}</strong>
            </p>
            {errors.stock?.message ? (
              <p className="text-destructive text-xs" role="alert">
                {errors.stock.message}
              </p>
            ) : null}
          </SectionCard>

          <SectionCard title="Colores" bodyClassName="space-y-3 p-5">
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const checked = colorIds.includes(color.id);

                return (
                  <label
                    key={color.id}
                    className={cn(
                      "border-border flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                      checked && "border-foreground bg-muted",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      aria-label={color.name}
                      onCheckedChange={(value) => {
                        const next =
                          value === true
                            ? [...colorIds, color.id]
                            : colorIds.filter((id) => id !== color.id);
                        form.setValue("colorIds", next, {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <span
                      className="border-border size-3.5 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    {color.name}
                  </label>
                );
              })}
            </div>
            {errors.colorIds?.message ? (
              <p className="text-destructive text-xs" role="alert">
                {errors.colorIds.message}
              </p>
            ) : null}
          </SectionCard>

          <SectionCard title="SEO" bodyClassName="space-y-4 p-5">
            <FormField
              label="Identificador (slug)"
              htmlFor="product-slug"
              error={errors.slug?.message}
              hint={`URL: /productos/${product?.id ?? previewId}`}
            >
              <Input
                id="product-slug"
                placeholder="polo-pique-clasico"
                aria-invalid={Boolean(errors.slug)}
                disabled={!isNew}
                title={
                  isNew
                    ? undefined
                    : "El identificador es inmutable para no romper las URLs."
                }
                {...form.register("slug")}
                onInput={() => setSlugEdited(true)}
              />
            </FormField>
            <FormField
              label="Descripción para buscadores"
              htmlFor="product-seo-description"
              error={errors.seoDescription?.message}
              hint={`${seoDescription.length}/160 caracteres`}
            >
              <Textarea
                id="product-seo-description"
                rows={3}
                maxLength={160}
                placeholder="Resumen corto para resultados de búsqueda."
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
              htmlFor="product-status"
              error={errors.status?.message}
            >
              <NativeSelect
                id="product-status"
                aria-invalid={Boolean(errors.status)}
                {...form.register("status")}
              >
                {Object.entries(PRODUCT_STATUSES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <SwitchField
              id="product-is-new"
              label="Marcar como nuevo"
              description="Aparece en la sección de novedades."
              checked={isNewProduct}
              onCheckedChange={(checked) =>
                form.setValue("isNew", checked, { shouldValidate: true })
              }
            />
            <SwitchField
              id="product-is-best-seller"
              label="Más vendido"
              description="Se destaca en la portada y el catálogo."
              checked={isBestSeller}
              onCheckedChange={(checked) =>
                form.setValue("isBestSeller", checked, {
                  shouldValidate: true,
                })
              }
            />
          </SectionCard>

          <SectionCard title="Organización" bodyClassName="space-y-4 p-5">
            <FormField
              label="Categoría"
              htmlFor="product-category"
              error={errors.categoryId?.message}
            >
              <NativeSelect
                id="product-category"
                aria-invalid={Boolean(errors.categoryId)}
                {...form.register("categoryId")}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField
              label="Edad"
              htmlFor="product-age"
              error={errors.ageGroup?.message}
            >
              <NativeSelect
                id="product-age"
                aria-invalid={Boolean(errors.ageGroup)}
                {...form.register("ageGroup")}
              >
                {Object.entries(AGE_GROUPS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          </SectionCard>

          <SectionCard
            title={`Precio (${STORE.currencySymbol})`}
            bodyClassName="space-y-4 p-5"
          >
            <FormField
              label="Precio"
              htmlFor="product-price"
              error={errors.price?.message}
            >
              <Input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                aria-invalid={Boolean(errors.price)}
                {...form.register("price", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Precio anterior"
              htmlFor="product-compare-at"
              error={errors.compareAt?.message}
              hint="Si lo llenas, se muestra como oferta."
            >
              <Input
                id="product-compare-at"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                aria-invalid={Boolean(errors.compareAt)}
                {...form.register("compareAt", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />
            </FormField>
          </SectionCard>
        </div>
      </form>

      {!isNew ? (
        <ConfirmDialog
          open={archiveOpen}
          onOpenChange={setArchiveOpen}
          title="Archivar producto"
          description={`¿Archivar ${product.name}? Dejará de estar visible y podrás reactivarlo más adelante.`}
          confirmLabel="Archivar"
          tone="danger"
          onConfirm={() => {
            setArchiveOpen(false);
            startTransition(async () => {
              await archiveProductAction(product.id);
              toast.success("Producto archivado.");
              router.push("/admin/products");
              router.refresh();
            });
          }}
        />
      ) : null}
    </>
  );
}
