import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter mb-6">
                Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Luxury</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Founded in 2026, LuxeStore was created with one simple mission: to provide unparalleled access to the world's most premium goods, curated for the modern lifestyle.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We believe in quality over quantity, and experiences over transactions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Uncompromising Quality</h3>
              <p className="text-muted-foreground">Every item in our collection is rigorously inspected and sourced from the finest artisans and manufacturers worldwide.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Cutting-Edge Design</h3>
              <p className="text-muted-foreground">We stay ahead of the curve, offering aesthetics that are both timeless and boldly contemporary.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">White-Glove Delivery</h3>
              <p className="text-muted-foreground">Your experience doesn't end at checkout. We ensure your items arrive safely, beautifully packaged, and on time.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-50 py-24 border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to elevate your style?</h2>
            <Link href="/products">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Shop the Collection <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
