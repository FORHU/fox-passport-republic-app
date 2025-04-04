<template>
  <ClientOnly>
    <NuxtLayout>
      <Meta name="apple-itunes-app" content="app-id=6736890246" />
      <v-snackbar v-model="defaultSnackbar" :color="defaultSnackbarColor">
        {{ defaultSnackbarText }}

        <template v-slot:actions>
          <v-btn variant="text" @click="defaultSnackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>


      <ModalPromoteMobileApp
        v-model="showPromoteDialog"
        @closeDialog="closeDialog"
      />
      <template>
        <template
          v-for="announcement in announcementData"
          :key="announcement._id"
        >
          <ModalAnnouncement
            v-model="announcementVisibility[announcement._id]"
            @closeAnnouncementDialog="
              (dontShowAgain) =>
                closeAnnouncementDialog(announcement._id, dontShowAgain)
            "
            :announcement="announcement"
          />
        </template>
      </template>
      <NuxtPage />
    </NuxtLayout>
    <NuxtLoadingIndicator color="#8091AF" :height="4" />
  </ClientOnly>
</template>

<script setup lang="ts">
// import { useDisplay } from "vuetify";
const {
  defaultSnackbar,
  defaultSnackbarText,
  defaultSnackbarColor,
  country,
  defaultCountryImage,
} = useLocal();
const { fetchAnnouncementList, addAnnouncementLog } = useAnnouncementAPI();
const MAIN_URL = useRuntimeConfig().public.MAIN_URL;
const route = useRoute();
const { loggedIn } = useLocalAuth();
const { isVenueOwner, isAdmin, isUser } = useAccess();
const showPromoteDialog = ref(true);
const promoteDialogCookie = useCookie("hidePromoteDialog") as any;
const announcementData = ref<TAnnouncement[]>([]);
const announcementVisibility = ref<any>({});
const closeDialog = () => {
  showPromoteDialog.value = false;
  promoteDialogCookie.value = false;
};

const keywords =
  "Venue booking, Event spaces for rent, Meeting venues near me, Conference rooms for hire, Webinar location rentals, Event venues, Party spaces, Team gathering places, Meeting rooms, Conference locations, Venue rentals for workshops and seminars, Training room rentals, Trade show venues, Summit locations, Wedding venues, Exhibition spaces, Networking venues, Corporate retreat locations, Team building venues, Convention centers, Boardroom rentals, Town hall locations, Product launch venues, Lecture halls and training centers, Webinar spaces, Seminar rooms, Meeting hubs, Event halls, Event planning, Venue management, Venue solutions, Venue finder, Event space marketplace, Venue booking platform, Venue rental services, Event venue selection, Venue discovery, Event venue options, Venue booking app, Venue reservation system, Venue availability, Venue search engine, Venue booking portal, Online venue management software, Remote venue rental marketplace, Online venue booking website, Virtual venue directory, Digital venue reviews, Remote venue booking platform, Virtual event space finder, Digital venue booking system, Remote venue booking service, Online venue reservation platform, Virtual event venue marketplace, Digital venue availability checker, Online venue booking directory, Virtual venue booking app, Digital event venue search, Online virtual event venues, Virtual meeting space rentals, Remote conference venue rentals, Online webinar venue options, Workshop venue rentals, Party venue rentals, Singapore, singapore, venue, restaurant, elite venue, elite venues, restaurant, meetings, events, party, corporate events, birthday, space, bookings, booking";

const closeAnnouncementDialog = async (id: any, dontShowAgain: boolean) => {
  if (dontShowAgain) {
    const payload = {
      announcement: id,
    };
    const { data, error }: { data: any; error: any } =
      await addAnnouncementLog(payload);

    if (error.value) {
      console.error(error.value);
    }
  }
  announcementVisibility.value[id] = false;
};

const fetchAnnouncement = async () => {
  if (!loggedIn.value) return;
  if (isAdmin) return;

  try {
    const res = await fetchAnnouncementList(1, 20, null, null);

    if (res.data) {
      announcementData.value = res.data.filter((announcement: any) => {
        if (!announcement.active || announcement.viewed) return false;

        if (announcement.target === "ALL") return true;
        if (announcement.target === "VENUE_OWNERS_ONLY" && isVenueOwner)
          return true;
        if (announcement.target === "USERS_ONLY" && isUser) return true;

        return false;
      });

      announcementVisibility.value = Object.fromEntries(
        announcementData.value.map((announcement) => [announcement._id, true])
      );
    }
  } catch (error) {
    console.error(error);
  }
};

useHead(() => ({
  title: "Venue4use | Book Top Event Venues & Meeting Spaces",
  meta: [
    {
      name: "description",
      content: `Find the perfect venue for any occasion in ${country} - meetings, parties, or corporate events. Venue4use makes venue booking quick and easy.`,
    },
    {
      name: "keywords",
      content: keywords,
    },
  ],
  link: [
    { rel: "canonical", href: new URL(route.path, MAIN_URL).href },
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  ],
  htmlAttrs: {
    lang: "en",
  },
}));

useSeoMeta({
  title: "Venue4use | Book Top Event Venues & Meeting Spaces",
  ogTitle: "Venue4use | Book Top Event Venues & Meeting Spaces",
  description: `Find the perfect venue for any occasion in ${country} - meetings, parties, or corporate events. Venue4use makes venue booking quick and easy.`,
  ogDescription: `Find the perfect venue for any occasion in ${country} - meetings, parties, or corporate events. Venue4use makes venue booking quick and easy.`,
  ogImage: defaultCountryImage.value || "/background.jpeg",
  twitterCard: "summary_large_image",
  keywords,
});

onMounted(async () => {
  const hidePromote = promoteDialogCookie.value;
  if (hidePromote === undefined) {
    showPromoteDialog.value = true;
  } else if (!hidePromote) {
    showPromoteDialog.value = false;
  }

  await fetchAnnouncement();
});
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

<!-- some work done -->
