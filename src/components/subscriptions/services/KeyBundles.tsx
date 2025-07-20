// components/KeyBundles.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface KeyBundle {
  id: string;
  name: string;
  description: string;
  keyCount: number;
  price: number; // in cents
}

export const KeyBundles = () => {
  const [bundles, setBundles] = useState<KeyBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch("/api/key-bundles");
        const data = await response.json();
        if (data.success) {
          setBundles(data.bundles);
        }
      } catch (error) {
        console.error("Error fetching bundles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const initializePayment = async (bundleId: string) => {
    // Initialize Paystack payment
    // This would open Paystack payment modal
    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bundleId }),
    });

    const { data } = await response.json();
    window.location.href = data.authorization_url;
  };

  if (loading) return <div>Loading bundles...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {bundles.map((bundle) => (
        <div key={bundle.id} className="border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold">{bundle.name}</h3>
          <p className="text-gray-600 mt-2">{bundle.description}</p>
          <div className="mt-4">
            <p className="text-2xl font-semibold">
              R{(bundle.price / 100).toFixed(2)}
            </p>
            <p className="text-gray-500">{bundle.keyCount} keys</p>
          </div>
          <Button
            className="mt-6 w-full bg-[#6BADA0] hover:bg-[#5a9c8f]"
            onClick={() => initializePayment(bundle.id)}
          >
            Purchase
          </Button>
        </div>
      ))}
    </div>
  );
};
