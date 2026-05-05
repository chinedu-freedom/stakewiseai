// utils/cookie-utils.js

export const CookieManager = {
  set: (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    // Simplified: Modern browsers handle Lax correctly on localhost without Secure.
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  },

  get: (name) => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
    return cookies[name];
  },

  remove: (name) => {
    document.cookie = `${name}=; expires=${new Date(0).toUTCString()}; path=/`;
  },
};
