import { useState } from "react";
import { ImageOff } from "lucide-react";

import { fileUrl } from "../lib/fileUrl";

// A card's cover picture. It keeps the picture's own proportions (tall images
// are capped and cropped from the top), and a missing or broken file shows a
// calm placeholder instead of a broken-image icon.
function CoverImage({ src, alt = "", className = "", maxHeight = "max-h-56" }) {
  const [failed, setFailed] = useState(false);

  // Old data can hold a temporary browser address (blob:...) that no longer
  // exists, so treat it like a missing file.
  const unusable = !src || src.startsWith("blob:");

  if (unusable || failed) {
    if (!src) return null;

    return (
      <div
        className={`flex h-20 items-center justify-center gap-2 rounded-lg bg-slate-100 text-xs font-medium text-slate-400 ${className}`}
      >
        <ImageOff size={16} />
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={fileUrl(src)}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={`block w-full rounded-lg bg-slate-100 object-cover object-top ${maxHeight} ${className}`}
    />
  );
}

export default CoverImage;
