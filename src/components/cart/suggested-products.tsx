import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/currency';
import { getSuggestedProducts, fetchProducts } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { Star, Plus } from 'lucide-react';

interface SuggestedProductsProps {
  excludeIds?: string[];
}

export function SuggestedProducts({ excludeIds = [] }: SuggestedProductsProps) {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((products) => {
        setAllProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load suggestions');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading suggestions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const filtered = allProducts.filter((p) => !excludeIds.includes(p.id));
  const displayProducts = filtered.sort(() => Math.random() - 0.5).slice(0, 5);
  if (displayProducts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">You might also like</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts.map((product) => (
          <Card key={product.id} className="hover-lift">
            <CardContent className="p-4">
              <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
                <img
                  src={product.imageURL}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2">
                    {product.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {product.ratings} ({product.numReviews})
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    className="h-8 w-8 p-0"
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {product.stock <= 10 && product.stock > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Only {product.stock} left
                  </Badge>
                )}
                
                {product.stock === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
