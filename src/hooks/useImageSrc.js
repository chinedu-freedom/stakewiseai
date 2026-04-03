import { useEffect, useState } from "react";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/lib/sanity";

const builder = imageUrlBuilder(client);

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
