
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Eye, ShoppingCart, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService, getMediaUrl, type Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const QuiltsSection = () => {
  const { addItem } = useCart();
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const { data: quilts = [], isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: apiService.getFeaturedProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback data for when backend is not available
  const fallbackQuilts = [
    {
      id: 1,
      attributes: {
        name: "Prairie Sunset Quilt",
        price: 450,
        image: { data: { attributes: { url: "/uploads/products/prairie-sunset-quilt.png", alternativeText: "Prairie Sunset Quilt" }}},
        description: "Beautiful floral appliqué with star blocks",
        rating: 5,
        inStock: true,
        category: "quilts",
        size: "Queen (90\" x 90\")",
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 2,
      attributes: {
        name: "Country Garden Throw",
        price: 320,
        image: { data: { attributes: { url: "/uploads/products/country-garden-throw.png", alternativeText: "Country Garden Throw" }}},
        description: "Soft pastels perfect for any season",
        rating: 5,
        inStock: true,
        category: "throws",
        size: "50\" x 60\"",
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 3,
      attributes: {
        name: "Rustic Valley King",
        price: 680,
        image: { data: { attributes: { url: "/uploads/products/rustic-valley-king.png", alternativeText: "Rustic Valley King" }}},
        description: "Earth tones in a classic log cabin pattern",
        rating: 5,
        inStock: true,
        category: "quilts",
        size: "King (108\" x 108\")",
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 4,
      attributes: {
        name: "Midnight Stars Quilt",
        price: 520,
        image: { data: { attributes: { url: "/uploads/products/midnight-stars-quilt.png", alternativeText: "Midnight Stars Quilt" }}},
        description: "Deep blues with golden star accents",
        rating: 5,
        inStock: false,
        category: "quilts",
        size: "Queen (90\" x 90\")",
        createdAt: "",
        updatedAt: ""
      }
    },
  ];

  const displayQuilts = quilts.length > 0 ? quilts : fallbackQuilts;

  const handleAddToCart = (quilt: any) => {
    if (!quilt.attributes.inStock || addedItems.has(quilt.id)) return;
    
    addItem({
      id: quilt.id,
      name: quilt.attributes.name,
      price: quilt.attributes.price,
      image: getMediaUrl(quilt.attributes.image?.data?.attributes?.url || '/placeholder.svg'),
      size: quilt.attributes.size,
    });

    // Add item to addedItems set
    setAddedItems(prev => new Set(prev).add(quilt.id));
    
    // Reset button state after 2 seconds
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(quilt.id);
        return newSet;
      });
    }, 2000);
  };

  return (
    <section id="quilts" className="py-20 bg-card-cream/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-semibold text-card-brown mb-6">
              Featured Quilts
            </h2>
            <p className="font-body text-xl text-card-brown/80 max-w-3xl mx-auto leading-relaxed">
              Each quilt is lovingly handcrafted with premium fabrics and meticulous attention to detail. 
              These pieces are more than bedding—they're heirloom treasures.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-card-purple" />
              <span className="ml-2 text-card-brown/70">Loading quilts...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {displayQuilts.map((quilt) => (
                <Card key={quilt.id} className="border-card-gold/20 bg-white overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={getMediaUrl(quilt.attributes.image?.data?.attributes?.url || '/placeholder.svg')} 
                      alt={quilt.attributes.image?.data?.attributes?.alternativeText || quilt.attributes.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(quilt.attributes.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-card-gold text-card-gold" />
                      ))}
                    </div>
                    
                    <h3 className="font-heading text-2xl font-semibold text-card-brown mb-2">
                      {quilt.attributes.name}
                    </h3>
                    
                    <p className="font-body text-lg text-card-brown/70 mb-4">
                      {quilt.attributes.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-2xl font-semibold text-card-purple">
                        ${quilt.attributes.price}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="border-card-purple text-card-purple hover:bg-card-purple hover:text-white 
                                   hover:shadow-md hover:scale-105 transition-all duration-200"
                        >
                          <Link to={`/product/${quilt.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={!quilt.attributes.inStock}
                          onClick={() => handleAddToCart(quilt)}
                          className={`transition-all duration-200 disabled:opacity-50 ${
                            addedItems.has(quilt.id)
                              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105"
                              : "bg-card-gold hover:bg-card-gold/90 hover:shadow-md hover:scale-102 text-card-brown"
                          }`}
                        >
                          {addedItems.has(quilt.id) ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Added!
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              {quilt.attributes.inStock ? "Add to Cart" : "Sold Out"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              asChild
              size="lg"
              className="bg-card-purple hover:bg-card-purple/90 text-white font-body text-lg px-12 py-6 rounded-full"
            >
              <Link to="/shop">View All Quilts</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuiltsSection;
