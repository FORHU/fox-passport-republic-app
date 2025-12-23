export const config = {
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
  cesiumToken: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api",
};