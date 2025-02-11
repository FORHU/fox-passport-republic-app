<template>
  <v-row
    no-gutters
    class="d-flex align-center justify-space-between border-b py-2"
  >
    <div class="d-flex ga-1 align-center">
      <div id="google_translate_element" />
      <v-icon @click="resetToDefaultLanguage" color="blue-theme"
        >mdi-restart</v-icon
      >
    </div>
  </v-row>
</template>

<script setup>
  // @ts-ignore;
const language = ref(localStorage.getItem("preferredLanguage") || "en");

onMounted(async () => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  await document.head.appendChild(script);
});
  // @ts-ignore;
if (process.client) {
  setTimeout(() => {
    googleTranslateElementInit();
    observeAndHideElements();
  }, 2000);
}

  // @ts-ignore;
async function handleLanguageChange(event) {
  try {
    const selectElement = event.target;
    const selectedLanguage = selectElement.value;

    if (selectedLanguage === "en") {
      localStorage.removeItem("preferredLanguage");
    } else {
      localStorage.setItem("preferredLanguage", selectedLanguage);
    }
    reloadNuxtApp();
  } catch (error) {
    console.error("Error handling language change:", error);
  }
}

// @ts-ignore;
async function googleTranslateElementInit() {
  try {
  // @ts-ignore;
    new google.translate.TranslateElement(
      { pageLanguage: "en", autoDisplay: true },
      "google_translate_element"
    );

    if (language?.value && language.value !== "en") {
      setTimeout(() => {
        // @ts-ignore
        const select = document.querySelector("select.goog-te-combo");
        if (select) {
          select.value = language.value;
          select.dispatchEvent(new Event("change"));
        }
      }, 1000);
    }

    setTimeout(() => {
      const selectElement = document.querySelector("select.goog-te-combo");
      if (selectElement) {
        selectElement.addEventListener("change", handleLanguageChange);
      }
    }, 2000);
  } catch (error) {
    console.error("Error initializing Google Translate:", error);
  }
}

const observeAndHideElements = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const elements = document.querySelectorAll("body > .skiptranslate");
        elements.forEach((el) => {
          el.style.display = "none";
          el.style.opacity = 0;
          document.querySelector("body").removeAttribute("style");
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

const resetToDefaultLanguage = async () => {
  try {
    const selectElement = document.querySelector("select.goog-te-combo");
    if (selectElement) {
      selectElement.value = "en";
      selectElement.dispatchEvent(new Event("change"));
    }
    localStorage.removeItem("preferredLanguage");
    window.location.reload();
  } catch (error) {
    console.error("Error resetting language to default:", error);
  }
};
</script>

<style scoped></style>
