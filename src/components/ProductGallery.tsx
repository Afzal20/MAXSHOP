"use client";

import { useState } from "react";

type ImageType = {
  id: number;
  image: string;
};

type Props = {
  images?: ImageType[];
  title: string;
  discount_price?: string;
};

export function ProductGallery({ images, title, discount_price }: Props) {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const mainImage = images && images.length > 0 ? images[mainImageIndex].image : null;

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
        {mainImage ? (
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
        {discount_price && (
          <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-4 py-1.5 rounded-full shadow-lg">
            SALE
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images && images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <div 
              key={img.id} 
              onClick={() => setMainImageIndex(index)}
              className={`w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${
                index === mainImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'
              }`}
            >
              <img src={img.image} alt={`thumbnail-${index}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
