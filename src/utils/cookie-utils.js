// utils/cookie-utils.js

export const CookieManager = {
  set: (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    
    // Get the base domain (e.g., .stakewiseai.vip) to ensure cookies work across subdomains
    const host = window.location.hostname;
    let domainString = "";
    
    if (host.includes(".") && !host.includes("localhost") && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      const parts = host.split(".");
      if (parts.length >= 2) {
        const baseDomain = parts.slice(-2).join(".");
        domainString = `; domain=.${baseDomain}`;
      }
    }

    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${domainString}`;
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
