import { uploadImage } from "../api/uploadApi";
import { getErrorMessage } from "./validation";

// A problem with the picked image itself (wrong type, too big)
export class ImageProblem extends Error {}

// Message to show for any failure while adding an image
export const imageErrorMessage = (error) =>
  error instanceof ImageProblem
    ? error.message
    : getErrorMessage(error, "Could not upload the image");

// What the server accepts for card images
const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const MAX_IMAGE_MB = 10;

// Returns a message when the image can't be used, otherwise null
export const checkImage = (file) => {
  if (!EXTENSIONS[file.type]) {
    return "Only JPG, PNG, GIF and WebP images are supported";
  }

  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `That image is too large. The limit is ${MAX_IMAGE_MB} MB.`;
  }

  return null;
};

// Pasted images often have no usable name ("image.png", "blob" or empty), so
// give them a proper one that matches their type.
const withProperName = (file) => {
  const extension = EXTENSIONS[file.type];
  const hasExtension = new RegExp(`\\.${extension}$`, "i").test(file.name || "");

  return hasExtension
    ? file
    : new File([file], `pasted-image-${Date.now()}.${extension}`, {
        type: file.type,
      });
};

// Uploads one image and resolves to its stored path ("/uploads/...")
export const uploadCardImage = async (file) => {
  const problem = checkImage(file);
  if (problem) throw new ImageProblem(problem);

  return uploadImage(withProperName(file));
};

// The first image on the clipboard, if any
export const imageFromClipboard = (event) => {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }

  return null;
};
