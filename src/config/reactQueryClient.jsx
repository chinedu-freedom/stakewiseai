"use client";

import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        console.error("Mutation Error:", error);
      },
    },
  },
});

export default queryClient;





// "use client";

// import { QueryClient } from "@tanstack/react-query";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       retry: 2,
//       refetchOnWindowFocus: false,
//     },
//     mutations: {
//       onError: (error) => {
//         console.error("Mutation Error:", error);
//       },
//     },
//   },
// });

// export default queryClient;
