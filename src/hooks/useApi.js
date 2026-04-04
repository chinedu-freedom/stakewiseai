"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchData,
  postData,
  updateData,
  patchData,
  deleteData,
} from "@/config/apiHelpers";
import { toast } from "sonner";

// Centralized error formatter
const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.errors && Array.isArray(data.errors)) return data.errors.join(", ");
  if (data?.message) return data.message;
  return error?.message || "Something went wrong. Please try again.";
};

// Normalize query key
const handleQueryKey = (queryKey) => {
  return Array.isArray(queryKey) ? queryKey : [queryKey];
};

/* ================= GET ================= */
export const useFetchData = (endpoint, queryKey, options = {}) => {
  return useQuery({
    queryKey: handleQueryKey(queryKey || endpoint),

    queryFn: async ({ signal }) => {
      const res = await fetchData(endpoint, { signal });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to fetch data");
      }

      return res;
    },

    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    enabled: options.enabled ?? true,

    retry: (failureCount, error) => {
      if (error?.name === "CanceledError") return false;

      const status = error?.response?.status;
      if (status && status >= 400 && status < 500) return false;

      return failureCount < 3;
    },

    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 5000);
    },

    onError: (error) => {
      if (error?.name === "CanceledError") return;
      toast.error(getErrorMessage(error));
    },
  });
};

/* ================= POST ================= */
export const usePost = (endpoint, queryKey, isFormData = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const shouldUseFormData =
        isFormData ||
        (typeof FormData !== "undefined" && data instanceof FormData);

      const res = await postData(endpoint, data, {
        isFormData: shouldUseFormData,
      });

      if (res?.success === false) {
        throw new Error(res.message || "Request failed");
      }

      return res;
    },

    onSuccess: (res) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }

      toast.success(res?.message || "Request successful");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/* ================= PUT ================= */
