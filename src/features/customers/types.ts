export type CustomerFilters = {
  query: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  orderCount: number;
  spentCents: number;
  lastPurchaseAt: string;
};
