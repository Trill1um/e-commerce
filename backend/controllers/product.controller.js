import Product from "../models/Products.js";
import Rating from "../models/Rating.js";
import cloudinary from "../lib/cloudinary.js";

// Function to get a single product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Get seller information
    product.seller = Product.findById(product.seller_id);
    
    res.status(200).json({ product, message: "Product fetched successfully" });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    let params=req.query||{};
    let filters={
      category: params.category,
      isLimited: params.isLimited,
      inStock: params.inStock,
      searchTerm: params.searchTerm,
    }

    // console.log("BODY: ", req.body.params);
    const products = await Product.findAll({filters, sortBy: params.sortBy, isDescending: params.isDescending});

    // If user is authenticated, check which products they've rated
    let productsWithRatingFlag = products;
    if (req.user) {
      // Get all user's ratings for these products
      const userRatings = await Rating.find({ 
        userId: req.user.id,
      });

      const ratedProductIds = new Set(userRatings.map(rating => rating.productId));

      productsWithRatingFlag = products.map(product => ({
        ...product,
        userRated: ratedProductIds.has(product.id)
      }));
    } else {
      productsWithRatingFlag = products.map(product => ({
        ...product,
        userRated: false
      }));
    }
    console.log("Products fetched:", productsWithRatingFlag);
    res
      .status(200)
      .json({ products: productsWithRatingFlag, message: "Products fetched successfully" });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}; 

export const createMyProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images = [],
      
      //optional
      isLimited = false,
      inStock = true,
      additionalInfo = [],
    } = req.body;

    // Validate input
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let cloudinaryResponses = [];
    
    additionalInfo.forEach(element => {
      delete element.id;
    });

    // Handle image upload
    try {
      const uploadPromises = images.map((image) =>
        cloudinary.uploader.upload(image.base64, { folder: "bee-products" })
      );
      cloudinaryResponses = await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading images to Cloudinary:", error);
      return res.status(500).json({ message: "Image upload failed" });
    }
    
    // Create new product
    const product = await Product.create({
      sellerId: req.user.id,
      name,
      description,
      price: parseFloat(price),
      category,
      isLimited,
      inStock,
      images:
      cloudinaryResponses
        ?.filter((response) => response.secure_url)
        .map((response) => response.secure_url) || [],
      additionalInfo,
    });
    
    res.status(201).json({ product, message: "Product created successfully" });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ filters:{sellerId: req.user.id} });
    
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }
    res
      .status(200)
      .json({ products, message: "My products fetched successfully" });
  } catch (error) {
    console.error("Error fetching my products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateMyProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isLimited,
      inStock,
      images,
      additionalInfo,
      imageChanged,
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    try {
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.seller_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this product" });
      }
    } catch (error) {
      console.error("Error verifying product ownership:", error);
      // return res.status(500).json({ message: "Internal Server Error" });
    }

    // Handle image updates
    let updatedImages = product.images || [];

    if (imageChanged && images && images.length > 0) {
      try {
        // Identify which images are new vs existing
        const existingUrls = images.filter(img => 
          typeof img === 'string' && img.startsWith('https://res.cloudinary.com')
        );
        
        // Delete old images that are NOT in the new images array
        if (product.images && product.images.length > 0) {
          const imagesToDelete = product.images.filter(oldUrl => 
            !existingUrls.includes(oldUrl)
          );
          
          const deletePromises = imagesToDelete.map(async (imageUrl) => {
            try {
              // Extract publicid from Cloudinary URL
              const publicId = imageUrl.split("/").pop().split(".")[0];
              const fullPublicId = `bee-products/${publicId}`;
              await cloudinary.uploader.destroy(fullPublicId);
            } catch (error) {
              console.log(`Failed to delete image: ${imageUrl}`, error);
              // Continue with update even if deletion fails
            }
          });
          await Promise.all(deletePromises);
        }
        // console.log(images);

        // Upload new images to Cloudinary
        let uploadPromises=null;
        try {
          uploadPromises = images.map((image) => {
            // Check if it's already a Cloudinary URL - if so, keep it as-is
            const imageStr = typeof image === "object" ? image.base64 : image;
            if (typeof imageStr === 'string' && imageStr.startsWith('https://res.cloudinary.com')) {
              return Promise.resolve({ secure_url: imageStr });
            }
            // Otherwise upload to Cloudinary
            return cloudinary.uploader.upload(
              imageStr,
              {
                folder: "bee-products",
                resource_type: "auto", // Handles different file types
              }
            );
          });
        } catch(error) {
          console.log("Error uploading new images to Cloudinary:", error);
        }

        const cloudinaryResponses = await Promise.all(uploadPromises);

        try{

          // Extract secure URLs from successful uploads
          updatedImages = cloudinaryResponses
          .filter((response) => response && response.secure_url)
          .map((response) => response.secure_url);
          
          if (updatedImages.length === 0) {
            return res
            .status(400)
            .json({ message: "No images were successfully uploaded" });
          }
        } catch(error){
          console.log("Error processing uploaded images:", error);
        }
      } catch (error) {
        console.error("Error handling Cloudinary images:", error);
        return res.status(500).json({ message: "Image processing failed" });
      }
    }

    // Update product fields
    await Product.update(req.params.id, {
      name,
      description,
      price,
      category,
      isLimited,
      inStock,
      images: updatedImages,
      additionalInfo
    });

    const updatedProduct = await Product.findById(req.params.id);

    res.status(200).json({
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (req.user.id != product.seller_id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this product" });
    }

    // Get public IDs of images
    const publicIds = product.images.map(
      (imageUrl) => imageUrl.split("/").pop().split(".")[0]
    );

    // Delete images from Cloudinary
    try {
      const deletePromises = publicIds.map((publicId) =>
        cloudinary.uploader.destroy(`bee-products/${publicId}`)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting images from Cloudinary:", error);
      return res.status(500).json({ message: "Image deletion failed" });
    }

    await Product.delete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rateProduct = async(req, res) => {
  try {
    const productId = req.params?.id;
    const rating  = req.body?.rating;
    const user = req.user;
    if (!productId || !rating) {
      return res.status(400).json({ message: "Product ID and rating are required" });
    }
    
    // Validate rating range (assuming 1-5 stars)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prevent sellers from rating their own products
    if (user?.id === product?.seller_id) {
      return res.status(400).json({ message: "Sellers cannot rate their own products" });
    }
    
    const rate_result = await Rating.findOneAndUpdate(
      { productId: productId, userId: user.id },
      { $set: { rating: rating } },
      { new: false, upsert: true, runValidators: true, includeResultMetadata: true }
    );

    // If the rating was not changed, skip recalculating average
    if (rate_result && rate_result?.lastErrorObject?.updatedExisting && rate_result?.value?.rating==rating) {
      return res.status(200).json({ message: "Rating unchanged" });
    }

    const ratings = await Rating.find({ productId: productId });
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = ratings.length > 0 ? sumRatings / ratings.length : 0;

    await Product.update(productId, {
      rate_score: averageRating,
      rate_count: ratings.length
    });

    res.status(200).json({ message: "Product rated successfully" });
  } catch (error) {
    console.error("Error rating product:", error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}

export const deleteRating = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const deletedRating = await Rating.findOneAndDelete({
      productId,
      userId: user.id,
    });

    if (!deletedRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};