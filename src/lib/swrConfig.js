
export const swrConfig= {
  // revalidateOnFocus: true,
  shouldRetryOnError: false,
  errorRetryInterval: 5000,
  fetcher: async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },
};
export const swrConfigWithCache= {
  ...swrConfig,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 5000, // 5 seconds
};


// .delete