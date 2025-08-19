
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const success = await apiService.submitContact(data);
      if (success) {
        setIsSubmitted(true);
        reset();
        toast.success("Message sent successfully! We'll get back to you soon.");
      } else {
        toast.error("Failed to send message. Please try again or contact us directly.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-body text-xl">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-card-cream to-card-gold/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-semibold text-card-brown mb-6">
              Get in Touch
            </h1>
            <p className="font-body text-xl text-card-brown/80 leading-relaxed">
              Have questions about custom quilts or want to discuss a special project? 
              Rej would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div>
                <h2 className="font-heading text-3xl font-semibold text-card-brown mb-8">
                  Send a Message
                </h2>
                <Card className="border-card-gold/20">
                  <CardContent className="p-8">
                    {isSubmitted ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="font-heading text-2xl font-semibold text-card-brown mb-2">
                          Message Sent!
                        </h3>
                        <p className="font-body text-lg text-card-brown/80">
                          Thank you for reaching out. We'll get back to you within 24 hours.
                        </p>
                        <Button 
                          onClick={() => setIsSubmitted(false)}
                          className="mt-4 bg-card-purple hover:bg-card-purple/90"
                        >
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName" className="font-body text-lg text-card-brown">
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              type="text"
                              {...register("firstName")}
                              className="mt-2 text-lg"
                            />
                            {errors.firstName && (
                              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="font-body text-lg text-card-brown">
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              type="text"
                              {...register("lastName")}
                              className="mt-2 text-lg"
                            />
                            {errors.lastName && (
                              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="font-body text-lg text-card-brown">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            className="mt-2 text-lg"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="font-body text-lg text-card-brown">
                            Phone Number (Optional)
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            {...register("phone")}
                            className="mt-2 text-lg"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="subject" className="font-body text-lg text-card-brown">
                            Subject
                          </Label>
                          <Input
                            id="subject"
                            type="text"
                            {...register("subject")}
                            className="mt-2 text-lg"
                          />
                          {errors.subject && (
                            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="message" className="font-body text-lg text-card-brown">
                            Message
                          </Label>
                          <textarea
                            id="message"
                            {...register("message")}
                            rows={5}
                            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Tell us about your project or ask any questions..."
                          />
                          {errors.message && (
                            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                          )}
                        </div>
                        
                        <Button 
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="w-full bg-card-purple hover:bg-card-purple/90 text-white font-body text-lg py-3 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Message"
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="font-heading text-3xl font-semibold text-card-brown mb-8">
                  Contact Information
                </h2>
                
                <div className="space-y-6">
                  <Card className="border-card-gold/20 bg-card-cream/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-card-gold mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                            Mailing Address
                          </h3>
                          <p className="font-body text-lg text-card-brown/80">Box 1822</p>
                          <p className="font-body text-lg text-card-brown/80">Chetwynd BC V0C 1J0</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-card-gold/20 bg-card-cream/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Phone className="w-6 h-6 text-card-purple mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                            Phone Numbers
                          </h3>
                          <p className="font-body text-lg text-card-brown/80">Home: 250.788.9766</p>
                          <p className="font-body text-lg text-card-brown/80">Cell: 250.401.1958</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-card-gold/20 bg-card-cream/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Mail className="w-6 h-6 text-card-brown mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                            Email
                          </h3>
                          <p className="font-body text-lg text-card-brown/80">rejdoucet@xplornet.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-card-gold/20 bg-card-cream/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Clock className="w-6 h-6 text-card-gold mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-heading text-xl font-semibold text-card-brown mb-2">
                            Business Hours
                          </h3>
                          <p className="font-body text-lg text-card-brown/80">Monday - Friday: 9:00 AM - 5:00 PM</p>
                          <p className="font-body text-lg text-card-brown/80">Saturday: 10:00 AM - 3:00 PM</p>
                          <p className="font-body text-lg text-card-brown/80">Sunday: By appointment</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 p-6 bg-card-cream/50 rounded-lg">
                  <h3 className="font-heading text-xl font-semibold text-card-brown mb-4">
                    Custom Quilt Consultations
                  </h3>
                  <p className="font-body text-lg text-card-brown/80 leading-relaxed">
                    Interested in a custom quilt? Rej offers personal consultations to discuss 
                    your vision, fabric preferences, and timeline. Contact us to schedule 
                    a meeting and bring your dream quilt to life.
                  </p>
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

export default Contact;
