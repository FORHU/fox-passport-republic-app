import { createVuetify } from "vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import "~/assets/scss/main.scss";
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: "light",
      themes: {
        dark: {
          dark: true,
          colors: {
            base: "#000000",
            primary: "#8091AF",
            primaryBG: "#E0E8F5",
            secondary: "#373941",
            accent: "#7A8179",
            tertiary: "#EEEEEE",
            draft: "#1867C0",
            published: "#4CAF50",
            inprogress: "#EE82EE",
            for_approval: "#FB8C00",
            ongoing: "#6750A4",
            error: "#FF5252",
            archived: "#616161",
            subtitle: "#717484",
            rejected: "#CB0000",
            suspended: "#DA5656",
            for_deletion: "#42B3F4",
            charcoal: '#555763',
            light_gray: '#F4F4F5',
            light_gray_secondary: "#DEDFE3",
            base_color: "#FFFFFF"
          },
          variables: {
            // 'border-color': '#38854F',
            // 'border-opacity': 1,
          },
        },

        light: {
          dark: false,
          colors: {
            base: "#FFFFFF",
            primary: "#8091AF",
            primaryBG: "#E0E8F5",
            secondary: "#373941",
            tertiary: "#EEEEEE",
            accent: "#7f867e",
            rate: "#FFA432",
            draft: "#1867C0",
            published: "#4CAF50",
            inprogress: "#EE82EE",
            for_approval: "#FB8C00",
            ongoing: "#6750A4",
            error: "#FF5252",
            archived: "#616161",
            subtitle: "#717484",
            rejected: "#CB0000",
            suspended: "#DA5656",
            for_deletion: "#42B3F4",
            charcoal: '#555763',
            light_gray: '#F4F4F5',
            light_gray_secondary: "#DEDFE3",
            base_color: "#000000"
          },
          variables: {
            "disabled-opacity": "0.7",
            // 'border-color': '#38854F',
            // 'border-opacity': 1,
          },
        },
      },
    },
    defaults: {
      font: { family: "DM Sans" },
      VTextField: {
        variant: "outlined",
        density: "compact",
        // hint: "This field is required",
        // persistentHint: true,
      },
      VBtn: {
        class: "text-capitalize",
      },
      VSelect: {
        density: "compact",
        variant: "outlined",
        // hint: "This field is required",
        // persistentHint: true,
      },
      VTextarea: {
        variant: "outlined",
        // hint: "This field is required",
        // persistentHint: true,
      },
      VAutocomplete: {
        density: "compact",
        variant: "outlined",
        // hint: "This field is required",
        // persistentHint: true,
      },
    },
  });
  nuxtApp.vueApp.use(vuetify);
});
