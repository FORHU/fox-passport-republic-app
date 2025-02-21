import { defineNuxtPlugin } from "#app";
import SmartBanner from "smart-app-banner";

export default defineNuxtPlugin(() => {
  new SmartBanner({
    title: "Venue4use",
    author: "Seven365 Pte Ltd.",
    price: "FREE",
    appStoreLanguage: "us",
    store: {
      ios: "On the App Store",
      android: "In Google Play",
    },
    button: "View",
    daysHidden: 15,
    daysReminder: 90,
    icon: "/favicon.ico",
    url: {
      ios: "https://apps.apple.com/app/6736890246",
      android: "https://play.google.com/store/apps/details?id=com.venue4use",
    },
  });
});