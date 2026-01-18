
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { formatPrice } from "../../lib/currency";
import { Star, Plus, Minus, Trash2, ShoppingCart, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { toast } from "@/hooks/use-toast";

type Ingredient = {
  name: string;
  price?: number;
  imageURL?: string;
  brand?: string;
  category?: string;
  description?: string;
  ratings?: number;
  numReviews?: number;
  stock?: number;
  weight?: string;
  unit?: string;
  [key: string]: any;
};

type IngredientCartListProps = {
  ingredients: Ingredient[];
  onRemove?: (name: string) => void;
  servings?: number;
  quantities: { [name: string]: number };
  setQuantities: React.Dispatch<React.SetStateAction<{ [name: string]: number }>>;
};

const IngredientCartList: React.FC<IngredientCartListProps & { servings?: number; setServings?: (s: number) => void }> = ({
  ingredients,
  onRemove,
  servings = 1,
  setServings,
  quantities,
  setQuantities,
}) => {
  const handleQuantityChange = (name: string, newQty: number, max: number) => {
    if (newQty < 1 || newQty > max) return;
    setQuantities((prev) => ({ ...prev, [name]: newQty }));
  };

  const { addToCart, items: cartItems } = useCart();
  const [added, setAdded] = useState<{ [name: string]: boolean }>({});

  const handleAddToCart = (ing: Ingredient, quantity: number, price: number) => {
    addToCart(
      {
        id: String(ing.id || ing.name),
        name: ing.name,
        price: price,
        currency: "INR",
        qrCodeId: ing.qrCodeId || `QR-${ing.name}`,
        imageURL: ing.imageURL ?? "https://via.placeholder.com/120x120?text=No+Image",
        brand: ing.brand ?? "Generic",
        category: ing.category ?? "Ingredient",
        description: ing.description ?? "No description available.",
        ratings: ing.ratings ?? 4.0,
        numReviews: ing.numReviews ?? 0,
        stock: ing.stock ?? 25,
        weight: ing.weight ?? ing.unit ?? "unit",
      },
      quantity
    );
    setAdded((prev) => ({ ...prev, [ing.name]: true }));
    setTimeout(
      () => setAdded((prev) => ({ ...prev, [ing.name]: false })),
      1500
    );
  };

  const handleRemove = (name: string) => {
    if (onRemove) onRemove(name);
    toast({
      title: "Ingredient Removed",
      description: `Removed ${name} from planner.`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl min-h-[500px] bg-background border border-border rounded-xl shadow-lg p-6 space-y-6">
        {/* Servings Selector at the top left */}
        <div className="flex items-center justify-between mb-2">
          <div />
          {setServings && (
            <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-full px-3 py-1 shadow-sm mb-6">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground mr-1">Select Serving</span>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-full border border-border bg-background hover:bg-primary/10 text-lg font-bold transition disabled:opacity-50"
                onClick={() => setServings(Math.max(1, servings - 1))}
                disabled={servings <= 1}
                aria-label="Decrease servings"
              >
                -
              </button>
              <span className="text-base font-semibold w-8 text-center select-none">{servings}</span>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-full border border-border bg-background hover:bg-primary/10 text-lg font-bold transition"
                onClick={() => setServings(servings + 1)}
                aria-label="Increase servings"
              >
                +
              </button>
            </div>
          )}
        </div>
        {ingredients.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-lg">
            No ingredients to display. Select a meal to see its ingredients.
          </div>
        ) : (
          <div className="space-y-4">
            {ingredients.map((ing: Ingredient, idx: number) => {
              const price = ing.price ?? 50;
              const imageURL = ing.imageURL ?? "https://via.placeholder.com/120x120?text=No+Image";
              const brand = ing.brand ?? "Generic";
              const category = ing.category ?? "Ingredient";
              const description = ing.description ?? "No description available.";
              const ratings = ing.ratings ?? 4.0;
              const numReviews = ing.numReviews ?? 0;
              const stock = ing.stock ?? 25;
              const weight = ing.weight ?? ing.unit ?? "unit";
              const unit = ing.unit ?? ing.weight ?? "unit";
              
              const quantity = quantities?.[ing.name] || 1;
              const subtotal = price * quantity;

              return (
                <Card
                  key={ing.name + idx}
                  className="border border-border rounded-lg overflow-hidden shadow-sm bg-card transition-shadow hover:shadow-xl relative"
                >
                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 absolute right-4 top-4 z-10">
                      {brand}
                    </Badge>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={imageURL}
                          alt={ing.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center mb-1">
                          <span className="font-bold text-xl text-foreground truncate">
                            {ing.name}
                            {unit && (
                              <span className="text-base text-muted-foreground font-normal ml-2">({unit})</span>
                            )}
                          </span>
                        </div>
                        {ing.description && (
                          <span className="block text-xs text-muted-foreground mb-1 truncate">
                            {ing.description}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-1 mb-1">
                          <span className="flex items-center text-yellow-500 text-sm font-medium">
                            <Star className="h-4 w-4 mr-0.5 fill-yellow-400 stroke-yellow-500" />
                            {ing.ratings ?? 4.0}
                          </span>
                          <span className="text-xs text-muted-foreground">({ing.numReviews ?? 0} reviews)</span>
                        </div>
                        <span className="text-base text-green-700 font-semibold mt-1">
                          Subtotal: {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 ml-6 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(ing.name, quantity - 1, Number.MAX_SAFE_INTEGER)
                            }
                            className="h-8 w-8 p-0 hover:bg-accent"
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                ing.name,
                                Math.max(1, Number(e.target.value)),
                                Number.MAX_SAFE_INTEGER
                              )
                            }
                            className="w-12 h-8 text-center px-1 py-0 text-base border"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(ing.name, quantity + 1, Number.MAX_SAFE_INTEGER)
                            }
                            className="h-8 w-8 p-0 hover:bg-accent"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="h-2" />
                        <div className="flex flex-row gap-2 mt-2">
                          <Button
                            variant="default"
                            size="sm"
                            className={`px-3 py-2 rounded-lg text-sm font-semibold min-w-[90px] transition-colors hover:bg-primary/90 ${
                              added[ing.name] ? "opacity-80" : ""
                            }`}
                            onClick={() => handleAddToCart(ing, quantity, price)}
                            disabled={added[ing.name]}
                          >
                            {added[ing.name] ? (
                              <>
                                <Check className="h-4 w-4 text-green-300 dark:text-green-400 mr-1" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                <span>Add</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemove(ing.name)}
                            className="h-8 w-8 p-0 hover:bg-red-600/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientCartList;
