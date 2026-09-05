import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || cookieStore.get("refresh_token")?.value;

  if (token) {
    redirect("/");
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>

      {/* Right side - Image Cover */}
      <div className="hidden lg:block relative w-full h-full">
        <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
          alt="Premium background"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-16 z-20">
          <blockquote className="text-white">
            <p className="text-3xl font-medium mb-4">
              &ldquo;The finest materials. Uncompromising design. LuxeStore elevates your lifestyle to the next level.&rdquo;
            </p>
            <footer className="text-lg text-gray-300">
              - Sofia Rossi, Lead Designer
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
