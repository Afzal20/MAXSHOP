"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Check } from "lucide-react";

export function ProductInteractions({ productId, title }: { productId: string | number, title: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Future: API call to save to wishlist
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleLike}
        className={`rounded-full hover:bg-red-50 transition-colors ${isLiked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-red-500'}`}
      >
        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleShare}
        className="rounded-full text-muted-foreground hover:bg-gray-100 transition-colors"
      >
        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
      </Button>
    </div>
  );
}
