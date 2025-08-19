import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

interface CartProps {
  children: React.ReactNode;
}

export const Cart: React.FC<CartProps> = ({ children }) => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {state.itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-card-purple"
            >
              {state.itemCount}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl text-card-brown">
            Shopping Cart ({state.itemCount} {state.itemCount === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <Package className="w-16 h-16 text-card-brown/30 mb-4" />
              <h3 className="font-heading text-xl text-card-brown mb-2">Your cart is empty</h3>
              <p className="text-card-brown/70 mb-6">Add some beautiful quilts to get started!</p>
              <Link to="/shop">
                <Button className="bg-card-purple hover:bg-card-purple/90">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-card-gold/20 rounded-lg bg-card-cream/20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-card-brown truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-card-brown/70">{item.size}</p>
                      <p className="font-heading text-lg font-semibold text-card-purple">
                        ${item.price}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-card-brown/70 hover:text-red-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium text-card-brown">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-lg text-card-brown">Subtotal:</span>
                  <span className="font-heading text-2xl font-semibold text-card-purple">
                    ${state.total.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-card-purple hover:bg-card-purple/90 text-white font-body text-lg py-3"
                    size="lg"
                    asChild
                  >
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-card-brown text-card-brown hover:bg-card-brown hover:text-white"
                      asChild
                    >
                      <Link to="/shop">Continue Shopping</Link>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={clearCart}
                      className="text-card-brown/70 hover:text-red-600 hover:bg-red-50"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>

                {state.total >= 300 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 text-sm font-medium text-center">
                      🎉 You qualify for free shipping!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart; 