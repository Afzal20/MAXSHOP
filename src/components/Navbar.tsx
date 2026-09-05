"use client";

import Link from "next/link";
import { ShoppingCart, Search, Phone, ChevronDown, User, Lock, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];
  
  if (authRoutes.includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="w-full font-sans bg-white">
      {/* Top Bar (Thin Gray) */}
      <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] text-[13px] text-[#666666]">
        <div className="container mx-auto px-4 flex justify-between items-center h-10">
          <div className="flex items-center">
            <span className="bg-[#f27420] text-white px-2 py-0.5 rounded-sm font-bold text-[11px] mr-2">This Week</span>
            <span>Maecenas faucibus mollis</span>
          </div>
          <div className="flex items-center divide-x divide-[#e5e5e5]">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 flex items-center hover:text-[#e34444] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
              </button>
            ) : (
              <Link href="/login" className="px-4 flex items-center hover:text-[#e34444] transition-colors">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Login
              </Link>
            )}
            <Link href={isLoggedIn ? "/profile" : "/login"} className="px-4 flex items-center hover:text-[#e34444] transition-colors"><User className="w-3.5 h-3.5 mr-1.5"/> My Account <ChevronDown className="w-3 h-3 ml-1" /></Link>
            <Link href="/checkout" className="pl-4 pr-0 flex items-center hover:text-[#e34444] transition-colors">Checkout <ChevronDown className="w-3 h-3 ml-1" /></Link>
          </div>
        </div>
      </div>

      {/* Middle Header */}
      <div className="container mx-auto px-4 py-8 flex justify-between items-center">
        {/* Search Bar Left */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="flex w-full border-2 border-[#e5e5e5] rounded-full overflow-hidden focus-within:border-[#e34444] transition-colors h-11">
            <Link href="/categories" className="flex items-center px-4 bg-gray-50 border-r border-[#e5e5e5] text-sm text-gray-700 font-medium whitespace-nowrap hover:bg-gray-100">
              All Categories <ChevronDown className="w-4 h-4 ml-2" />
            </Link>
            <input 
              type="text" 
              placeholder="Search for products" 
              className="flex-1 px-4 text-sm outline-none"
            />
            <button className="px-5 bg-white text-gray-500 hover:text-[#e34444] transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logo Center */}
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <h1 className="text-4xl font-black tracking-tighter text-[#333333]">
              MAX<span className="text-[#e34444]">SHOP</span>
            </h1>
          </Link>
        </div>

        {/* Hotline Right */}
        <div className="flex-1 flex justify-end items-center">
          <div className="flex items-center text-right">
            <div className="bg-[#e34444] text-white p-2.5 rounded-full mr-3">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider">HOTLINE:</p>
              <p className="text-[#333333] font-bold text-lg leading-tight">(801) 2345 - 6789</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-[#333333] border-b-4 border-[#e34444]">
        <div className="container mx-auto px-4 flex justify-between items-center h-14">
          <div className="flex items-center h-full">
            <Link href="/" className="h-full flex items-center px-6 text-white text-[13px] font-bold hover:bg-[#e34444] transition-colors">HOME</Link>
            <Link href="/products" className="h-full flex items-center px-6 text-white text-[13px] font-bold hover:bg-[#e34444] transition-colors">SHOP</Link>
            <Link href="/categories" className="h-full flex items-center px-6 text-white text-[13px] font-bold hover:bg-[#e34444] transition-colors">CATEGORIES</Link>
          </div>
          
          <Link href="/cart">
            <div className="bg-[#e34444] text-white h-14 flex items-center px-6 cursor-pointer hover:bg-[#cc3a3a] transition-colors">
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className="font-bold text-[13px] mr-2">MY CART</span>
              <div className="bg-[#cc3a3a] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-sm">
                0
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
