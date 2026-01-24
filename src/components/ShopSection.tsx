import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Package } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const ShopSection = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, isLoading } = useCartStore();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(20);
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || []
    });

    toast.success("Added to cart!", {
      description: `${product.node.title} has been added to your cart.`,
    });
  };

  return (
    <section id="shop" className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">🎨</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Adventure Kits
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bring the stories to life! Each kit contains everything you need to create your own stuffed adventure companion.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-2xl font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Adventure kits are coming soon! Tell me about your kits in the chat and I'll add them to your store.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              
              return (
                <Card 
                  key={product.node.id} 
                  className="group overflow-hidden hover:shadow-float transition-all duration-300 border-2 border-transparent hover:border-primary/30"
                >
                  <CardHeader className="p-0">
                    <Link to={`/product/${product.node.handle}`}>
                      <div className="aspect-square bg-gradient-to-br from-secondary/30 to-accent/30 relative overflow-hidden">
                        {image ? (
                          <img 
                            src={image.url} 
                            alt={image.altText || product.node.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            🎁
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Link to={`/product/${product.node.handle}`}>
                      <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {product.node.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {product.node.description || "A magical adventure kit!"}
                    </p>
                    <p className="font-display text-xl font-bold text-primary">
                      {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handleAddToCart(product)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
