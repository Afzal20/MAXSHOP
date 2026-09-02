import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your order. We have received your payment and are processing your order right now.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full rounded-full h-14 text-base font-semibold shadow-lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
