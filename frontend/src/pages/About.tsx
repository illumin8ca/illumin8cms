
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Home, Scissors, Award, MapPin } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen font-body text-xl">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-card-cream to-card-gold/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-semibold text-card-brown mb-6">
              About Rejeanne "Rej" Doucet
            </h1>
            <p className="font-body text-xl text-card-brown/80 leading-relaxed">
              The heart and hands behind Scenic Valley Quilting
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img 
                  src="/uploads/about/rejeanne-with-baby.png" 
                  alt="Rejeanne Doucet with baby"
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
              
              <div>
                <h2 className="font-heading text-3xl font-semibold text-card-brown mb-6">
                  A Life of Love and Craft
                </h2>
                <p className="font-body text-lg text-card-brown/80 leading-relaxed mb-6">
                  For over 30 years, Rejeanne has been the loving wife of rancher Ed Doucet, 
                  creating a warm home in the scenic valley of Lone Prairie, British Columbia. 
                  Together, they've raised 4 children and opened their hearts and home to 
                  over 50 foster children.
                </p>
                <p className="font-body text-lg text-card-brown/80 leading-relaxed">
                  Her passion for quilting grew naturally from her deep love of family and home. 
                  Each quilt she creates carries the warmth, comfort, and care that she's given 
                  to so many children throughout the years.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-16">
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

            {/* Quote Section */}
            <div className="bg-card-cream/30 rounded-2xl p-8 md:p-12 mb-16">
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

            {/* Experience Section */}
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-heading text-3xl font-semibold text-card-brown mb-6">
                  Quilting Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-card-gold mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading text-lg font-semibold text-card-brown">25+ Years Experience</h4>
                      <p className="font-body text-card-brown/70">Creating beautiful, handcrafted quilts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Scissors className="w-6 h-6 text-card-purple mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading text-lg font-semibold text-card-brown">Traditional Techniques</h4>
                      <p className="font-body text-card-brown/70">Hand-pieced and machine quilted with precision</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Heart className="w-6 h-6 text-card-brown mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading text-lg font-semibold text-card-brown">Made with Love</h4>
                      <p className="font-body text-card-brown/70">Every stitch carries the warmth of family</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-3xl font-semibold text-card-brown mb-6">
                  Our Location
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-card-gold mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading text-lg font-semibold text-card-brown">Lone Prairie, BC</h4>
                      <p className="font-body text-card-brown/70">Nestled in the scenic Peace River Country</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Home className="w-6 h-6 text-card-purple mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading text-lg font-semibold text-card-brown">Home Studio</h4>
                      <p className="font-body text-card-brown/70">Fully equipped craft shop for all quilting needs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
