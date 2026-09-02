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
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col border border-[#e5e5e5] bg-white">
          <button 
            className={`flex items-center gap-3 px-6 py-4 text-[13px] font-bold uppercase transition-colors border-b border-[#e5e5e5] ${activeTab === "profile" ? "text-white bg-[#dc3545]" : "text-[#333333] hover:text-[#dc3545]"}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4" /> Account Details
          </button>
          <button 
            className={`flex items-center gap-3 px-6 py-4 text-[13px] font-bold uppercase transition-colors border-b border-[#e5e5e5] ${activeTab === "orders" ? "text-white bg-[#dc3545]" : "text-[#333333] hover:text-[#dc3545]"}`}
            onClick={() => setActiveTab("orders")}
          >
            <Package className="h-4 w-4" /> Order History
          </button>
          <button 
            className={`flex items-center gap-3 px-6 py-4 text-[13px] font-bold uppercase transition-colors border-b border-[#e5e5e5] ${activeTab === "addresses" ? "text-white bg-[#dc3545]" : "text-[#333333] hover:text-[#dc3545]"}`}
            onClick={() => setActiveTab("addresses")}
          >
            <MapPin className="h-4 w-4" /> Saved Addresses
          </button>
          <button 
            className="flex items-center gap-3 px-6 py-4 text-[13px] font-bold uppercase transition-colors text-[#333333] hover:text-[#dc3545]"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" /> {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white p-8 border border-[#e5e5e5]">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-[16px] font-bold uppercase text-[#333333] border-b border-[#e5e5e5] pb-4">Account Details</h2>
            {initialProfile ? (
              <div className="grid gap-4 text-[14px] text-[#666666]">
                <p><strong className="text-[#333333] uppercase text-[12px]">First Name:</strong> {initialProfile.user?.first_name || 'N/A'}</p>
                <p><strong className="text-[#333333] uppercase text-[12px]">Last Name:</strong> {initialProfile.user?.last_name || 'N/A'}</p>
                <p><strong className="text-[#333333] uppercase text-[12px]">Email:</strong> {initialProfile.user?.email}</p>
                <p><strong className="text-[#333333] uppercase text-[12px]">Phone:</strong> {initialProfile.phone_number || 'Not provided'}</p>
              </div>
            ) : (
              <p className="text-[#666666] text-[14px]">Profile information is unavailable.</p>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-[16px] font-bold uppercase text-[#333333] border-b border-[#e5e5e5] pb-4">Order History</h2>
            {initialOrders && initialOrders.length > 0 ? (
              <div className="space-y-4">
                {initialOrders.map((order: any) => (
                  <div key={order.id} className="border border-[#e5e5e5] p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#333333] uppercase text-[14px]">Order #{order.id}</p>
                      <p className="text-[12px] text-[#666666] mt-1">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-[13px] mt-3">
                        Status: <span className="inline-flex items-center bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-1 text-[11px] font-bold uppercase text-[#333333]">{order.ordered ? "Confirmed" : "Pending"}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="font-bold text-[18px] text-[#dc3545]">${order.total_price || "0.00"}</p>
                      <Button variant="outline" size="sm" className="mt-4 rounded-none border-[#e5e5e5] text-[11px] font-bold uppercase text-[#333333] hover:text-[#dc3545] hover:bg-[#f5f5f5]">Track Order</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#f5f5f5] border border-[#e5e5e5]">
                <Package className="h-10 w-10 mx-auto text-[#cccccc] mb-3" />
                <p className="text-[#666666] text-[14px]">You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
              <h2 className="text-[16px] font-bold uppercase text-[#333333]">Saved Addresses</h2>
              <Button size="sm" className="bg-[#dc3545] hover:bg-[#c82333] text-white rounded-none font-bold uppercase text-[11px]">Add New</Button>
            </div>
            {initialAddresses && initialAddresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {initialAddresses.map((address: any) => (
                  <div key={address.id} className="border border-[#e5e5e5] p-6 relative">
                    {address.is_default && (
                      <span className="absolute top-4 right-4 text-[10px] font-bold uppercase bg-[#dc3545] text-white px-2 py-1">Default</span>
                    )}
                    <h3 className="font-bold text-[14px] uppercase text-[#333333] mb-3">{address.first_name} {address.last_name}</h3>
                    <div className="space-y-1 text-[13px] text-[#666666]">
                      <p>{address.street_address}</p>
                      {address.apartment_address && <p>{address.apartment_address}</p>}
                      <p>{address.district?.name}, {address.zip_code}</p>
                      <p className="mt-3 pt-3 border-t border-[#e5e5e5]">{address.phone_number}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#f5f5f5] border border-[#e5e5e5]">
                <MapPin className="h-10 w-10 mx-auto text-[#cccccc] mb-3" />
                <p className="text-[#666666] text-[14px]">No saved addresses found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
