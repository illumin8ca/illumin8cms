import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

// Prevent Stripe() IntegrationError when key is missing in local dev.
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

export interface PaymentData {
  amount: number; // in cents
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

// Simulate payment processing for now
export const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
  try {
    // For demo purposes, we'll simulate a successful payment
    // In production, this would make an API call to your backend
    // which would create a payment intent with Stripe
    
    console.log('Processing payment:', paymentData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful payment (90% success rate for demo)
    const isSuccessful = Math.random() > 0.1;
    
    if (isSuccessful) {
      return {
        success: true,
        paymentIntentId: `pi_demo_${Date.now()}`,
      };
    } else {
      return {
        success: false,
        error: 'Your card was declined. Please try a different payment method.',
      };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

// Real Stripe integration function (for future implementation)
export const processRealStripePayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe not configured in this environment.'
      };
    }

    // This would typically call your backend API to create a payment intent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const { client_secret } = await response.json();

    // Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: paymentIntent?.status === 'succeeded',
      paymentIntentId: paymentIntent?.id,
    };
  } catch (error) {
    console.error('Real Stripe payment error:', error);
    return {
      success: false,
      error: 'Payment processing failed. Please try again.',
    };
  }
};

// Email notification service for e-transfers
export const sendETransferNotification = async (orderData: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  amount: number;
}) => {
  try {
    // This would typically call your backend API to send an email
    console.log('Sending e-transfer notification:', orderData);
    
    // For now, we'll just log it
    // In production, this would call your email service or backend API
    return { success: true };
  } catch (error) {
    console.error('Failed to send e-transfer notification:', error);
    return { success: false, error: 'Failed to send notification email' };
  }
};

export default stripePromise; 