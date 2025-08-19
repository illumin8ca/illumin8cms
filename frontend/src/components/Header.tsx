import { Menu, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import Cart from "./Cart";

const Header = () => {
  const location = useLocation();
  const { state } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Rej" },
    { path: "/shop", label: "Shop" },
    { path: "/contact", label: "Contact" }
  ];

  return (
    <>
      <header className="bg-card-cream border-b border-card-brown/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`font-body text-lg transition-colors ${
                  isActive(item.path) 
                    ? "text-card-purple font-semibold" 
                    : "text-card-brown hover:text-card-purple"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Cart>
              <Button variant="ghost" size="icon" className="hover:bg-card-purple/10 relative">
                <ShoppingBag className="w-6 h-6 text-card-brown" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-card-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </Button>
            </Cart>
            
            {/* Mobile Menu Button */}
            <div className="mobile-menu-container">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:bg-card-purple/10 transition-colors"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-card-brown" />
                ) : (
                  <Menu className="w-6 h-6 text-card-brown" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card-cream border-l border-card-brown/20 z-50 
        transform transition-transform duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-card-brown/20">
            <Logo />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="hover:bg-card-purple/10"
            >
              <X className="w-6 h-6 text-card-brown" />
            </Button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-lg font-body text-lg transition-all duration-200
                    ${isActive(item.path) 
                      ? "bg-card-purple text-white font-semibold shadow-md" 
                      : "text-card-brown hover:bg-card-purple/10 hover:text-card-purple"
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-card-brown/20">
            <div className="text-center">
              <p className="text-card-brown/70 text-sm font-body">
                Scenic Valley Quilts
              </p>
              <p className="text-card-brown/50 text-xs font-body mt-1">
                Handcrafted with love
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
