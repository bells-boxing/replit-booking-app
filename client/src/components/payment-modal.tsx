import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  membershipType: string;
  price: number;
  description: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  membershipType,
  price,
  description
}: PaymentModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful",
        description: "Your membership has been activated!",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMembershipFeatures = (type: string) => {
    switch (type) {
      case 'basic':
        return [
          '10 Classes per month',
          'Access to group sessions',
          'Basic equipment usage'
        ];
      case 'premium':
        return [
          'Unlimited classes',
          '2 Personal training sessions',
          'Priority booking',
          'Full equipment access'
        ];
      case 'unlimited':
        return [
          'Unlimited classes',
          'Unlimited personal training',
          'Priority booking',
          'Full equipment access',
          'Nutrition consultation'
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bells-dark border-bells-gray text-white max-w-md" data-testid="dialog-payment">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-bells-gold" data-testid="text-payment-title">
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Membership Details */}
          <div className="bg-bells-darker p-4 rounded-lg border border-bells-gray/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white capitalize" data-testid="text-membership-type">
                {membershipType} Membership
              </h4>
              <Badge 
                className={
                  membershipType === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                  membershipType === 'premium' ? 'bg-bells-gold/20 text-bells-gold' :
                  'bg-purple-500/20 text-purple-400'
                }
                data-testid="badge-membership-type"
              >
                {membershipType.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-400 text-sm mb-3" data-testid="text-membership-description">
              {description}
            </p>
            <div className="space-y-2">
              {getMembershipFeatures(membershipType).map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <i className="fas fa-check text-green-400 w-4 mr-2"></i>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subscription:</span>
              <span className="text-white font-medium" data-testid="text-subscription-name">
                {membershipType} Membership
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Billing Cycle:</span>
              <span className="text-white font-medium">Monthly</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tax:</span>
              <span className="text-white font-medium">£0.00</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-bells-gray">
              <span className="text-gray-300">Total:</span>
              <span className="text-bells-gold" data-testid="text-total-amount">
                £{price.toFixed(2)}/month
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-bells-darker p-4 rounded-lg border border-bells-gray/50">
            <h5 className="font-semibold text-white mb-3">Payment Method</h5>
            <div className="flex items-center space-x-3 p-3 bg-bells-dark rounded border border-bells-gray/50">
              <i className="fab fa-stripe text-blue-500 text-xl"></i>
              <div>
                <p className="text-white text-sm font-medium">Secure Payment by Stripe</p>
                <p className="text-gray-400 text-xs">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-bells-gray text-gray-300 hover:bg-bells-gray"
              disabled={isProcessing}
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-bells-gold text-bells-dark hover:bg-bells-amber font-semibold"
              data-testid="button-process-payment"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-bells-dark border-t-transparent rounded-full mr-2" />
                  Processing...
                </div>
              ) : (
                `Pay £${price.toFixed(2)}/month`
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              <i className="fas fa-shield-alt mr-1"></i>
              Your payment is protected by Stripe's advanced security
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
