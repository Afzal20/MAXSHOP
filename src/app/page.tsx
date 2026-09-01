import { fetchApi } from "@/lib/api/client";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Item {
  id: number;
  title: string;
  price: number;
  discount_price: number;
  slug: string;
  description: string;
  image: string;
}

export const revalidate = 60; // ISR

async function ProductList() {
  const items = await fetchApi<Item[]>('/shop/items/', {
    next: { tags: ['catalog'] }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {items.map((item) => (
        <Link key={item.id} href={`/products/${item.id}`} className="group block">
          <Card className="overflow-hidden h-full group-hover:shadow-lg transition-all duration-300 border border-border/50 group-hover:border-border">
            <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <span className="text-muted-foreground">No Image</span>
              )}
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-xl text-primary">${item.price}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full rounded-none" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Marketplace</h1>
        <p className="text-xl text-muted-foreground">Discover the best products from our vendors, powered by DRF.</p>
      </div>
      
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </main>
  );
}
