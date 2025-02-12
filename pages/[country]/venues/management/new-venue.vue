<template>
  <LoadingDefault v-if="loading" />
  <v-form v-else ref="form" @submit.prevent v-model="formValid" class="" :disabled="mode == 'view'">

    <!-- HEADER -->
    <v-row no-gutters class="w-100" style="height: 7dvh; position: absolute; top: 0; left: 0; right: 0; z-index: 2;"
      justify="center">
      <v-sheet color="white" class="py-3 px-5 px-md-0" width="100%" style="border-bottom: 2px solid #DEDFE3;">
        <v-row no-gutters justify="center">
          <v-col cols="12" md="10" lg="8" xl="7" class="d-flex ga-2 align-center">
            <span style="width: 90%;">
              <span class="text-16px text-charcoal">Step {{ activePage + '/' + totalPages }} <span
                  class="text-18px text-secondary font-500">{{ 'Overview'
                  }}</span></span>
              <span><v-progress-linear :model-value="(activePage / totalPages) * 100" color="primary" height="5"
                  rounded="lg" class="mt-1"></v-progress-linear></span>
            </span>
            <span>
              <v-btn variant="outlined" border="secondary md" size="large" text="Exit" rounded="lg"
                @click="handleExit" />
            </span>
          </v-col>
        </v-row>
      </v-sheet>
    </v-row>
    <!-- HEADER -->


    <v-row no-gutters :style="{ bottom: smAndUp ? '8dvh' : '10dvh' }"
      style="position: fixed; top: 7dvh ; left: 0; right: 0; overflow: auto;">
      <v-row no-gutters class="w-100 h-100 px-5 px-md-0" justify="center">
        <v-col cols="12" md="10" lg="8" xl="7" class="my-5">

          <v-row no-gutters class="w-100" style="position: sticky; top:0; right: 0; left: 0">
            <v-row no-gutters class="w-100 my-5">
              <VenueFormOverview v-if="activePage == 1" v-model="venue" />
            </v-row>
          </v-row>

        </v-col>
      </v-row>
    </v-row>
    <!-- FOOTER -->
    <v-row no-gutters class="w-100" :style="{ height: smAndUp ? '8dvh' : '10dvh' }"
      style="position: absolute; bottom: 0; left: 0; right: 0;">
      <v-sheet class="py-3 px-5 px-md-0" width="100%"
        style="position: relative; bottom: 0; left:0; right: 0 ;border-top: 2px solid #DEDFE3;">
        <v-row no-gutters class="w-100 h-100" justify="center">
          <v-col cols="12" md="10" lg="8" xl="6" class="">
            <v-row no-gutters class="w-100 h-100" align="center">
              <v-col cols="6">
              </v-col>
              <v-col cols="6" align="end">
                <v-btn :type="mode === 'view' ? 'button' : 'submit'" color="secondary" rounded="lg" size="large"
                  variant="flat" :disabled="false" :loading="processing" @click="handleNext"
                  class="text-uppercase">Next</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-sheet>
    </v-row>
    <!-- FOOTER -->
  </v-form>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "plain",
});
const { country, setSnackbar } = useLocal();
const { venueId } = useRoute().params;
const { addNewVenue, mode, venue } = useVenue();
import { useDisplay } from "vuetify";
const { smAndUp } = useDisplay();
const { isAdminMember, isAdminSales } = useAccess();

const formValid = ref<boolean>(false);
const loading = ref(true);
const activePage = ref(1);
const processing = ref(false);
const form = ref<any>(null);

const cookiePage = useCookie<number>("cookie_page");

const venueListerPageRoute = "country-venues-management";

const totalPages = computed(() => {
  if (isAdminMember || isAdminSales) {
    return 3;
  } else {
    return 7;
  }
})

const items = [
  {
    title: "Home",
    to: { name: venueListerPageRoute, params: { country, status: "all" } },
    disabled: false,
  },
  {
    title: "Overview",
    page: 1,
    disabled: false,
  },
];

// const handleSaveDraft = async () => {
//   await form.value.validate();
//   scrollToError();

//   const el = document.querySelector(".v-field--error:first-of-type");
//   if (el) {
//     // mode.value = "update";
//     return;
//   }

//   const payload: Partial<TVenue> = {
//     status: "DRAFT", // need to be allowed
//   };

//   if (venue.value.name === "")
//     return setSnackbar({
//       text: "Venue Name is required",
//       modal: true,
//       color: "error",
//     });
//   else if (venue.value.keywords.length == 0)
//     return setSnackbar({
//       color: "error",
//       modal: true,
//       text: "Please select at least one venue type keyword.",
//     });

//   if (venue.value.name !== "") payload.name = venue.value.name;
//   if (venue.value.keywords.length > 0) payload.keywords = venue.value.keywords;
//   if (venue.value.description !== "")
//     payload.description = venue.value.description;
//   processing.value = true;
//   await addNewVenue(payload);
//   navigateTo({
//     name: "country-venues-management-drafts",
//     params: { country: country, status: "all" },
//   });
//   processing.value = false;
// };

const handleNext = async () => {
  if (formValid.value) {
    if (venue.value.keywords.length === 0) {
      setSnackbar({
        color: "error",
        text: "Please select at least one venue type keyword",
        modal: true,
      });
    } else {
      //create new venue
      processing.value = true;
      const payload: Partial<TVenue> = {
        name: venue.value.name,
        keywords: venue.value.keywords,
        description: venue.value.description,
        form_steps: 2
      };

      // add status pending for created venue by admin member
      if (isAdminMember || isAdminSales) {
        payload.status = 'PENDING';
      }

      try {
        const { data: newVenueData, error } = await addNewVenue(payload);
      if (newVenueData.value) {
        const res = newVenueData.value as any;
        mode.value = "create";

        // redirect to admin-venue page for created venue by admin member
        const route = "country-venues-management-venue-venueId-formId";
        const adminMemberRoute = "country-venues-management-admin-venue-venueId";

        await navigateTo({
          name: (isAdminMember || isAdminSales) ? adminMemberRoute : route,
          params: { country: country, venueId: res.data._id, formId: 'address' },
        });
        
      }
      if (error.value) {
        const err = error.value as any;
        const errorDesc = err.data?.description;
        if (errorDesc) {
          setSnackbar({
            color: "error",
            text: errorDesc,
            modal: true,
          });
        }
      }

      } catch (error) {
        console.log(error);
        
      } finally {
        processing.value = false;
      }

    }
  }
};

const scrollToError = () => {
  // scroll into view
  if (mode.value !== "view") {
    const el = document.querySelector(".v-field--error:first-of-type");
    el?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    if (el) {
      return;
    }
  }
};

const handleExit = () => {
  navigateTo({ name: 'country-venues-management', params: { country } });
}

onMounted(async () => {
  mode.value = "create";
  cookiePage.value = 1;
  loading.value = false;
});
</script>

<style scoped>
.v-tab--selected {
  background-color: #1f4b3f !important;
}
</style>
