import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, ArrowLeft, Heart, Truck, Shield, RotateCcw, Check } from "lucide-react";
import { apiService, getMediaUrl, type Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  // Fallback product data for when backend is not available
  const fallbackProducts = [
    {
      id: 1,
      attributes: {
        name: "Prairie Sunset Quilt",
        description: "This stunning Prairie Sunset Quilt captures the warm, golden hues of a countryside evening. Hand-pieced with intricate floral appliqué work and classic star blocks, this quilt represents generations of quilting tradition. Each piece is carefully selected from premium cotton fabrics in rich sunset colors - deep oranges, soft yellows, and warm browns that will bring warmth to any bedroom. The quilt features traditional hand-quilting techniques passed down through generations, with detailed stitching that creates beautiful texture and durability.",
        price: 450,
        category: "quilts",
        size: "Queen (90\" x 90\")",
        inStock: true,
        rating: 5,
        featured: true,
        image: { 
          data: { 
            attributes: { 
              url: "/uploads/products/prairie-sunset-quilt.png",
              alternativeText: "Prairie Sunset Quilt"
            }
          }
        },
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 2,
      attributes: {
        name: "Country Garden Throw",
        description: "Perfect for any season, this Country Garden Throw brings the beauty of a blooming garden into your home. Crafted with soft pastel fabrics in gentle pinks, greens, and cream, this throw features delicate floral patterns that evoke the charm of a countryside garden. The lightweight design makes it perfect for draping over a sofa or chair, or for cozy evenings on the porch. Hand-stitched with care and attention to detail, this throw combines comfort with timeless style.",
        price: 320,
        category: "throws",
        size: "50\" x 60\"",
        inStock: true,
        rating: 5,
        featured: true,
        image: { 
          data: { 
            attributes: { 
              url: "/uploads/products/country-garden-throw.png",
              alternativeText: "Country Garden Throw"
            }
          }
        },
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 3,
      attributes: {
        name: "Rustic Valley King",
        description: "This magnificent King-size quilt showcases the classic log cabin pattern in rich earth tones that reflect the natural beauty of rustic valley landscapes. Created with premium cotton fabrics in deep browns, forest greens, and warm golds, this quilt brings a sense of cozy cabin comfort to your master bedroom. The traditional log cabin blocks are arranged in a stunning geometric pattern that creates visual depth and interest. Each block is carefully pieced and quilted with precision, ensuring this heirloom piece will be treasured for generations.",
        price: 680,
        category: "quilts",
        size: "King (108\" x 108\")",
        inStock: true,
        rating: 5,
        featured: true,
        image: { 
          data: { 
            attributes: { 
              url: "/uploads/products/rustic-valley-king.png",
              alternativeText: "Rustic Valley King"
            }
          }
        },
        createdAt: "",
        updatedAt: ""
      }
    },
    {
      id: 4,
      attributes: {
        name: "Midnight Stars Quilt",
        description: "A truly spectacular piece, this Midnight Stars Quilt features a dramatic night sky design with deep navy blues and shimmering golden star accents. The intricate star pattern creates a celestial theme that's both elegant and cozy. Each star is carefully appliquéd and enhanced with metallic thread details that catch the light beautifully. This quilt represents hours of meticulous handwork and artistic vision, making it a centerpiece for any bedroom. The rich color palette and stunning design make this a show-stopping piece.",
        price: 520,
        category: "quilts",
        size: "Queen (90\" x 90\")",
        inStock: false,
        rating: 5,
        featured: true,
        image: { 
          data: { 
            attributes: { 
              url: "/uploads/products/midnight-stars-quilt.png",
              alternativeText: "Midnight Stars Quilt"
            }
          }
        },
        createdAt: "",
        updatedAt: ""
      }
    }
  ];

  const productId = parseInt(id || "0");
  
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiService.getProduct(productId),
    staleTime: 5 * 60 * 1000,
  });

  // Use fallback data if no product from API
  const displayProduct = product || fallbackProducts.find(p => p.id === productId);

  if (!displayProduct && !isLoading) {
    return <Navigate to="/shop" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen font-body text-xl">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-card-purple mx-auto mb-4"></div>
            <p className="text-card-brown/70">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!displayProduct) {
    return <Navigate to="/shop" replace />;
  }

  const handleAddToCart = () => {
    if (!displayProduct.attributes.inStock || isAdded) return;
    
    addItem({
      id: displayProduct.id,
      name: displayProduct.attributes.name,
      price: displayProduct.attributes.price,
      image: getMediaUrl(displayProduct.attributes.image?.data?.attributes?.url || '/placeholder.svg'),
      size: displayProduct.attributes.size,
    });

    // Set added state
    setIsAdded(true);
    
    // Reset button state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen font-body text-xl">
      <Header />
      
      {/* Breadcrumb */}
      <section className="bg-card-cream/30 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-card-brown/70">
            <Link to="/" className="hover:text-card-brown">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-card-brown">Shop</Link>
            <span>/</span>
            <span className="text-card-brown font-medium">{displayProduct.attributes.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/shop" 
              className="inline-flex items-center text-card-brown hover:text-card-purple mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg bg-card-cream/20">
                  <img
                    src={getMediaUrl(displayProduct.attributes.image?.data?.attributes?.url || '/placeholder.svg')}
                    alt={displayProduct.attributes.image?.data?.attributes?.alternativeText || displayProduct.attributes.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="font-heading text-4xl font-semibold text-card-brown mb-2">
                    {displayProduct.attributes.name}
                  </h1>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(displayProduct.attributes.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-card-gold text-card-gold" />
                      ))}
                    </div>
                    <span className="text-card-brown/70">({displayProduct.attributes.rating || 5}.0)</span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-heading text-3xl font-semibold text-card-purple">
                      ${displayProduct.attributes.price}
                    </span>
                    {!displayProduct.attributes.inStock && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-card-brown mb-2">Size</h3>
                    <p className="text-card-brown/80">{displayProduct.attributes.size}</p>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-semibold text-card-brown mb-2">Category</h3>
                    <p className="text-card-brown/80 capitalize">{displayProduct.attributes.category}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!displayProduct.attributes.inStock}
                    size="lg"
                    className={`flex-1 font-body text-lg py-3 disabled:opacity-50 transition-all duration-200 ${
                      isAdded
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105"
                        : "bg-card-purple hover:bg-card-purple/90 hover:shadow-md hover:scale-102 text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Added!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {displayProduct.attributes.inStock ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-card-brown text-card-brown hover:bg-card-brown hover:text-white"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                {/* Features */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-card-brown/80">
                    <Truck className="w-5 h-5 text-card-gold" />
                    <span>Free shipping on orders over $300</span>
                  </div>
                  <div className="flex items-center gap-3 text-card-brown/80">
                    <Shield className="w-5 h-5 text-card-gold" />
                    <span>Handcrafted quality guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-card-brown/80">
                    <RotateCcw className="w-5 h-5 text-card-gold" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="mt-16">
              <h2 className="font-heading text-3xl font-semibold text-card-brown mb-6">
                Product Description
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-card-brown/80 leading-relaxed text-lg">
                  {displayProduct.attributes.description}
                </p>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="mt-12">
              <Card className="border-card-gold/20 bg-card-cream/30">
                <CardContent className="p-8">
                  <h3 className="font-heading text-2xl font-semibold text-card-brown mb-4">
                    Care Instructions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 text-card-brown/80">
                    <div>
                      <h4 className="font-medium text-card-brown mb-2">Washing</h4>
                      <p>Machine wash cold with like colors. Use gentle cycle and mild detergent.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-card-brown mb-2">Drying</h4>
                      <p>Tumble dry low or line dry. Remove promptly to prevent wrinkles.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-card-brown mb-2">Storage</h4>
                      <p>Store in a cool, dry place. Avoid direct sunlight for long periods.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-card-brown mb-2">Professional Cleaning</h4>
                      <p>For best results, consider professional quilt cleaning annually.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Product; 