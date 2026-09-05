"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  KeyRound,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  Home,
  ShoppingBag,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfileData {
  id?: number;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  district?: string | null;
  upozila?: string | null;
  city?: string | null;
  address?: string | null;
  profile_image?: string | null;
  created_at?: string;
}

interface OrderItem {
  id: number;
  ordered?: boolean;
  delivered?: boolean;
  total_price?: string | number;
  created_at?: string;
  items?: any[];
}

interface BillingAddress {
  id: number;
  first_name?: string;
  last_name?: string;
  street_address?: string;
  apartment_address?: string;
  city?: string;
  district?: { name: string } | string;
  zip?: string;
  zip_code?: string;
  country?: string;
  phone_number?: string;
  is_default?: boolean;
}

type TabType = "dashboard" | "profile" | "orders" | "addresses" | "security";

interface Props {
  initialProfile: UserProfileData | null;
  initialOrders: OrderItem[];
  initialAddresses: BillingAddress[];
}

export function ProfileDashboard({
  initialProfile,
  initialOrders,
  initialAddresses,
}: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [profile, setProfile] = useState<UserProfileData>(initialProfile || {});
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders || []);
  const [addresses, setAddresses] = useState<BillingAddress[]>(initialAddresses || []);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    phone_number: profile.phone_number || "",
    city: profile.city || "",
    district: profile.district || "",
    address: profile.address || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    street_address: "",
    apartment_address: "",
    city: "",
    zip_code: "",
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logout State
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email?.split("@")[0] ||
    "Customer";

  const userInitials =
    [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join("").toUpperCase() ||
    displayName.slice(0, 2).toUpperCase();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to update profile.");
      }

      setProfile((prev) => ({ ...prev, ...data }));
      setProfileMessage({ type: "success", text: "Profile details updated successfully." });
      router.refresh();
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMessage(null);

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to save address.");
      }

      setAddresses((prev) => [...prev, data]);
      setAddressMessage({ type: "success", text: "New address added successfully." });
      setShowAddressForm(false);
      setAddressForm({
        first_name: "",
        last_name: "",
        phone_number: "",
        street_address: "",
        apartment_address: "",
        city: "",
        zip_code: "",
      });
      router.refresh();
    } catch (err: any) {
      setAddressMessage({ type: "error", text: err.message || "Failed to save address." });
    } finally {
      setAddressSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to change password.");
      }

      setPasswordMessage({ type: "success", text: "Password changed successfully." });
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Profile Banner */}
      <div className="bg-white border border-[#e5e5e5] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#e34444] text-white flex items-center justify-center font-black text-xl tracking-wider shadow-md">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#333333]">{displayName}</h1>
                <span className="bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-xs text-[#666666] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {profile.email || "Email address verified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 divide-x divide-[#e5e5e5]">
            <div className="px-3 text-center">
              <p className="text-2xl font-black text-[#e34444]">{orders.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-[#666666] font-semibold">Orders</p>
            </div>
            <div className="px-3 text-center">
              <p className="text-2xl font-black text-[#333333]">{addresses.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-[#666666] font-semibold">Addresses</p>
            </div>
            <div className="pl-3">
              <Link
                href="/cart"
                className="bg-[#f5f5f5] hover:bg-gray-200 border border-[#e5e5e5] text-[#333333] px-4 py-2 text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col border border-[#e5e5e5] bg-white divide-y divide-[#e5e5e5] shadow-sm">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold uppercase transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#e34444] text-white"
                  : "text-[#333333] hover:text-[#e34444] hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold uppercase transition-colors ${
                activeTab === "profile"
                  ? "bg-[#e34444] text-white"
                  : "text-[#333333] hover:text-[#e34444] hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4" /> Personal Details
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold uppercase transition-colors ${
                activeTab === "orders"
                  ? "bg-[#e34444] text-white"
                  : "text-[#333333] hover:text-[#e34444] hover:bg-gray-50"
              }`}
            >
              <Package className="h-4 w-4" /> Order History
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold uppercase transition-colors ${
                activeTab === "addresses"
                  ? "bg-[#e34444] text-white"
                  : "text-[#333333] hover:text-[#e34444] hover:bg-gray-50"
              }`}
            >
              <MapPin className="h-4 w-4" /> Saved Addresses
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold uppercase transition-colors ${
                activeTab === "security"
                  ? "bg-[#e34444] text-white"
                  : "text-[#333333] hover:text-[#e34444] hover:bg-gray-50"
              }`}
            >
              <KeyRound className="h-4 w-4" /> Security
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold uppercase transition-colors text-[#333333] hover:text-[#e34444] hover:bg-gray-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" /> {isLoggingOut ? "Logging out..." : "Log Out"}
            </button>
          </nav>
        </aside>

        {/* Right Content Panel */}
        <main className="flex-1 bg-white p-6 sm:p-8 border border-[#e5e5e5] shadow-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="border-b border-[#e5e5e5] pb-4">
                <h2 className="text-lg font-bold uppercase text-[#333333]">Account Overview</h2>
                <p className="text-xs text-[#666666] mt-1">
                  Manage your personal details, review past purchases, and update your password.
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-[#e5e5e5] p-5 bg-[#fafafa]">
                  <p className="text-xs uppercase font-bold text-[#666666]">Total Orders</p>
                  <p className="text-2xl font-black text-[#e34444] mt-2">{orders.length}</p>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-[#e34444] hover:underline font-bold mt-3 inline-flex items-center gap-1"
                  >
                    View Orders <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="border border-[#e5e5e5] p-5 bg-[#fafafa]">
                  <p className="text-xs uppercase font-bold text-[#666666]">Saved Addresses</p>
                  <p className="text-2xl font-black text-[#333333] mt-2">{addresses.length}</p>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className="text-xs text-[#e34444] hover:underline font-bold mt-3 inline-flex items-center gap-1"
                  >
                    Manage Addresses <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="border border-[#e5e5e5] p-5 bg-[#fafafa]">
                  <p className="text-xs uppercase font-bold text-[#666666]">Security</p>
                  <p className="text-sm font-bold text-green-600 mt-3 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Password Protected
                  </p>
                  <button
                    onClick={() => setActiveTab("security")}
                    className="text-xs text-[#e34444] hover:underline font-bold mt-3 inline-flex items-center gap-1"
                  >
                    Change Password <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Profile Summary Card */}
              <div className="border border-[#e5e5e5] p-5">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3 mb-4">
                  <h3 className="font-bold text-sm text-[#333333] uppercase">Profile Snapshot</h3>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="text-xs text-[#e34444] font-bold hover:underline"
                  >
                    Edit Details
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#666666]">
                  <div>
                    <span className="font-bold text-[#333333] uppercase block text-[11px]">Full Name:</span>
                    <span className="text-sm text-[#333333]">{displayName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#333333] uppercase block text-[11px]">Email:</span>
                    <span className="text-sm text-[#333333]">{profile.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#333333] uppercase block text-[11px]">Phone:</span>
                    <span>{profile.phone_number || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#333333] uppercase block text-[11px]">City / Location:</span>
                    <span>{[profile.city, profile.district].filter(Boolean).join(", ") || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL DETAILS */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="border-b border-[#e5e5e5] pb-4">
                <h2 className="text-lg font-bold uppercase text-[#333333]">Personal Information</h2>
                <p className="text-xs text-[#666666] mt-1">
                  Keep your account and shipping details up to date.
                </p>
              </div>

              {profileMessage && (
                <div
                  className={`p-3 rounded text-xs flex items-center gap-2 ${
                    profileMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      placeholder="e.g. Afzal"
                      className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      placeholder="e.g. Hossen"
                      className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                      Email Address (Login ID)
                    </label>
                    <input
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="w-full h-10 px-3 text-sm border border-[#e5e5e5] bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone_number}
                      onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                      placeholder="e.g. +880 1700 000000"
                      className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="e.g. Dhaka"
                      className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                      District
                    </label>
                    <input
                      type="text"
                      value={profileForm.district}
                      onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                      placeholder="e.g. Dhaka"
                      className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                    Street Address
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="House, road, area details..."
                    className="w-full p-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-[#e34444] hover:bg-[#cc3a3a] text-white rounded-none font-bold uppercase text-xs px-6 h-10"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="border-b border-[#e5e5e5] pb-4">
                <h2 className="text-lg font-bold uppercase text-[#333333]">Order History</h2>
                <p className="text-xs text-[#666666] mt-1">
                  View and track all your previous purchases and orders.
                </p>
              </div>

              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[#e5e5e5] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white"
                    >
                      <div>
                        <p className="font-bold text-[#333333] uppercase text-sm">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-[#666666] mt-1">
                          Placed on: {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Recent"}
                        </p>
                        <div className="mt-2.5 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase border ${
                              order.ordered
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {order.ordered ? "Confirmed" : "Processing"}
                          </span>
                          {order.delivered && (
                            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                              Delivered
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right flex flex-col items-start sm:items-end gap-2">
                        <p className="font-black text-xl text-[#e34444]">
                          ${order.total_price || "0.00"}
                        </p>
                        <Link
                          href="/products"
                          className="bg-[#f5f5f5] hover:bg-gray-200 border border-[#e5e5e5] text-[#333333] px-3 py-1.5 text-[11px] font-bold uppercase transition-colors"
                        >
                          Buy Again
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#fafafa] border border-[#e5e5e5]">
                  <Package className="h-10 w-10 mx-auto text-[#cccccc] mb-3" />
                  <p className="text-sm font-bold text-[#333333]">No orders yet</p>
                  <p className="text-xs text-[#666666] mt-1 mb-4">
                    Explore our collection and find your favorite items.
                  </p>
                  <Link
                    href="/products"
                    className="inline-block bg-[#e34444] hover:bg-[#cc3a3a] text-white px-5 py-2 text-xs font-bold uppercase transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
                <div>
                  <h2 className="text-lg font-bold uppercase text-[#333333]">Saved Addresses</h2>
                  <p className="text-xs text-[#666666] mt-1">
                    Manage shipping and billing addresses for quick checkout.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-[#e34444] hover:bg-[#cc3a3a] text-white rounded-none font-bold uppercase text-xs h-9 px-4 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddressForm ? "Cancel" : "Add Address"}
                </Button>
              </div>

              {addressMessage && (
                <div
                  className={`p-3 rounded text-xs flex items-center gap-2 ${
                    addressMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {addressMessage.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{addressMessage.text}</span>
                </div>
              )}

              {/* Add New Address Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleAddressSubmit}
                  className="border border-[#e5e5e5] bg-[#fafafa] p-5 space-y-4"
                >
                  <h3 className="text-xs font-bold uppercase text-[#333333]">New Address Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.first_name}
                        onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })}
                        className="w-full h-9 px-3 text-xs border border-[#e5e5e5] outline-none focus:border-[#e34444] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.last_name}
                        onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })}
                        className="w-full h-9 px-3 text-xs border border-[#e5e5e5] outline-none focus:border-[#e34444] bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.street_address}
                      onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                      placeholder="Street name, house number, area..."
                      className="w-full h-9 px-3 text-xs border border-[#e5e5e5] outline-none focus:border-[#e34444] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="e.g. Dhaka"
                        className="w-full h-9 px-3 text-xs border border-[#e5e5e5] outline-none focus:border-[#e34444] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1">
                        Postal / Zip Code
                      </label>
                      <input
                        type="text"
                        value={addressForm.zip_code}
                        onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                        placeholder="e.g. 1200"
                        className="w-full h-9 px-3 text-xs border border-[#e5e5e5] outline-none focus:border-[#e34444] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.phone_number}
                        onChange={(e) => setAddressForm({ ...addressForm, phone_number: e.target.value })}
                        placeholder="e.g. 01700000000"
                        className="w-full h-9 px-3 text-xs border border-[#e5e5e5] outline-none focus:border-[#e34444] bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={addressSaving}
                      className="bg-[#e34444] hover:bg-[#cc3a3a] text-white rounded-none font-bold uppercase text-xs h-9 px-5"
                    >
                      {addressSaving ? "Saving..." : "Save Address"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-xs text-[#666666] hover:underline font-medium px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              {addresses && addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border border-[#e5e5e5] p-5 relative bg-white shadow-sm"
                    >
                      {addr.is_default && (
                        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase bg-[#e34444] text-white px-2 py-0.5">
                          Default
                        </span>
                      )}
                      <h3 className="font-bold text-sm uppercase text-[#333333] mb-2 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-[#e34444]" />
                        {addr.first_name || addr.last_name
                          ? `${addr.first_name || ""} ${addr.last_name || ""}`.trim()
                          : `Address #${addr.id}`}
                      </h3>
                      <div className="space-y-1 text-xs text-[#666666]">
                        <p className="font-medium text-[#333333]">{addr.street_address}</p>
                        {addr.apartment_address && <p>{addr.apartment_address}</p>}
                        <p>
                          {[
                            addr.city,
                            typeof addr.district === "object" ? addr.district?.name : addr.district,
                            addr.country,
                            addr.zip || addr.zip_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {addr.phone_number && (
                          <p className="mt-2 pt-2 border-t border-[#f0f0f0] flex items-center gap-1 text-[#333333]">
                            <Phone className="w-3 h-3 text-gray-400" /> {addr.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#fafafa] border border-[#e5e5e5]">
                  <MapPin className="h-10 w-10 mx-auto text-[#cccccc] mb-3" />
                  <p className="text-sm font-bold text-[#333333]">No saved addresses</p>
                  <p className="text-xs text-[#666666] mt-1">
                    Add an address to make checkout faster on future orders.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-[#e5e5e5] pb-4">
                <h2 className="text-lg font-bold uppercase text-[#333333]">Account Security</h2>
                <p className="text-xs text-[#666666] mt-1">
                  Change your password and keep your account protected.
                </p>
              </div>

              {passwordMessage && (
                <div
                  className={`p-3 rounded text-xs flex items-center gap-2 ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#333333] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-[#e5e5e5] outline-none focus:border-[#e34444] transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-[#e34444] hover:bg-[#cc3a3a] text-white rounded-none font-bold uppercase text-xs px-6 h-10"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
