type LoadGoogleMapsOptions = {
  apiKey: string;
  libraries?: string[];
};

let googleMapsPromise: Promise<typeof window.google> | null = null;

export function loadGoogleMaps({ apiKey, libraries = ["places"] }: LoadGoogleMapsOptions) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in a browser environment."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps SDK.")));
      return;
    }

    const script = document.createElement("script");
    script.dataset.googleMapsSdk = "true";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=${encodeURIComponent(libraries.join(","))}`;

    script.onload = () => {
      if (!window.google?.maps) {
        reject(new Error("Google Maps SDK loaded but window.google.maps is missing."));
        return;
      }
      resolve(window.google);
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps SDK."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

