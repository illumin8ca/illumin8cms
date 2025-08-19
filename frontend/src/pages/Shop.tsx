
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Eye, ShoppingCart, Filter, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService, getMediaUrl, type Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const Shop = () => {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, sortBy],
    queryFn: () => apiService.getProducts(selectedCategory, sortBy),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = [
    { id: "all", name: "All Products" },
    { id: "quilts", name: "Quilts" },
    { id: "throws", name: "Throws" },
    { id: "pillows", name: "Pillows" },
    { id: "runners", name: "Table Runners" },
  ];

  // Fallback products for when backend is not available
  const fallbackProducts = [
    {
      id: 1,
      attributes: {
        name: "Prairie Sunset Quilt",
        price: 450,
        category: "quilts",
        image: { data: { attributes: { url: "/uploads/products/prairie-sunset-quilt.png", alternativeText: "Prairie Sunset Quilt" }}},
        description: "Beautiful floral appliqué with star blocks",
        rating: 5,
        size: "Queen (90\" x 90\")",
        inStock: true,
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 2,
      attributes: {
        name: "Country Garden Throw",
        price: 320,
        category: "throws",
        image: { data: { attributes: { url: "/uploads/products/country-garden-throw.png", alternativeText: "Country Garden Throw" }}},
        description: "Soft pastels perfect for any season",
        rating: 5,
        size: "50\" x 60\"",
        inStock: true,
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 3,
      attributes: {
        name: "Rustic Valley King",
        price: 680,
        category: "quilts",
        image: { data: { attributes: { url: "/uploads/products/rustic-valley-king.png", alternativeText: "Rustic Valley King" }}},
        description: "Earth tones in a classic log cabin pattern",
        rating: 5,
        size: "King (108\" x 108\")",
        inStock: true,
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 4,
      attributes: {
        name: "Midnight Stars Quilt",
        price: 520,
        category: "quilts",
        image: { data: { attributes: { url: "/uploads/products/midnight-stars-quilt.png", alternativeText: "Midnight Stars Quilt" }}},
        description: "Deep blues with golden star accents",
        rating: 5,
        size: "Queen (90\" x 90\")",
        inStock: false,
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 5,
      attributes: {
        name: "Autumn Leaves Runner",
        price: 85,
        category: "runners",
        image: { data: { attributes: { url: "/uploads/products/prairie-sunset-quilt.png", alternativeText: "Autumn Leaves Runner" }}},
        description: "Perfect for fall dining table decor",
        rating: 5,
        size: "14\" x 72\"",
        inStock: true,
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 6,
      attributes: {
        name: "Cozy Cabin Pillow Set",
        price: 120,
        category: "pillows",
        image: { data: { attributes: { url: "/uploads/products/country-garden-throw.png", alternativeText: "Cozy Cabin Pillow Set" }}},
        description: "Set of 2 decorative pillows",
        rating: 5,
        size: "18\" x 18\" each",
        inStock: true,
        createdAt: "",
        updatedAt: ""
      }
    },
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts.filter(product => 
    selectedCategory === "all" || product.attributes.category === selectedCategory
  );

  const handleAddToCart = (product: any) => {
    if (!product.attributes.inStock || addedItems.has(product.id)) return;
    
    addItem({
      id: product.id,
      name: product.attributes.name,
      price: product.attributes.price,
      image: getMediaUrl(product.attributes.image?.data?.attributes?.url || '/placeholder.svg'),
      size: product.attributes.size,
    });

    // Add item to addedItems set
    setAddedItems(prev => new Set(prev).add(product.id));
    
    // Reset button state after 2 seconds
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen font-body text-xl">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-card-cream to-card-gold/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-semibold text-card-brown mb-6">
              Shop Quilts & Crafts
            </h1>
            <p className="font-body text-xl text-card-brown/80 leading-relaxed">
              Discover beautiful, handcrafted quilts and home decor items made with love in Lone Prairie, BC.
            </p>
          </div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Filters and Sort */}
            <div className="flex flex-col md:flex-row gap-6 mb-12">
              <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold text-card-brown mb-4">
                  <Filter className="w-5 h-5 inline mr-2" />
                  Filter by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`${
                        selectedCategory === category.id
                          ? "bg-card-purple text-white"
                          : "border-card-brown text-card-brown hover:bg-card-brown hover:text-white"
                      }`}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-heading text-lg font-semibold text-card-brown mb-4">
                  Sort by
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-2 border-card-brown/30 rounded-lg font-body text-lg bg-white text-card-brown
                           focus:outline-none focus:ring-2 focus:ring-card-purple focus:border-card-purple
                           hover:border-card-brown/50 transition-colors duration-200 cursor-pointer
                           min-w-[200px] shadow-sm"
                >
                  <option value="featured" className="py-2">Featured</option>
                  <option value="price-low" className="py-2">Price: Low to High</option>
                  <option value="price-high" className="py-2">Price: High to Low</option>
                  <option value="name" className="py-2">Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-card-purple" />
                <span className="ml-2 text-card-brown/70">Loading products...</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayProducts.map((product) => (
                  <Card key={product.id} className="border-card-gold/20 bg-white overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden relative">
                      <img 
                        src={getMediaUrl(product.attributes.image?.data?.attributes?.url || '/placeholder.svg')} 
                        alt={product.attributes.image?.data?.attributes?.alternativeText || product.attributes.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {!product.attributes.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(product.attributes.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-card-gold text-card-gold" />
                        ))}
                      </div>
                      
                      <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                        {product.attributes.name}
                      </h3>
                      
                      <p className="font-body text-card-brown/70 mb-2">
                        {product.attributes.description}
                      </p>
                      
                      <p className="font-body text-sm text-card-brown/60 mb-4">
                        Size: {product.attributes.size}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-2xl font-semibold text-card-purple">
                          ${product.attributes.price}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="border-card-purple text-card-purple hover:bg-card-purple hover:text-white 
                                     hover:shadow-md hover:scale-105 transition-all duration-200"
                          >
                            <Link to={`/product/${product.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            disabled={!product.attributes.inStock}
                            onClick={() => handleAddToCart(product)}
                            className={`transition-all duration-200 disabled:opacity-50 ${
                              addedItems.has(product.id)
                                ? "bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105"
                                : "bg-card-gold hover:bg-card-gold/90 hover:shadow-md hover:scale-102 text-card-brown"
                            }`}
                          >
                            {addedItems.has(product.id) ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Added!
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                {product.attributes.inStock ? "Add to Cart" : "Sold Out"}
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

            {/* Custom Order Section */}
            <div className="mt-16 bg-card-cream/30 rounded-2xl p-8 md:p-12 text-center">
              <h3 className="font-heading text-3xl font-semibold text-card-brown mb-6">
                Don't See What You're Looking For?
              </h3>
              <p className="font-body text-xl text-card-brown/80 leading-relaxed mb-8 max-w-3xl mx-auto">
                Rej specializes in custom quilts made to your specifications. Whether you have a specific 
                color scheme, size requirement, or design in mind, she can bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-card-purple hover:bg-card-purple/90 text-white font-body text-lg px-8 py-4"
                >
                  Request Custom Quote
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-card-brown text-card-brown hover:bg-card-brown hover:text-white font-body text-lg px-8 py-4"
                >
                  View Custom Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
