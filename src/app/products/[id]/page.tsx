import { fetchApi } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';

interface Product {
  id: number;
  title: string;
  price: number;
  discount_price: number | null;
  description: string;
  image: string;
  label: string;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let product: Product;
  try {
    product = await fetchApi<Product>(`/shop/items/${id}/`, { next: { tags: [`product:${id}`] } });
  } catch (e) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        {/* Left Column: Image */}
        <div className="aspect-square bg-muted rounded-3xl overflow-hidden flex items-center justify-center relative shadow-sm border">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <span className="text-muted-foreground text-lg">No Image</span>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            {product.label && (
              <Badge variant="secondary" className="text-sm px-3 py-1 uppercase tracking-wider font-semibold">
                {product.label}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {product.title}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-primary">
                ${product.discount_price ?? product.price}
              </span>
              {product.discount_price && (
                <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50">
                  ${product.price}
                </span>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground/90">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {product.description || "No description provided for this product."}
            </p>
          </div>

          <div className="pt-6">
            <Button size="lg" className="w-full h-14 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
