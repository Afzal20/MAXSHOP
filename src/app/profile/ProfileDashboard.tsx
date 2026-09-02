"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  initialProfile: any;
  initialOrders: any[];
  initialAddresses: any[];
};

export function ProfileDashboard({ initialProfile, initialOrders, initialAddresses }: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col gap-2">
          <Button 
            variant={activeTab === "profile" ? "default" : "ghost"} 
            className="justify-start gap-3"
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4" /> Account Details
          </Button>
          <Button 
            variant={activeTab === "orders" ? "default" : "ghost"} 
            className="justify-start gap-3"
            onClick={() => setActiveTab("orders")}
          >
            <Package className="h-4 w-4" /> Order History
          </Button>
          <Button 
            variant={activeTab === "addresses" ? "default" : "ghost"} 
            className="justify-start gap-3"
            onClick={() => setActiveTab("addresses")}
          >
            <MapPin className="h-4 w-4" /> Saved Addresses
          </Button>
          <hr className="my-2" />
          <Button 
            variant="ghost" 
            className="justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" /> {isLoggingOut ? "Logging out..." : "Log Out"}
          </Button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Account Details</h2>
            {initialProfile ? (
              <div className="grid gap-4">
                <p><strong>First Name:</strong> {initialProfile.user?.first_name || 'N/A'}</p>
                <p><strong>Last Name:</strong> {initialProfile.user?.last_name || 'N/A'}</p>
                <p><strong>Email:</strong> {initialProfile.user?.email}</p>
                <p><strong>Phone:</strong> {initialProfile.phone_number || 'Not provided'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Profile information is unavailable.</p>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Order History</h2>
            {initialOrders && initialOrders.length > 0 ? (
              <div className="space-y-4">
                {initialOrders.map((order: any) => (
                  <div key={order.id} className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-sm mt-2">
                        Status: <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{order.ordered ? "Confirmed" : "Pending"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${order.total_price || "0.00"}</p>
                      <Button variant="outline" size="sm" className="mt-2">Track Order</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Saved Addresses</h2>
              <Button size="sm">Add New Address</Button>
            </div>
            {initialAddresses && initialAddresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {initialAddresses.map((address: any) => (
                  <div key={address.id} className="border rounded-xl p-4 relative">
                    {address.is_default && (
                      <span className="absolute top-4 right-4 text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">Default</span>
                    )}
                    <h3 className="font-semibold mb-2">{address.first_name} {address.last_name}</h3>
                    <p className="text-sm text-gray-600">{address.street_address}</p>
                    {address.apartment_address && <p className="text-sm text-gray-600">{address.apartment_address}</p>}
                    <p className="text-sm text-gray-600">{address.district?.name}, {address.zip_code}</p>
                    <p className="text-sm text-gray-600 mt-2">{address.phone_number}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-muted-foreground">No saved addresses found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
