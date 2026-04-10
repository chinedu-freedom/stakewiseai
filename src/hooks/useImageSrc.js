import { useEffect, useState } from "react";
import { client } from "@/lib/sanity";
import { createImageUrlBuilder } from '@sanity/image-url'

const builder = createImageUrlBuilder(client);

function buildSanityImage(image) {
  if (!image?.asset) return null;

  return builder
    .image(image)
    .auto("format")
    .fit("max")
    .width(1200)
    .url();
}

export function useImageSrc(image, fallback = "/placeholder-image.jpg") {
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    if (!image) {
      setSrc(fallback);
      return;
    }

    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setSrc(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (image?.asset?._ref) {
      setSrc(buildSanityImage(image));
      return;
    }

    setSrc(fallback);
  }, [image, fallback]);

  return src;
}
