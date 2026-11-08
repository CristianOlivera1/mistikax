import { describe, expect, it } from "vitest";
import { normalizeHomeLink } from "./normalize-home-link";

describe("normalizeHomeLink", () => {
  it("replaces the old catalog path", () => {
    expect(normalizeHomeLink("/catalogo")).toBe("/catalog");
  });

  it("preserves query strings and fragments", () => {
    expect(normalizeHomeLink("/catalogo?sale=1#items")).toBe(
      "/catalog?sale=1#items",
    );
    expect(normalizeHomeLink("/catalogo/?sale=1")).toBe("/catalog?sale=1");
  });

  it("leaves other internal and external links unchanged", () => {
    expect(normalizeHomeLink("/pages/contact")).toBe("/pages/contact");
    expect(normalizeHomeLink("https://mistikax.com/catalogo")).toBe(
      "https://mistikax.com/catalogo",
    );
  });
});
