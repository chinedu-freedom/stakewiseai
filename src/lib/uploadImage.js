import { client } from "./sanity";
import { v4 as uuid } from "uuid";

const ALLOWED_EXTENSIONS = ["png", "jpeg", "jpg"];
const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_ICON_SIZE) || 5_000_000;

export async function uploadImageToSanity(file, slug) {
  if (!file) {
    throw new Error("No image file provided");
  }

  // Ensure this is a File object
  if (!(file instanceof File)) {
    throw new Error("Invalid file provided");
  }

  // Check MIME type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Image must be less than ${MAX_FILE_SIZE / 1_000_000}MB`);
  }

  // Check extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed`);
  }

  try {
    const filename = `${slug}-${uuid()}`;
    const uploaded = await client.assets.upload("image", file, { filename });
    return uploaded._id;
  } catch (err) {
    console.error("Sanity image upload error:", err);
    throw new Error("Failed to upload image");
  }
}
