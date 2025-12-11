import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axios";
import toast from "react-hot-toast";

// ============ QUERY KEYS ============
export const productQueryKeys = {
  all: (params) => ["products", params],
  seller: ["seller-products"],
};

// ============ API FUNCTIONS ============
const fetchAllProcessedProducts = async ({ filters = {}, sortBy, isDescending }) => {
  const queryParams = {
    ...filters,
    ...(sortBy && { sortBy }),
    ...(isDescending !== undefined && { isDescending }),
  };

  const response = await axios.get('/products', { params: queryParams });
  return response.data;
};

const fetchSellerProducts = async () => {
  const response = await axios.get(`/products/my-products`);
  // console.log(`Products for seller fetched from query:`, response.data);
  return response.data;
}

const createProduct = async (productData) => {
  const response = await axios.post("/products", productData);
  // console.log("Product created:", response.data);
  toast.success(response.data.message);
  return response.data;
};

const updateProduct = async ({ productId, productData }) => {
  // console.log("Updating product with ID:", productId, "Data:", productData);
  const response = await axios.put(`/products/${productId}`, productData);
  // console.log("Product updated:", response.data);
  return response.data;
};

const deleteProduct = async (productId) => {
  // console.log("Deleting product with ID:", productId);
  const response = await axios.delete(`/products/${productId}`);
  // console.log("Product deleted:", productId);
  return response.data;
};

const rateProduct = async ({ productId, rating }) => {
  const response = await axios.put(`/products/rate/${productId}`, { rating });
  // console.log("Product rated:", response.data);
  return response.data;
};

const unRateProduct = async ({ productId }) => {
  const response = await axios.delete(`/products/rate:${productId}`);
  // console.log("Product removed rating:", response.data);
  return response.data;
};

// ============ QUERY HOOKS ============
export function useAllProcessedProducts({ filters = {}, sortBy, isDescending } = {}) {
    const params = { filters, sortBy, isDescending };
    return useQuery({
    queryKey: productQueryKeys.all(params),
    queryFn: () => fetchAllProcessedProducts(params),
    staleTime: 0, // Allow refetching when invalidated
    gcTime: 0, // Don't keep cache when component unmounts
    onError: (error) => {
      console.error("Error fetching all products:", error);
      toast.error("Failed to fetch products");
    },
  });
}

export function useSellerProcessedProducts() {
    return useQuery({
    queryKey: productQueryKeys.seller,
    queryFn: fetchSellerProducts,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't keep cache when component unmounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
    onError: (error) => {
      console.error("Error fetching seller products:", error);
      toast.error("Failed to fetch seller products");
    },
  });
}

// ============ MUTATION HOOKS ============
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate all products cache
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.seller,
      });
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      // Invalidate all products cache to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.seller,
      });

      toast.success("Product updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      // Invalidate and wait for refetch
      await queryClient.invalidateQueries({
        queryKey: ["products"],
        refetchType: 'active'
      });
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.seller,
        refetchType: 'active'
      });

      toast.success("Product deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });
}

export function useRateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.error("Error rating product:", error);
      toast.error(error.response?.data?.message || "Failed to rate product");
    },
  });
}

export function useUnRateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unRateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.error("Error removing rating of a  product:", error);
      toast.error(error.response?.data?.message || "Failed to rate product");
    },
  });
}

// ============ UTILITY FUNCTIONS ============
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: async () => {
      // Invalidate and refetch all queries that start with ["products"]
      await queryClient.invalidateQueries({ 
        queryKey: ["products"],
        refetchType: 'active' // Refetch all active queries
      });
      await queryClient.invalidateQueries({ 
        queryKey: productQueryKeys.seller,
        refetchType: 'active'
      });
    },
    refetchAll: async () => {
      await queryClient.refetchQueries({ queryKey: ["products"] });
      await queryClient.refetchQueries({ queryKey: productQueryKeys.seller });
    },
  };
}