import { create } from 'zustand';
import { 
  useAllProcessedProducts,
  useSellerProcessedProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useRateProduct,
} from '../lib/query';

export const useProductProcessor = create(
  (
    set, 
    // get
  ) => ({
  // states
  sort: {
    by: 'name', 
    order: 'asc'
  },
  filters: {
    category: null,
    inStock: null,
    searchTerm: '',
    isLimited: null,
  },
  labels: {
    price: {
      direction: {
        asc: "⬆️ Low-High",
        desc: "⬇️ High-Low"
      },
      type: "number"
    },
    name: {
      direction: {
        asc: "⬆️ A-Z",
        desc: "⬇️ Z-A"
      },
      type: "string"
    },
    createdAt: {
      direction: {
        asc: "⬆️ Old-New",
        desc: "⬇️ New-Old"
      },
      type: "date"
    },
  },

  // Case-specific setters
  setSortBy: (sortBy) => set((state) => ({
    sort: { ...state.sort, by: sortBy }
  })),
  
  setSortOrder: (sortOrder) => set((state) => ({
    sort: { ...state.sort, order: sortOrder }
  })),

  toggleSortOrder: () => set((state) => ({
    sort: { ...state.sort, order: state.sort.order === 'asc' ? 'desc' : 'asc' }
  })),
  
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  resetFilters: () => set({
    filters: {
      category: null,
      inStock: null,
      searchTerm: '',
      isLimited: null,
    },
  }),
  
  resetSort: () => set({
    sort: {
      by: 'name', 
      order: 'asc'
    }
  }),
}));

export function useProcessedProducts() {
  const processor = useProductProcessor();
  const { filters, sort } = processor;
  
  // Only call the hook once with the current filters/sort
  const processed = useAllProcessedProducts({
    filters: {
      category: filters.category,
      inStock: filters.inStock,
      searchTerm: filters.searchTerm,
      isLimited: filters.isLimited,
    },
    sortBy: sort.by,
    isDescending: sort.order === 'desc',
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const processedProducts = processed.data?.products || [];
  return {
    // Data
    products: processedProducts,
    rawProducts: processedProducts, // Same data, just alias for backward compatibility

    // Query states
    isLoading: processed.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isFetching: processed.isLoading,
    error: processed.error,
    refetch: processed.refetch,
    
    // Mutations
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Async mutation functions (for await usage)
    createProductAsync: createMutation.mutateAsync,
    updateProductAsync: updateMutation.mutateAsync,
    deleteProductAsync: deleteMutation.mutateAsync,
    
    // All processor actions and state
    ...processor
  };
}


export function useFeaturedProducts() {
  const { rawProducts, isLoading, error } = useProcessedProducts();
  const maxProducts = 6;

  // Evreryday I'm shuffling
  const shuffled = [...rawProducts].sort(() => Math.random() - 0.5);
  const featuredProducts = shuffled.slice(0, maxProducts);
  return {
    featuredProducts,
    isFeaturedLoading: isLoading,
    featuredError: error,
  };
}

export function useUniqueProductCategories() {
  const { rawProducts, isLoading, error } = useProcessedProducts();
  const availableCategories = ["Food", "Drinks", "Accessories", "Clothes", "Other"];
  
  // Early return if still loading or error
  if (isLoading || error) {
    return {
      uniqueProducts: [],
      isUniqueLoading: isLoading,
      uniqueError: error,
    };
  }

  // Early return if no products
  if (!rawProducts || rawProducts.length === 0) {
    return {
      uniqueProducts: [],
      isUniqueLoading: false,
      uniqueError: error,
    };
  }

  // Group products by category and shuffle each group
  const productsByCategory = availableCategories.map(category => {
    const categoryProducts = rawProducts.filter(product => product?.category === category);
    // Shuffle the products in this category
    return categoryProducts.sort(() => Math.random() - 0.5);
  }).filter(categoryArray => categoryArray.length > 0); // Only keep categories that have products

  // If we don't have enough categories with products, return what we have
  if (productsByCategory.length === 0) {
    return {
      uniqueProducts: [],
      isUniqueLoading: false,
      uniqueError: error,
    };
  }

  let products = [];
  let maxRounds = Math.max(...productsByCategory.map(arr => arr.length));
  
  // Distribute products from each category evenly
  for (let round = 0; round < maxRounds && products.length < availableCategories.length; round++) {
    for (const categoryProducts of productsByCategory) {
      if (categoryProducts[round] && products.length < availableCategories.length) {
        products.push(categoryProducts[round]);
      }
    }
  }

  return {
    uniqueProducts: products,
    isUniqueLoading: false,
    uniqueError: error,
  };
}

export function useProductById(productId) {
  const { rawProducts, isLoading, error } = useProcessedProducts();
  
  // Don't conditionally return - always return an object
  const product = productId ? rawProducts.find(p => p.id === parseInt(productId)) : null;
  
  return {
    product: product || null,
    isLoading,
    error,
  };
}

export function useUserProducts() {
  const sellerQuery = useSellerProcessedProducts();
  return {
    products: sellerQuery.data?.products || [],
    isLoading: sellerQuery.isLoading,
    error: sellerQuery.error,
  };
}

export function useRateOneProduct(productId, rate) {
  try {
    const rateMutation = useRateProduct();
    rateMutation.mutate({ productId, rating: rate });
  } catch (error) {
    console.error("Error rating product:", error);
  }
}