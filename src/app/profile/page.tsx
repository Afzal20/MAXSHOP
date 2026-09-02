import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileDashboard } from "./ProfileDashboard";
import { fetchFromAPI } from "@/lib/api";

export const metadata = {
  title: "My Profile - LuxeStore",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const headers = {
    Cookie: `access_token=${token}`,
  };

  try {
    const [profile, orders, addresses] = await Promise.all([
      fetchFromAPI("/accounts/user/profile/", { headers }).catch(() => null),
      fetchFromAPI("/shop/orders/", { headers }).catch(() => []),
      fetchFromAPI("/shop/billing-addresses/", { headers }).catch(() => []),
    ]);

    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        <ProfileDashboard 
          initialProfile={profile} 
          initialOrders={orders} 
          initialAddresses={addresses} 
        />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch profile data:", error);
    // If auth failed drastically, maybe redirect to login
    redirect("/login");
  }
}
