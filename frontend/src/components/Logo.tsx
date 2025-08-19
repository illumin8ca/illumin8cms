
import { Sparkles } from "lucide-react";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Swirl design inspired by business card */}
        <div className="w-10 h-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-card-gold via-card-purple to-card-brown rounded-full"></div>
          <div className="absolute inset-1 bg-card-brown/20 rounded-full"></div>
          <Sparkles className="absolute inset-2 w-6 h-6 text-card-gold" />
        </div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-heading text-2xl font-semibold text-card-brown tracking-wide">
          Scenic Valley
        </span>
        <span className="font-heading text-lg text-card-purple -mt-1 tracking-wider">
          Quilting
        </span>
      </div>
    </div>
  );
};

export default Logo;
