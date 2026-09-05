import { redirect } from "next/navigation";
import { ProfileDashboard } from "./ProfileDashboard";
import { apiFetch, getAccessToken, getRefreshToken } from "@/lib/auth";

export const metadata = {
  title: "My Account - LuxeStore",
  description: "Manage your profile, order history, addresses, and account security.",
};

export default async function ProfilePage() {
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);

  if (!accessToken && !refreshToken) {
    redirect("/login?redirect=/profile");
  }

  const [profileRes, ordersRes, addressesRes] = await Promise.all([
    apiFetch<any>("/accounts/user/profile/"),
    apiFetch<any[]>("/shop/orders/"),
    apiFetch<any[]>("/shop/billing-addresses/"),
  ]);

  if (!profileRes.ok && profileRes.status === 401) {
    redirect("/login?redirect=/profile");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-[#f5f5f5] py-4 border-b border-[#e5e5e5]">
        <div className="container mx-auto px-4 flex text-[12px] text-[#666666]">
          <a href="/" className="hover:text-[#e34444] transition-colors">
            Home
          </a>
          <span className="mx-2">/</span>
          <span className="text-[#333333] font-medium">My Account</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        <ProfileDashboard
          initialProfile={profileRes.data}
          initialOrders={ordersRes.data || []}
          initialAddresses={addressesRes.data || []}
        />
      </div>
    </div>
  );
}
