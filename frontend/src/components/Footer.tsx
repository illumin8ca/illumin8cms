
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-card-brown text-card-cream">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo className="mb-6 [&>div>span]:text-card-cream [&>div>span:last-child]:text-card-gold" />
            <p className="font-body text-lg leading-relaxed mb-6 text-card-cream/80">
              Handcrafted quilts and crafts from the heart of Lone Prairie, British Columbia. 
              Every creation is made with love and attention to detail.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-card-purple p-3 rounded-full hover:bg-card-purple/80 transition-colors">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="mailto:rejdoucet@xplornet.com" className="bg-card-gold p-3 rounded-full hover:bg-card-gold/80 transition-colors">
                <Mail className="w-5 h-5 text-card-brown" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="font-body text-lg text-card-cream/80 hover:text-card-gold transition-colors">Home</a></li>
              <li><a href="#about" className="font-body text-lg text-card-cream/80 hover:text-card-gold transition-colors">About Rej</a></li>
              <li><a href="#quilts" className="font-body text-lg text-card-cream/80 hover:text-card-gold transition-colors">Quilts</a></li>
              <li><a href="#shop" className="font-body text-lg text-card-cream/80 hover:text-card-gold transition-colors">Shop</a></li>
              <li><a href="#contact" className="font-body text-lg text-card-cream/80 hover:text-card-gold transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-card-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body text-lg text-card-cream/80">Box 1822</p>
                  <p className="font-body text-lg text-card-cream/80">Chetwynd BC V0C 1J0</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-card-gold flex-shrink-0" />
                <p className="font-body text-lg text-card-cream/80">H: 250.788.9766</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-card-gold flex-shrink-0" />
                <p className="font-body text-lg text-card-cream/80">C: 250.401.1958</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-card-gold flex-shrink-0" />
                <p className="font-body text-lg text-card-cream/80">rejdoucet@xplornet.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-card-cream/20 mt-12 pt-8 text-center">
          <p className="font-body text-lg text-card-cream/60">
            © 2024 Scenic Valley Quilting. Made with love by Rejeanne Doucet.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
