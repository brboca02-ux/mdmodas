import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useProductsStore } from "@/stores/productsStore";
import { productToShopify } from "@/lib/mockProducts";
import { ProductCard } from "./ProductCard";

interface FetchOpts {
  query?: string;
  first?: number;
  sortKey?: "CREATED_AT" | "BEST_SELLING" | "PRICE" | "TITLE" | "UPDATED_AT" | "RELEVANCE";
  reverse?: boolean;
}

async function fetchShopify({ query, first = 12, sortKey, reverse }: FetchOpts): Promise<ShopifyProduct[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const data = await Promise.race([
      storefrontApiRequest(PRODUCTS_QUERY, {
        first, query: query ?? null,
        sortKey: sortKey ?? null, reverse: reverse ?? null,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
    clearTimeout(timeout);
    return (((data as { data?: { products?: { edges?: ShopifyProduct[] } } })?.data?.products?.edges) ?? []) as ShopifyProduct[];
  } catch {
    return [];
  }
}

export function ProductGrid({
  query, category, first = 12, sortKey, reverse, emptyHint = true, showCount = false, paginate = false,
}: { query?: string; category?: string; first?: number; sortKey?: FetchOpts["sortKey"]; reverse?: boolean; emptyHint?: boolean; showCount?: boolean; paginate?: boolean }) {
  // Fonte primária: Supabase (via store). Reativo: re-renderiza ao hidratar/CRUD.
  const products = useProductsStore((s) => s.products);
  const loading = useProductsStore((s) => s.loading);
  const loaded = useProductsStore((s) => s.loaded);

  const [visible, setVisible] = useState(first);
  useEffect(() => { setVisible(first); }, [first, query, category, sortKey, reverse]);
  const limit = paginate ? visible : first;


  const hasSupabaseProducts = products.some((p) => p.status === "ativo");

  // Shopify só como fallback quando não há produtos no Supabase.
  const { data: shopifyData } = useQuery({
    queryKey: ["shopify-products", query ?? "all", first, sortKey ?? "default", reverse ?? false],
    queryFn: () => fetchShopify({ query, first, sortKey, reverse }),
    staleTime: 60_000,
    enabled: loaded && !hasSupabaseProducts,
  });

  const { items, total } = useMemo<{ items: ShopifyProduct[]; total: number }>(() => {
    const q = (query ?? "").toLowerCase();
    const cat = (category ?? "").toLowerCase();
    const active = products.filter((p) => p.status === "ativo");

    // Filtro real por categoria (comparação direta com category_id).
    let filtered = cat ? active.filter((p) => (p.category_id ?? "").toLowerCase() === cat) : active;

    // Busca textual continua independente do filtro de categoria.
    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category_id.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (sortKey === "CREATED_AT") {
      filtered = [...filtered].sort((a, b) => (reverse ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)));
    } else if (sortKey === "PRICE") {
      filtered = [...filtered].sort((a, b) => (reverse ? b.price - a.price : a.price - b.price));
    } else if (sortKey === "TITLE") {
      filtered = [...filtered].sort((a, b) => (reverse ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)));
    }

    const fromSupabase = filtered.slice(0, first).map(productToShopify);
    if (fromSupabase.length > 0) return { items: fromSupabase, total: filtered.length };
    const fallback = shopifyData ?? [];
    return { items: fallback, total: fallback.length };
  }, [products, query, category, first, sortKey, reverse, shopifyData]);

  if ((!loaded && loading) || (!loaded && items.length === 0)) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-md bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return emptyHint ? (
      <div className="py-16 text-center border border-dashed border-border rounded-md">
        <p className="font-display text-2xl mb-2">
          {query || category ? "Nenhum produto encontrado" : "Coleção em preparação"}
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto px-4">
          {query || category ? "Tente outro termo, categoria ou cor." : "Em breve novidades. Volte mais tarde ou fale com a gente no WhatsApp."}
        </p>
      </div>
    ) : null;
  }

  return (
    <div>
      {showCount && (
        <p className="mb-5 text-sm text-muted-foreground">
          {total} {total === 1 ? "peça encontrada" : "peças encontradas"}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 items-stretch">
        {items.map((p) => (
          <div key={p.node.id} className="flex">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
