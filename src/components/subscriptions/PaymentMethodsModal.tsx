import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
  onPlanChange: (planId: string) => void;
}

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onPlanChange,
}) => {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    zipCode: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Store payment method (in real app, this would be handled securely)
      const paymentMethod = {
        id: Date.now().toString(),
        last4: formData.cardNumber.slice(-4),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cardholderName: formData.cardholderName,
        isDefault: true,
        createdAt: new Date().toISOString(),
      };

      const existingPaymentMethods = JSON.parse(
        localStorage.getItem("apevenues_payment_methods") || "[]"
      );
      existingPaymentMethods.push(paymentMethod);
      localStorage.setItem(
        "apevenues_payment_methods",
        JSON.stringify(existingPaymentMethods)
      );

      if (selectedPlan) {
        onPlanChange(selectedPlan);
        toast({
          title: "Subscription Updated!",
          description: "Your subscription plan has been successfully updated.",
        });
      } else {
        toast({
          title: "Payment Method Added!",
          description: "Your payment method has been successfully added.",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
          </DialogTitle>
          <DialogDescription>
            {selectedPlan
              ? "Add payment method to upgrade your plan"
              : "Add a new payment method"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name *</Label>
            <Input
              id="cardholderName"
              value={formData.cardholderName}
              onChange={(e) =>
                handleInputChange("cardholderName", e.target.value)
              }
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="expiryMonth">Month *</Label>
              <Select
                value={formData.expiryMonth}
                onValueChange={(value) =>
                  handleInputChange("expiryMonth", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem
                      key={i + 1}
                      value={String(i + 1).padStart(2, "0")}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiryYear">Year *</Label>
              <Select
                value={formData.expiryYear}
                onValueChange={(value) =>
                  handleInputChange("expiryYear", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="YY" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={String(year).slice(-2)}>
                        {String(year).slice(-2)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="billingAddress">Billing Address *</Label>
            <Input
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) =>
                handleInputChange("billingAddress", e.target.value)
              }
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="New York"
                required
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="10001"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Lock className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              Your payment information is secure and encrypted
            </span>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-[#6BADA0] hover:bg-[#8E9196]"
            >
              {isProcessing
                ? "Processing..."
                : selectedPlan
                ? "Upgrade Plan"
                : "Add Payment Method"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodsModal;
