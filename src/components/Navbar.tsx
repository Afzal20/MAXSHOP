import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { fetchApi } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  title: string;
  slug: string;
}

export async function Navbar() {
  let categories: Category[] = [];
  try {
    categories = await fetchApi<Category[]>('/shop/categories/', { next: { revalidate: 3600 } });
  } catch (e) {
    console.error('Failed to fetch categories', e);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-extrabold text-2xl tracking-tight text-primary">Marketplace</span>
          </Link>
          {categories.length > 0 && (
            <nav className="hidden md:flex gap-6">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {category.title}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
