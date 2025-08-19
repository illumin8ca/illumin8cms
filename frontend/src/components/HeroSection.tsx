
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Home } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-card-cream to-card-gold/10 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-card-gold" />
            <Heart className="w-6 h-6 text-card-purple" />
            <Home className="w-8 h-8 text-card-brown" />
          </div>
          
          <h1 className="font-heading text-5xl md:text-6xl font-semibold text-card-brown mb-6">
            Handcrafted with Love
          </h1>
          
          <p className="font-body text-xl md:text-2xl text-card-brown/80 mb-8 leading-relaxed max-w-3xl mx-auto">
            Welcome to Scenic Valley Quilting, where every quilt tells a story. 
            From the heart of Lone Prairie, British Columbia, Rejeanne Doucet creates 
            beautiful, handcrafted quilts that bring warmth and comfort to your home.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              size="lg" 
              className="bg-card-purple hover:bg-card-purple/90 text-white font-body text-lg px-8 py-6 rounded-full"
            >
              <Link to="/shop">Shop Quilts</Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="border-card-brown text-card-brown hover:bg-card-brown hover:text-white font-body text-lg px-8 py-6 rounded-full"
            >
              <Link to="/about">Learn About Rej</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
