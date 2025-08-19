import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Mail, MapPin, User, Phone, Truck, Shield, ArrowLeft, Loader2, Package } from 'lucide-react';
import { processPayment, sendETransferNotification, PaymentData, PaymentResult } from '@/lib/stripe';
import { calculateShippingRates, validatePostalCode, ShippingRate, ShippingAddress } from '@/lib/shipping';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your complete address'),
  city: z.string().min(2, 'Please enter your city'),
  province: z.string().min(2, 'Please enter your province/state'),
  country: z.enum(['CA', 'US']),
  postalCode: z.string(),
  paymentMethod: z.enum(['stripe', 'etransfer']),
  shippingMethod: z.string().optional(),
  specialInstructions: z.string().optional(),
}).refine((data) => validatePostalCode(data.postalCode, data.country), {
  message: 'Please enter a valid postal/ZIP code',
  path: ['postalCode'],
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { state, clearCart } = useCart();
  const { items } = state;
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'stripe',
      country: 'CA',
    },
  });

  const watchedPaymentMethod = watch('paymentMethod');
  const watchedCountry = watch('country');
  const watchedAddress = watch('address');
  const watchedCity = watch('city');
  const watchedProvince = watch('province');
  const watchedPostalCode = watch('postalCode');
  
  const totalPrice = state.total;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = selectedRate ? parseFloat(selectedRate.amount) : 0;
  const subtotalWithShipping = totalPrice + shipping;
  const taxRate = watchedCountry === 'CA' ? 0.12 : 0; // 12% HST/GST for Canada, no tax for US
  const taxes = Math.round(subtotalWithShipping * taxRate * 100) / 100;
  const finalTotal = subtotalWithShipping + taxes;

  // Fetch shipping rates when address is complete
  useEffect(() => {
    const fetchRates = async () => {
      console.log('Checking shipping rate conditions:', {
        watchedAddress,
        watchedCity,
        watchedProvince,
        watchedPostalCode,
        watchedCountry,
        itemsLength: items.length,
        postalCodeValid: validatePostalCode(watchedPostalCode, watchedCountry)
      });
      
      if (
        watchedAddress &&
        watchedCity &&
        watchedProvince &&
        watchedPostalCode &&
        watchedCountry &&
        validatePostalCode(watchedPostalCode, watchedCountry) &&
        items.length > 0
      ) {
        setLoadingRates(true);
        try {
          const shippingAddress: ShippingAddress = {
            name: '', // Will be filled when order is placed
            street1: watchedAddress,
            city: watchedCity,
            state: watchedProvince,
            zip: watchedPostalCode,
            country: watchedCountry,
          };
          
          const rates = await calculateShippingRates(shippingAddress, totalItems);
          console.log('Shipping rates received:', rates);
          setShippingRates(rates);
          
          // Auto-select first rate
          if (rates.length > 0 && !selectedRate) {
            setSelectedRate(rates[0]);
            setValue('shippingMethod', rates[0].object_id);
          }
        } catch (error) {
          console.error('Failed to fetch shipping rates:', error);
        } finally {
          setLoadingRates(false);
        }
      }
    };

    fetchRates();
  }, [watchedAddress, watchedCity, watchedProvince, watchedPostalCode, watchedCountry, totalItems]);

  // Reset payment method when changing country (e-transfer only for Canada)
  useEffect(() => {
    if (watchedCountry === 'US' && watchedPaymentMethod === 'etransfer') {
      setValue('paymentMethod', 'stripe');
    }
  }, [watchedCountry, watchedPaymentMethod, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!selectedRate) {
      alert('Please wait for shipping rates to load or select a shipping method.');
      return;
    }

    setIsProcessing(true);

    try {
      const newOrderNumber = `SV${Date.now().toString().slice(-6)}`;
      
      if (data.paymentMethod === 'stripe') {
        // Process Stripe payment
        const paymentData: PaymentData = {
          amount: Math.round(finalTotal * 100), // Convert to cents
          currency: 'cad',
          description: `Scenic Valley Quilts Order ${newOrderNumber}`,
          customerEmail: data.email,
          customerName: `${data.firstName} ${data.lastName}`,
          shippingAddress: {
            line1: data.address,
            city: data.city,
            state: data.province,
            postal_code: data.postalCode,
            country: data.country,
          },
        };

        const result: PaymentResult = await processPayment(paymentData);
        
        if (result.success) {
          // TODO: Generate shipping label with selectedRate.object_id
          setOrderNumber(newOrderNumber);
          setOrderComplete(true);
          clearCart();
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } else {
        // Handle e-transfer option (Canada only)
        await sendETransferNotification({
          orderNumber: newOrderNumber,
          customerEmail: data.email,
          customerName: `${data.firstName} ${data.lastName}`,
          amount: finalTotal,
        });
        
        setOrderNumber(newOrderNumber);
        setOrderComplete(true);
        clearCart();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen font-body text-xl">
        <Header />
        <div className="bg-card-cream py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-heading font-semibold mb-4">Your cart is empty</h1>
              <p className="text-lg mb-8">Add some beautiful quilts to your cart before checking out.</p>
              <Button onClick={() => navigate('/shop')} className="bg-card-purple hover:bg-card-purple/90">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen font-body text-xl">
        <Header />
        <div className="bg-card-cream py-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-heading">Order Confirmed!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg">Thank you for your order!</p>
                <div className="bg-card-cream p-4 rounded-lg">
                  <p className="font-semibold">Order Number: {orderNumber}</p>
                </div>
                
                {watchedPaymentMethod === 'etransfer' && (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Next Steps for Interac e-Transfer Payment:</strong>
                      <br />
                      Please send your e-transfer of <strong>${finalTotal.toFixed(2)} CAD</strong> to:
                      <br />
                      <strong>payments@scenicvalleyquilts.ca</strong>
                      <br />
                      Use your order number <strong>{orderNumber}</strong> as the security question answer.
                      <br />
                      We'll begin processing your order once payment is received!
                    </AlertDescription>
                  </Alert>
                )}
                
                <p className="text-gray-600">
                  You will receive a confirmation email shortly with your order details and tracking information.
                </p>
                
                <div className="flex gap-4 justify-center pt-4">
                  <Button onClick={() => navigate('/shop')} variant="outline">
                    Continue Shopping
                  </Button>
                  <Button onClick={() => navigate('/')} className="bg-card-purple hover:bg-card-purple/90">
                    Return Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body text-xl">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-card-cream to-card-gold/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-semibold text-card-brown mb-6">
              Checkout
            </h1>
            <p className="font-body text-xl text-card-brown/80 leading-relaxed">
              Complete your order for beautiful handcrafted quilts
            </p>
          </div>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-card-brown hover:bg-card-brown/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Checkout Form */}
              <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            {...register('firstName')}
                            className={errors.firstName ? 'border-red-500' : ''}
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            {...register('lastName')}
                            className={errors.lastName ? 'border-red-500' : ''}
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={watchedCountry}
                          onValueChange={(value) => setValue('country', value as 'CA' | 'US')}
                        >
                          <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          {...register('address')}
                          className={errors.address ? 'border-red-500' : ''}
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            {...register('city')}
                            className={errors.city ? 'border-red-500' : ''}
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="province">
                            {watchedCountry === 'CA' ? 'Province' : 'State'} *
                          </Label>
                          <Input
                            id="province"
                            {...register('province')}
                            placeholder={watchedCountry === 'CA' ? 'e.g., BC, ON' : 'e.g., WA, CA'}
                            className={errors.province ? 'border-red-500' : ''}
                          />
                          {errors.province && (
                            <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="postalCode">
                          {watchedCountry === 'CA' ? 'Postal Code' : 'ZIP Code'} *
                        </Label>
                        <Input
                          id="postalCode"
                          {...register('postalCode')}
                          placeholder={watchedCountry === 'CA' ? 'A1A 1A1' : '12345'}
                          className={errors.postalCode ? 'border-red-500' : ''}
                        />
                        {errors.postalCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={watchedPaymentMethod}
                        onValueChange={(value) => register('paymentMethod').onChange({ target: { value } })}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="stripe" id="stripe" />
                          <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                            <CreditCard className="w-5 h-5" />
                            Credit Card (Secure with Stripe)
                          </Label>
                        </div>
                        
                        <div className={`flex items-center space-x-2 p-4 border rounded-lg ${watchedCountry === 'US' ? 'opacity-50' : ''}`}>
                          <RadioGroupItem value="etransfer" id="etransfer" disabled={watchedCountry === 'US'} />
                          <Label htmlFor="etransfer" className="flex items-center gap-2 cursor-pointer">
                            <Mail className="w-5 h-5" />
                            Interac e-Transfer (Canadian customers only)
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {watchedPaymentMethod === 'etransfer' && (
                        <Alert className="mt-4">
                          <Mail className="h-4 w-4" />
                          <AlertDescription>
                            After placing your order, you'll receive instructions to send an Interac e-Transfer 
                            to complete your payment. Your order will be processed once payment is received.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shipping Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Shipping Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingRates ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="w-6 h-6 animate-spin text-card-purple" />
                          <span className="ml-2">Calculating shipping rates...</span>
                        </div>
                      ) : shippingRates.length > 0 ? (
                        <RadioGroup
                          value={selectedRate?.object_id || ''}
                          onValueChange={(value) => {
                            const rate = shippingRates.find(r => r.object_id === value);
                            if (rate) {
                              setSelectedRate(rate);
                              setValue('shippingMethod', rate.object_id);
                            }
                          }}
                          className="space-y-4"
                        >
                          {shippingRates.map((rate) => (
                            <div key={rate.object_id} className="flex items-center space-x-2 p-4 border rounded-lg">
                              <RadioGroupItem value={rate.object_id} id={rate.object_id} />
                              <Label htmlFor={rate.object_id} className="flex-1 cursor-pointer">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{rate.service_level}</div>
                                    <div className="text-sm text-gray-600">
                                      {rate.provider} • Estimated {rate.estimated_days} business days
                                    </div>
                                  </div>
                                  <div className="font-semibold">${rate.amount} CAD</div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Alert>
                          <MapPin className="h-4 w-4" />
                          <AlertDescription>
                            Please complete your shipping address above to see available shipping options.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Special Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Special Instructions (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        {...register('specialInstructions')}
                        placeholder="Any special delivery instructions or notes..."
                        rows={3}
                      />
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    className="w-full bg-card-purple hover:bg-card-purple/90 text-white py-3 text-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Complete Order - $${finalTotal.toFixed(2)} CAD`}
                  </Button>
                </form>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Order Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Shipping</span>
                        <div className="text-right">
                          {selectedRate ? (
                            <div>
                              <span>${shipping.toFixed(2)}</span>
                              <p className="text-xs text-gray-600">{selectedRate.service_level.split('(')[0].trim()}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Select shipping method</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>{watchedCountry === 'CA' ? 'Taxes (HST/GST)' : 'Taxes'}</span>
                        <span>${taxes.toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)} CAD</span>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-card-cream p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-card-purple" />
                        <span className="font-medium text-sm">Shipping Information</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        • Ships from Chetwynd, British Columbia<br />
                        • {watchedCountry === 'CA' ? 'Canada Post' : 'USPS'} shipping<br />
                        • Each quilt ships in a 24"×24"×12" box<br />
                        • Shipping label printed for easy drop-off
                      </p>
                    </div>

                    {/* Security Badge */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm text-green-800">Secure Checkout</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout; 