/**
 * Utility to asynchronously and safely load the official Razorpay Checkout SDK.
 * Singleton promise prevents redundant script injections or DOM thrashing.
 */

let razorpayScriptPromise = null;

export function loadRazorpaySDK() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  // If already loaded on window, resolve immediately
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  // If already loading, return the existing active promise
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    // Check if script tag already exists in document
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
      } else {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK script.");
      razorpayScriptPromise = null; // allow retry
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}
