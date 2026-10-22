// utils/cookie-utils.js

export const CookieManager = {
  set: (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    
    // Set for current origin (admin.blockvextrade.com)
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  },

  get: (name) => {
    if (typeof document === "undefined") return undefined;
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
    return cookies[name];
  },

  remove: (name) => {
    if (typeof document === "undefined") return;
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${name}=; expires=${new Date(0).toUTCString()}; path=/${isSecure ? "; Secure" : ""}`;
  },
};
