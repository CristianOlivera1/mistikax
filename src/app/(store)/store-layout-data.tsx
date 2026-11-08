import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { getCartView } from "@/features/cart/queries";
import { getStoreActiveCategoryNames } from "@/features/catalog/store-queries";
import { listPublishedPages } from "@/features/content/store-queries";
import { getCustomerSession } from "@/features/customer-auth/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { STORE_NAV } from "@/lib/nav";

export async function StoreHeaderData() {
  const [cart, customer] = await Promise.all([
    getCartView(),
    getCustomerSession(),
  ]);

  return (
    <StoreHeader
      nav={STORE_NAV}
      customer={
        customer
          ? { fullName: customer.fullName, email: customer.email }
          : null
      }
      cart={cart}
    />
  );
}

export async function StoreFooterData() {
  const [categories, settings, pages] = await Promise.all([
    getStoreActiveCategoryNames(),
    getSiteSettings(),
    listPublishedPages(),
  ]);

  return (
    <StoreFooter
      categories={categories}
      pages={pages.map(({ id, title }) => ({ id, title }))}
      settings={settings}
    />
  );
}
