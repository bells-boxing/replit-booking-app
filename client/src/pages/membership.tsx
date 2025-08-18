import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import PaymentModal from "@/components/payment-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Membership() {
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments"],
    retry: false,
  });

  const membershipPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 39.99,
      description: 'Perfect for getting started with your fitness journey',
      features: [
        '10 Classes per month',
        'Access to group sessions',
        'Basic equipment usage',
        'Locker room access',
        'Mobile app access'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 89.99,
      description: 'Most popular plan with unlimited access and personal training',
      features: [
        'Unlimited classes',
        '2 Personal training sessions',
        'Priority booking',
        'Full equipment access',
        'Nutrition guidance',
        'Mobile app access'
      ],
      popular: true,
      color: 'gold'
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 149.99,
      description: 'Complete access with unlimited personal training and premium services',
      features: [
        'Unlimited classes',
        'Unlimited personal training',
        'Priority booking',
        'Full equipment access',
        'Nutrition consultation',
        'Recovery sessions',
        'Mobile app access'
      ],
      popular: false,
      color: 'purple'
    }
  ];

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    // Refresh user data to get updated membership
    window.location.reload();
  };

  const currentPlan = membershipPlans.find(plan => plan.id === user?.membershipType) || membershipPlans[0];

  return (
    <div className="min-h-screen bg-bells-darker text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-4" data-testid="text-page-title">
            <span className="text-bells-gold">Membership</span> Plans
          </h1>
          <p className="text-xl text-gray-400 mb-8" data-testid="text-page-subtitle">
            Choose the perfect plan to transform your fitness journey
          </p>
        </div>

        {/* Current Membership Status */}
        {user?.membershipType && (
          <Card className="bg-bells-dark border-bells-gray mb-12" data-testid="card-current-membership">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Current Membership</h3>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={
                        currentPlan.color === 'gold' ? 'bg-bells-gold/20 text-bells-gold' :
                        currentPlan.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }
                      data-testid="badge-current-plan"
                    >
                      {currentPlan.name.toUpperCase()}
                    </Badge>
                    <span className="text-green-400 text-sm font-medium">Active</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Next billing: {user.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString('en-GB') : 'Active'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-bells-gold" data-testid="text-current-price">
                    £{currentPlan.price}/mo
                  </p>
                  <Button variant="outline" className="mt-2 border-bells-gold text-bells-gold hover:bg-bells-gold hover:text-bells-dark" data-testid="button-manage-billing">
                    Manage Billing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {membershipPlans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`bg-bells-dark border-bells-gray relative ${plan.popular ? 'border-bells-gold' : ''} hover:border-bells-gold/50 transition-colors`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-bells-gold text-bells-dark font-semibold px-4 py-1" data-testid="badge-popular">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2" data-testid={`text-plan-name-${plan.id}`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm" data-testid={`text-plan-description-${plan.id}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="text-4xl font-black text-bells-gold mb-2" data-testid={`text-plan-price-${plan.id}`}>
                    £{plan.price}
                  </div>
                  <div className="text-gray-400 text-sm">per month</div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm">
                      <i className="fas fa-check text-green-400 w-4 mr-3"></i>
                      <span className="text-gray-300" data-testid={`text-feature-${plan.id}-${featureIndex}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={user?.membershipType === plan.id}
                  className={
                    user?.membershipType === plan.id 
                      ? "w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                      : plan.popular 
                        ? "w-full bg-bells-gold text-bells-dark hover:bg-bells-amber font-semibold"
                        : "w-full bg-bells-dark border-2 border-bells-gold text-bells-gold hover:bg-bells-gold hover:text-bells-dark font-semibold"
                  }
                  variant={plan.popular ? "default" : "outline"}
                  data-testid={`button-select-plan-${plan.id}`}
                >
                  {user?.membershipType === plan.id ? "Current Plan" : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Billing History */}
        <Card className="bg-bells-dark border-bells-gray" data-testid="card-billing-history">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Billing History</h2>
              <Button variant="ghost" className="text-bells-gold hover:text-bells-amber" data-testid="button-view-all-bills">
                View All
              </Button>
            </div>
            
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-receipt text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Billing History</h3>
                <p className="text-gray-400" data-testid="text-no-payments">
                  Your payment history will appear here once you make your first payment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment: any, index: number) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-bells-darker rounded-lg border border-bells-gray/50" data-testid={`payment-history-${index}`}>
                    <div className="flex items-center space-x-4">
                      <div className="bg-bells-gold/20 p-3 rounded-lg">
                        <i className="fas fa-credit-card text-bells-gold"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white" data-testid={`payment-description-${index}`}>
                          {payment.description}
                        </h4>
                        <p className="text-gray-400 text-sm" data-testid={`payment-date-${index}`}>
                          {new Date(payment.createdAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white" data-testid={`payment-amount-${index}`}>
                        £{payment.amount}
                      </p>
                      <Badge 
                        className={
                          payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          payment.status === 'pending' ? 'bg-bells-gold/20 text-bells-gold' :
                          'bg-red-500/20 text-red-400'
                        }
                        data-testid={`payment-status-${index}`}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stripe Notice */}
            <div className="mt-6 pt-4 border-t border-bells-gray">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fab fa-stripe text-blue-500"></i>
                  <span className="text-sm text-gray-400">All payments securely processed by Stripe</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-green-500"></i>
                  <span className="text-sm text-gray-400">256-bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        membershipType={selectedPlan?.name || ''}
        price={selectedPlan?.price || 0}
        description={selectedPlan?.description || ''}
      />
    </div>
  );
}
