"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { NewArrivalBanner, NewArrivalBannerImage } from "@/lib/types";
import { toAbsoluteUrl } from "@/lib/media";

interface Props {
  banner?: NewArrivalBanner | null;
}

const DEFAULT_BANNER: NewArrivalBanner = {
  title: "NEW ARRIVALS",
  subtitle: "Curabitur luctus ipsum eget convallis",
  discount_percent: "50%",
  discount_text: "ON ALL PRODUCTS",
  images: [
    {
      id: 1,
      image_name: "Modern Tablet & Gadget Showcase",
      image_url:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2027&auto=format&fit=crop",
      final_image_url:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2027&auto=format&fit=crop",
      link_url: "/products",
      order: 0,
    },
  ],
};

export function NewArrivalsBanner({ banner }: Props) {
  const activeBanner = banner || DEFAULT_BANNER;
  const rawImages =
    activeBanner.images && activeBanner.images.length > 0
      ? activeBanner.images
      : DEFAULT_BANNER.images;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalImages = rawImages.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  useEffect(() => {
    if (totalImages <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [totalImages, isPaused, nextSlide]);

  const currentImage: NewArrivalBannerImage = rawImages[currentIndex] || rawImages[0];
  const currentImageUrl = toAbsoluteUrl(
    currentImage.final_image_url || currentImage.image || currentImage.image_url
  );

  return (
    <div className="bg-[#e34444] flex flex-col md:flex-row text-white border-b-4 border-[#cc3a3a] overflow-hidden shadow-xs">
      {/* Banner Text Left */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-center z-10">
        <h3 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">
          {activeBanner.title || "NEW ARRIVALS"}
        </h3>
        <p className="text-[13px] opacity-90 leading-relaxed">
          {activeBanner.subtitle || "Curabitur luctus ipsum eget convallis"}
        </p>
      </div>

      {/* Discount Block Center */}
      <div className="bg-[#cc3a3a] p-4 flex items-center justify-center gap-4 z-10">
        <div className="text-center">
          <span className="text-4xl font-black block leading-none tracking-tight">
            {activeBanner.discount_percent || "50%"}
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase">OFF</span>
        </div>
        <div className="text-[11px] font-bold leading-tight border-l border-white/20 pl-4 whitespace-pre-line uppercase">
          {activeBanner.discount_text
            ? activeBanner.discount_text.replace(" ", "\n")
            : "ON ALL\nPRODUCTS"}
        </div>
      </div>

      {/* Image Slider Right */}
      <div
        className="flex-1 relative min-h-[140px] md:min-h-[160px] bg-[#222222] overflow-hidden group hidden md:block"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Link
          href={currentImage.link_url || "/products"}
          className="block w-full h-full relative focus:outline-none"
          title={currentImage.image_name}
        >
          {currentImageUrl ? (
            <img
              key={currentImage.id || currentIndex}
              src={currentImageUrl}
              alt={currentImage.image_name || "New Arrival Banner"}
              className="w-full h-full object-cover object-center opacity-85 transition-opacity duration-700 hover:opacity-95"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
              <ImageIcon className="w-8 h-8 opacity-40" />
            </div>
          )}

          {/* Subtle gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Image Name Label (Displays the image name from the backend) */}
          {currentImage.image_name && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-white/20 shadow-sm">
                {currentImage.image_name}
              </span>
            </div>
          )}
        </Link>

        {/* Multiple Images Navigation Controls */}
        {totalImages > 1 && (
          <>
            {/* Prev Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20 shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20 shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-auto">
              {rawImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