export const usePut = (endpoint, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await updateData(endpoint, data);

      if (!res?.success) throw new Error(res.message || "Update failed");

      return res;
    },

    onSuccess: (res) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }

      toast.success(res?.message || "Updated successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/* ================= PATCH ================= */
export const usePatch = (endpoint, queryKey, isFormData = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      let url;
      let dataToSend;

      if (payload?.id && payload?.data) {
        url =
          typeof endpoint === "function"
            ? endpoint(payload.id)
            : endpoint;
        dataToSend = payload.data;
      } else if (payload?.id) {
        url =
          typeof endpoint === "function"
            ? endpoint(payload.id)
            : endpoint;
        dataToSend = { ...payload };
        delete dataToSend.id;
      } else {
        url = endpoint;
        dataToSend = payload;
      }

      const res = await patchData(url, dataToSend, {
        isFormData,
      });

      if (res?.success === false) {
        throw new Error(res.message || "Patch failed");
      }

      return res;
    },

    onSuccess: (res) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }

      toast.success(res?.message || "Updated successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

/* ================= DELETE ================= */
export const useDelete = (endpoint, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Missing ID");

      const url =
        typeof endpoint === "function" ? endpoint(id) : endpoint;

      const res = await deleteData(url);

      if (!res?.success) {
        throw new Error(res.message || "Delete failed");
      }

      return res;
    },

    onSuccess: (res) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }

      toast.success(res?.message || "Deleted successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// "use client";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   fetchData,
//   postData,
//   updateData,
//   patchData,
//   deleteData,
// } from "@/config/apiHelpers";
// import { toast } from "sonner";

// // Centralized error formatter
// const getErrorMessage = (error) => {
//   const data = error?.response?.data;
//   if (data?.errors && Array.isArray(data.errors)) return data.errors.join(", ");
//   if (data?.message) return data.message;
//   return error?.message || "Something went wrong. Please try again.";
// };

// // Helper function to properly handle query keys
// const handleQueryKey = (queryKey) => {
//   return Array.isArray(queryKey) ? queryKey : [queryKey];
// };

// // GET - Fetch data
// export const useFetchData = (
//   endpoint,
//   queryKey,
//   options = {}
// ) => {
//   return useQuery({
//     queryKey: handleQueryKey(queryKey || endpoint),

//     queryFn: async ({ signal }) => {
//       const res = await fetchData(endpoint, { signal });

//       if (!res?.success) {
//         throw new Error(res?.message || "Failed to fetch data");
//       }

//       return res;
//     },

//     // refetchOnWindowFocus: false,
//         refetchOnWindowFocus: options.refetchOnWindowFocus ?? false, // Make it configurable
//     enabled: options.enabled ?? true,

//     // 1️⃣ Retry logic
//     retry: (failureCount, error) => {
//       // Do not retry cancelled requests
//       if (error?.name === "CanceledError") return false;

//       // Do not retry client errors (4xx)
//       const status = error?.response?.status;
//       if (status && status >= 400 && status < 500) return false;

//       // Retry up to 3 times
//       return failureCount < 3;
//     },

//     // 2️⃣ Exponential backoff
//     retryDelay: (attemptIndex) => {
//       // 1s → 2s → 4s (max 5s)
//       return Math.min(1000 * 2 ** attemptIndex, 5000);
//     },

//     onError: (error) => {
//       // Ignore cancelled requests
//       if (error?.name === "CanceledError") return;

//       toast.error(getErrorMessage(error));
//     },
//   });
// };


// export const usePost = (endpoint, queryKey, isFormData = false) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data) => {
//       const shouldUseFormData =
//         isFormData || (typeof FormData !== "undefined" && data instanceof FormData);

//       const res = await postData(endpoint, data, shouldUseFormData);

//       if (res?.success === false) {
//         throw new Error(res.message || "Request failed");
//       }

//       return res;
//     },

//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({
//           queryKey: handleQueryKey(queryKey),
//         });
//       }

//       toast.success(res?.message || "Request successful");
//     },

//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };

// // PUT - Full update
// export const usePut = (endpoint, queryKey) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data) => {
//       const res = await updateData(endpoint, data);
//       if (!res?.success) throw new Error(res.message || "Update failed");
//       return res;
//     },
//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({ 
//           queryKey: handleQueryKey(queryKey) 
//         });
//       }
//       toast.success(res?.message || "Updated successfully");
//     },
//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };

// // PATCH - Partial update (UPDATED: supports { id, data } pattern)
// export const usePatch = (endpoint, queryKey, isFormData = false) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (payload) => {
//       try {
//         let url;
//         let dataToSend;

//         // Pattern 1: { id, data }
//         if (payload?.id && payload?.data) {
//           url = typeof endpoint === "function" ? endpoint(payload.id) : endpoint;
//           dataToSend = payload.data;
//         }
//         // Pattern 2: { id, ...rest }
//         else if (payload?.id) {
//           url = typeof endpoint === "function" ? endpoint(payload.id) : endpoint;
//           dataToSend = { ...payload };
//           delete dataToSend.id;
//         }
//         // Pattern 3: direct payload
//         else {
//           url = endpoint;
//           dataToSend = payload;
//         }

//         const res = await patchData(url, dataToSend, isFormData);

//         // Handle backend success:false
//         if (res?.success === false) {
//           throw new Error(res.message || "Patch failed");
//         }

//         return res;
//       } catch (error) {
//         throw error;
//       }
//     },

//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({
//           queryKey: handleQueryKey(queryKey),
//         });
//       }
//       toast.success(res?.message || "Updated successfully");
//     },

//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };

// // DELETE - Remove data
// export const useDelete = (endpoint, queryKey) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id) => {
//       if (!id) {
//         throw new Error("Missing ID");
//       }

//       const url = typeof endpoint === "function" ? endpoint(id) : endpoint;
//       const res = await deleteData(url);

//       if (!res?.success) {
//         throw new Error(res.message || "Delete failed");
//       }

//       return res;
//     },
//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({
//           queryKey: handleQueryKey(queryKey),
//         });
//       }
//       toast.success(res?.message || "Deleted successfully");
//     },
//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };
