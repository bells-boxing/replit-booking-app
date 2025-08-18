import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ 
  amount, 
  description, 
  onSuccess 
}: { 
  amount: number; 
  description: string; 
  onSuccess: () => void; 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <Card className="bg-bells-dark border-bells-gray" data-testid="card-payment-form">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{description}</span>
            <span className="text-2xl font-bold text-bells-gold" data-testid="text-payment-amount">
              £{amount.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-bells-darker p-4 rounded-lg border border-bells-gray/50">
            <PaymentElement 
              options={{
                style: {
                  base: {
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    '::placeholder': {
                      color: '#6b7280',
                    },
                  },
                },
              }}
            />
          </div>

          <Button 
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-bells-gold text-bells-dark hover:bg-bells-amber font-bold py-3"
            data-testid="button-complete-payment"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-bells-dark border-t-transparent rounded-full mr-2" />
                Processing Payment...
              </div>
            ) : (
              `Complete Payment - £${amount.toFixed(2)}`
            )}
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <i className="fas fa-shield-alt mr-1"></i>
                SSL Encrypted
              </div>
              <div className="flex items-center">
                <i className="fab fa-stripe mr-1"></i>
                Powered by Stripe
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentType, setPaymentType] = useState<'membership' | 'session'>('membership');
  const [amount, setAmount] = useState(89.99);
  const [description, setDescription] = useState("Premium Membership");

  useEffect(() => {
    // Get payment intent from URL params or default to membership
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') as 'membership' | 'session' || 'membership';
    const amountParam = urlParams.get('amount');
    const descParam = urlParams.get('description');

    setPaymentType(type);
    if (amountParam) setAmount(parseFloat(amountParam));
    if (descParam) setDescription(descParam);

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        let endpoint = '/api/create-payment-intent';
        let body: any = { amount, description };

        if (type === 'membership') {
          endpoint = '/api/create-subscription';
          body = {};
        }

        const response = await apiRequest("POST", endpoint, body);
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast({
          title: "Setup Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    createPaymentIntent();
  }, [amount, description, toast]);

  const handlePaymentSuccess = () => {
    // Redirect to dashboard after successful payment
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-bells-darker text-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-bells-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Setting up payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bells-darker text-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-4" data-testid="text-checkout-title">
            Complete Your <span className="text-bells-gold">Purchase</span>
          </h1>
          <p className="text-xl text-gray-400" data-testid="text-checkout-subtitle">
            Secure checkout powered by Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-bells-dark border-bells-gray" data-testid="card-order-summary">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-bells-darker rounded-lg border border-bells-gray/50">
                    <div className="bg-bells-gold/20 p-3 rounded-lg">
                      <i className={`fas ${paymentType === 'membership' ? 'fa-crown' : 'fa-user-plus'} text-bells-gold text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white" data-testid="text-order-item">
                        {description}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {paymentType === 'membership' ? 'Monthly subscription' : 'One-time payment'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-bells-gold" data-testid="text-order-amount">
                        £{amount.toFixed(2)}
                      </p>
                      {paymentType === 'membership' && (
                        <p className="text-gray-400 text-sm">/month</p>
                      )}
                    </div>
                  </div>

                  {paymentType === 'membership' && (
                    <div className="space-y-2 p-4 bg-bells-darker rounded-lg border border-bells-gray/50">
                      <h5 className="font-semibold text-white mb-2">What's included:</h5>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <i className="fas fa-check text-green-400 w-4 mr-2"></i>
                          <span className="text-gray-300">Unlimited classes</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <i className="fas fa-check text-green-400 w-4 mr-2"></i>
                          <span className="text-gray-300">2 Personal training sessions</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <i className="fas fa-check text-green-400 w-4 mr-2"></i>
                          <span className="text-gray-300">Priority booking</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <i className="fas fa-check text-green-400 w-4 mr-2"></i>
                          <span className="text-gray-300">Full equipment access</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-bells-gray pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white">£{amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax:</span>
                      <span className="text-gray-400">£0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t border-bells-gray mt-2">
                      <span className="text-white">Total:</span>
                      <span className="text-bells-gold">£{amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="bg-bells-dark border-bells-gray" data-testid="card-customer-info">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Customer Information</h3>
                <div className="flex items-center space-x-4 p-4 bg-bells-darker rounded-lg border border-bells-gray/50">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <i className="fas fa-user text-blue-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white" data-testid="text-customer-name">
                      {user?.firstName} {user?.lastName}
                    </h4>
                    <p className="text-gray-400 text-sm" data-testid="text-customer-email">
                      {user?.email}
                    </p>
                    <Badge className="mt-1 bg-bells-gold/20 text-bells-gold">
                      {user?.membershipType || 'basic'} Member
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#ffd700',
                    colorBackground: '#1a1a1a',
                    colorText: '#ffffff',
                    colorDanger: '#ff6b6b',
                  },
                },
              }}
            >
              <CheckoutForm 
                amount={amount}
                description={description}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 text-center">
          <Card className="bg-bells-dark border-bells-gray" data-testid="card-security-notice">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <i className="fas fa-shield-alt text-green-500 mr-2"></i>
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center">
                  <i className="fab fa-stripe text-blue-500 mr-2"></i>
                  <span>Secure Payment Processing</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-lock text-bells-gold mr-2"></i>
                  <span>PCI DSS Compliant</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Your payment information is encrypted and never stored on our servers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
