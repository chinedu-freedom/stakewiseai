import { getCookie } from 'cookies-next';

export const fetcher = async (url) => {
  const token = getCookie('GC-auth-token');
  const res = await fetch(url, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token} `}),
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    (error).info = await res.json();
    (error).status = res.status;
    throw error;
  }
  return res.json();
};