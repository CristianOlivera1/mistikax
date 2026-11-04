import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { SIZE_TYPES } from "../constants";
import type { CategoryWithCount } from "../types";
import { CategoryActions } from "./category-actions";

type CategoriesTableProps = {
  categories: CategoryWithCount[];
};

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const columns: DataTableColumn<CategoryWithCount>[] = [
    {
      id: "name",
      header: "Nombre",
      cell: (category) => <span className="font-medium">{category.name}</span>,
    },
    {
      id: "id",
      header: "Identificador",
      cell: (category) => (
        <span className="text-muted-foreground font-mono text-xs">
          {category.id}
        </span>
      ),
    },
    {
      id: "size-type",
      header: "Tipo de tallas",
      cell: (category) => SIZE_TYPES[category.sizeType].label,
    },
    {
      id: "products",
      header: "Productos",
      cell: (category) => category.productCount,
    },
    {
      id: "stock",
      header: "Stock",
      cell: (category) => (
        <span className="font-mono text-xs">{category.stockTotal}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (category) => <CategoryActions category={category} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={categories}
      getRowKey={(category) => category.id}
    />
  );
}
