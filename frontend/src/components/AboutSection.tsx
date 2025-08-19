
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Home, Scissors } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-semibold text-card-brown mb-6">
              Meet Rejeanne "Rej" Doucet
            </h2>
            <p className="font-body text-xl text-card-brown/80 max-w-3xl mx-auto leading-relaxed">
              A rancher's wife for over 30 years, mother of 4, and loving foster parent to 50+ children. 
              Rej's passion for quilting flows from her heart for family and home.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <img 
                src="/uploads/about/rejeanne-with-baby.png" 
                alt="Rejeanne Doucet with baby"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-card-gold/20 bg-card-cream/50">
                <CardContent className="p-6 text-center">
                  <Heart className="w-12 h-12 text-card-purple mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                    30+ Years
                  </h3>
                  <p className="font-body text-lg text-card-brown/70">
                    Married to Ed Doucet
                  </p>
                </CardContent>
              </Card>

              <Card className="border-card-gold/20 bg-card-cream/50">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-card-gold mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                    50+ Foster Kids
                  </h3>
                  <p className="font-body text-lg text-card-brown/70">
                    Hearts opened wide
                  </p>
                </CardContent>
              </Card>

              <Card className="border-card-gold/20 bg-card-cream/50">
                <CardContent className="p-6 text-center">
                  <Home className="w-12 h-12 text-card-brown mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                    Lone Prairie, BC
                  </h3>
                  <p className="font-body text-lg text-card-brown/70">
                    Scenic valley home
                  </p>
                </CardContent>
              </Card>

              <Card className="border-card-gold/20 bg-card-cream/50">
                <CardContent className="p-6 text-center">
                  <Scissors className="w-12 h-12 text-card-purple mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                    Full Craft Shop
                  </h3>
                  <p className="font-body text-lg text-card-brown/70">
                    At-home studio
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-card-cream/30 rounded-2xl p-8 md:p-12">
            <p className="font-body text-xl text-card-brown/90 leading-relaxed text-center max-w-4xl mx-auto">
              "Every quilt I create carries the love and warmth of our family home. From the rolling hills 
              of Lone Prairie to your living room, each stitch is a connection between hearts. 
              After decades of caring for children and family, quilting has become my way of 
              wrapping the world in comfort, one beautiful creation at a time."
            </p>
            <p className="font-heading text-2xl text-card-purple text-center mt-6 italic">
              ~ Rejeanne Doucet
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
