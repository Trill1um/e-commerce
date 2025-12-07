export default function cloudinaryImage(url, type, isPreview) {
  if (!url) {
    return null; // or return a placeholder image URL
  }
  // If url is an object (e.g., { url: ... }), extract the string
  const imageUrl = typeof url === "string" ? url : url.url;

  // Check if it's a Cloudinary URL (contains '/upload/')
  if (!imageUrl.includes("/upload/")) {
    return imageUrl;
  }

  if (!isPreview) {
    const parts = imageUrl.split("/upload/");
    if (parts.length !== 2) {
      throw new Error("Invalid Cloudinary URL: missing /upload/");
    }

    let transformation = "";
    switch (type) {
      case "grid":
        transformation = "w_400,h_400,c_fill,f_auto,q_auto";
        break;
      case "detail":
        transformation = "w_1200,f_auto,q_auto";
        break;
      case "thumbnail":
        transformation = "w_150,h_150,c_fill,f_auto,q_auto";
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  }
  return url.url;
}
