<template>
  <v-form
    ref="form"
    @submit.prevent
    v-model="formValid"
    :key="`${activePage}-${venueKey}`"
    class=""
    :disabled="mode == 'view'"
  >
    <v-app-bar :elevation="0" style="border-bottom: 2px solid #dedfe3">
      <!-- HEADER CREATE MODE -->
      <v-row
        v-if="mode == 'create' && activePage"
        no-gutters
        class="w-100 px-5"
      >
        <v-row no-gutters justify="center">
          <v-col
            cols="12"
            md="10"
            lg="8"
            xl="7"
            class="d-flex ga-7 align-center"
          >
            <span style="width: 90%">
              <span v-if="activePage" class="text-16px text-charcoal"
                >Step {{ activePage + `/7` }}
                <span class="text-18px text-secondary font-500">{{
                  pageItems?.find((x) => x?.page == activePage)?.title
                }}</span></span
              >
              <span
                ><v-progress-linear
                  v-if="activePage"
                  :model-value="(activePage / 7) * 100"
                  color="primary"
                  height="5"
                  rounded="lg"
                  class="mt-1"
                ></v-progress-linear
              ></span>
            </span>
            <span>
              <v-btn
                variant="outlined"
                border="secondary md"
                size="large"
                text="Exit"
                rounded="lg"
                @click="handleExitClick"
              />
            </span>
          </v-col>
        </v-row>
      </v-row>
      <!-- HEADER CREATE MODE -->

      <!-- HEADER UPDATE MODE -->
      <v-row
        v-else-if="(mode == 'update' || mode == 'view') && activePage"
        no-gutters
        class="w-100 px-5"
        justify="center"
      >
        <v-col
          cols="12"
          md="10"
          lg="8"
          xl="7"
          class="d-flex align-center justify-space-between pa-0 ma-0"
        >
          <v-col
            v-if="mdAndUp"
            cols="8"
            sm="10"
            lg="auto"
            class="d-flex justify-start pa-0 ma-0"
          >
            <v-tabs
              :model-value="activePage"
              selected-class="bg-transparent"
              density="compact"
              show-arrows
              size="small"
              height="50px"
            >
              <template v-for="tabItem in pageItems" :key="tabItem?.title">
                <v-tab
                  v-if="tabItem?.title"
                  :value="tabItem?.page"
                  :ripple="false"
                  color="secondary"
                  selected-class="text-secondary font-500"
                  size="x-small"
                  @click="
                    navigateTo({
                      name: pageRoute,
                      params: { country, venueId, formId: tabItem?.id },
                    })
                  "
                  class="text-charcoal text-14px py-0"
                  :style="{
                    borderBottom:
                      activePage == tabItem?.page
                        ? '2px solid rgba(var(--v-theme-secondary)'
                        : '',
                  }"
                  >{{ tabItem?.title }}</v-tab
                >
              </template>
            </v-tabs>
          </v-col>
          <v-col v-else class="d-flex align-center">
            <v-select
              :model-value="activePage"
              :items="pageItems.filter((x) => x.title !== '')"
              item-title="title"
              item-value="page"
              hide-details
              rounded="lg"
              :disabled="false"
              :menu-props="{ maxHeight: 'none' }"
              @update:model-value="handlePageChange"
            ></v-select>
          </v-col>
          <span class="">
            <v-btn
              variant="outlined"
              border="secondary md"
              size="large"
              text="Exit"
              rounded="lg"
              @click="handleExitClick"
            />
          </span>
        </v-col>
      </v-row>
      <!-- HEADER UPDATE MODE -->
    </v-app-bar>

    <v-main>
      <LoadingDefault v-if="loading" />
      <v-row v-else no-gutters>
        <v-row no-gutters class="w-100 h-100 px-5 px-md-0" justify="center">
          <v-col
            v-if="isAdmin"
            cols="12"
            md="10"
            lg="8"
            xl="7"
            class="d-flex ga-2 align-center px-2 px-sm-5 pt-2 px-md-0"
          >
            <!-- <AlertAdminStatus
              v-if="
                !ownerVerified &&
                !loading &&
                isAdmin &&
                status == 'FOR_APPROVAL'
              "
              :admin-status-message="{
                color: 'error',
                message: 'This account is not yet fully verified!',
              }"
            /> -->
          </v-col>

          <v-col cols="12" md="10" lg="8" xl="7" class="py-5">
            <v-row
              v-if="mode == 'update'"
              no-gutters
              class="w-100 text-20px font-500 mb-10 d-flex align-center justify-space-between"
            >
              <span>{{ pageItems[activePage || 1]?.title }}</span>
              <span>
                <div class="d-flex align-center ga-2 py-2 py-md-3">
                  <span>
                    <v-badge
                      :color="formatColor(status as string)"
                      content="6"
                      inline
                      dot
                    ></v-badge>
                  </span>
                  <span class="font-400 text-16px">{{
                    formatStatus(status as string)
                  }}</span>
                </div>
              </span>
            </v-row>
            <VenueFormOverview v-if="activePage == 1" v-model="venue" />
            <VenueFormAddressAndLocation
              v-if="activePage == 2"
              v-model="venue"
            />
            <VenueFormFoodAndBeverages
              v-if="activePage === 3"
              v-model="venue"
            />
            <VenueFormVenueDetails v-if="activePage === 4" v-model="venue" />
            <VenueFormVenuePolicyDetails
              v-else-if="activePage === 5"
              v-model="venue"
            />
            <template v-if="isAdmin">
              <VenueFormPaymentOptions
                v-if="activePage === 6"
                v-model="venue"
              />
              <VenueFormVenueSpaces v-if="activePage === 7" />
              <VenueFormReviewVenue
                v-if="activePage === 8"
                v-model="venue"
                @refresh-venue="handleRefreshVenue"
                @go-to-spaces="
                  navigateTo({
                    name: pageRoute,
                    params: { country, venueId, formId: 'spaces' },
                  })
                "
              />
            </template>
            <template v-else>
              <VenueFormVenueSpaces v-if="activePage === 6" />
              <VenueFormReviewVenue
                v-if="activePage === 7"
                v-model="venue"
                @refresh-venue="handleRefreshVenue"
                @go-to-spaces="
                  navigateTo({
                    name: pageRoute,
                    params: { country, venueId, formId: 'spaces' },
                  })
                "
              />
            </template>
          </v-col>
        </v-row>
      </v-row>
    </v-main>

    <v-app-bar
      :elevation="0"
      location="bottom"
      style="border-top: 2px solid #dedfe3"
    >
      <!-- FOOTER -->
      <v-row no-gutters class="w-100 px-5">
        <v-row no-gutters class="w-100 h-100" justify="center">
          <v-col cols="12" md="10" lg="8" xl="7" class="">
            <v-row no-gutters class="w-100 h-100" align="center">
              <v-col cols="6">
                <v-btn
                  v-if="activePage !== 1"
                  variant="outlined"
                  border="secondary md"
                  color="secondary"
                  @click.stop="handlePrevious"
                  rounded="lg"
                  size="large"
                  class=""
                  :loading="backButtonLoading"
                  >Back</v-btn
                >
              </v-col>
              <v-col cols="6" class="d-flex justify-end">
                <!-- <v-btn type="submit" rounded="lg" size="large" v-if="activePage === 7 && isVenueOwner"
                                    color="secondary" variant="flat" :disabled="false" :loading="updatingVenue"
                                    @click.stop="handleExit" class="">Publish Venue</v-btn> -->

                <p
                  v-if="
                    !atleastOneSpaceFinished &&
                    formId == 'spaces' &&
                    mode !== 'view' &&
                    !isSubscriptionBased
                  "
                  class="text-disabled font-400 text-14px"
                >
                  Finish adding spaces before you continue
                </p>
                <v-btn
                  v-else-if="
                    (isAdmin && activePage !== 8) ||
                    (!isAdmin && activePage !== 7)
                  "
                  :type="mode === 'view' ? 'button' : 'submit'"
                  color="secondary"
                  rounded="lg"
                  size="large"
                  variant="flat"
                  @click.stop="handleNext"
                  :loading="updatingVenue"
                  class=""
                  :text="
                    mode == 'create' || formId == 'spaces' || mode == 'view'
                      ? 'Next'
                      : 'Save & Continue'
                  "
                />

                <template v-if="activePage == 8 && isAdmin">
                  <v-btn
                    v-if="isForRejection"
                    color="rejected"
                    variant="flat"
                    text="Reject"
                    size="large"
                    rounded="lg"
                    class="mr-2"
                    @click="showRejectPrompt = true"
                  ></v-btn>

                  <v-btn
                    v-if="isAllowSuspend"
                    color="rejected"
                    variant="flat"
                    text="Suspend"
                    size="large"
                    rounded="lg"
                    class="mr-2"
                    @click="showSuspendPrompt = true"
                  ></v-btn>

                  <v-btn
                    v-if="isForDeletion"
                    color="rejected"
                    variant="flat"
                    text="Approve Delete"
                    size="large"
                    rounded="lg"
                    class="mr-2"
                    @click="showPermanentlyDeletePrompt = true"
                  ></v-btn>

                  <v-btn
                    v-if="status == 'FOR_APPROVAL'"
                    :disabled="!isForApproval"
                    color="secondary"
                    variant="flat"
                    text="Approve"
                    size="large"
                    rounded="lg"
                    @click="handleAdminAction('PUBLISHED')"
                  ></v-btn>
                </template>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-row>
      <!-- FOOTER -->
    </v-app-bar>
  </v-form>
  <LoadingTransparent v-if="processing" />

  <DialogDeletePrompt
    v-model:delete="showPromptDelete"
    prompt-title="Are you sure you want to delete this venue?"
    prompt-text="Please note that deletion requires approval."
    agree-button-text="Proceed"
    disagree-button-text="No"
    @disagree="showPromptDelete = false"
    @agree="handleDeleteVenue"
    max-width="500"
    :showHeaderMessage="true"
  />

  <DialogPromptNew
    v-model="showSuspendPrompt"
    prompt-title="Are you sure you want to suspend this venue?"
    prompt-text="Please note that by proceeding, this venue will be removed from the listing."
    agree-button-text="Suspend"
    disagree-button-text="Nevermind"
    @agree="handleAdminAction('SUSPENDED')"
    show-header-message
    agree-button-color="rejected"
  />

  <DialogPromptNew
    v-model="showRejectPrompt"
    prompt-title="Are you sure you want to reject approval of this venue?"
    prompt-text="Please note that by proceeding, this venue will not be listed."
    agree-button-text="Reject"
    disagree-button-text="No"
    @disagree="showRejectPrompt = false"
    @agree="handleAdminAction('REJECTED')"
    show-header-message
    agree-button-color="rejected"
  />

  <DialogPromptNew
    v-model="showPermanentlyDeletePrompt"
    @agree="handlePermanentlyDelete"
    prompt-title="Are you sure you want to permanently delete this venue?"
    prompt-text="Please note that this action can't be undone."
    disagree-button-text="Nevermind"
    agree-button-text="Delete it!"
    agree-button-color="rejected"
  />

  <DialogRestorePrompt
    v-model="showRestorePrompt"
    prompt-title="Are you sure you want to restore this venue?"
    prompt-text="Note that this venue will be restored under approval section."
    agree-button-text="Restore"
    disagree-button-text="No"
    @disagree="showRestorePrompt = false"
    @agree="handleRestoreVenue"
    :showHeaderMessage="true"
  />

  <DialogPromptNew
    v-model="showExitDraftDialog"
    @agree="handleSave"
    @disagree="handleExit"
    :prompt-title="`Unsaved Venue`"
    prompt-text="Are you sure to exit this page with an unfinished venue or save this venue as a draft?"
    disagree-button-text="Exit Page"
    agree-button-text="Save as draft"
  />

  <DialogPromptNew
    v-model="showExitDialog"
    @agree="handleSave"
    @disagree="handleExit"
    :prompt-title="`Unsaved Progress`"
    prompt-text="Are you sure to exit this page with an unsaved progress or save your progress?"
    disagree-button-text="Exit Page"
    agree-button-text="Save Progress"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "bare",
  middleware: ["auth", "owner-admin-access"],
});
import MVenue from "~/models/venue.model";
import MSpace from "~/models/space.model";
import { useDisplay } from "vuetify";
const { smAndUp, lgAndUp, mdAndUp } = useDisplay();

const {
  defaultSnackbar,
  defaultSnackbarText,
  defaultSnackbarColor,
  country,
  setSnackbar,
} = useLocal();
const { venueId, formId } = useRoute().params;

const {
  mode,
  venue,
  updateVenue,
  adminDeleteVenue,
  deleteVenue,
  getVenue,
  activeStatus,
  adminUpdateVenue,
  showCustomValidationDays,
  showCustomValidationRates,
  activePage,
  isSubscriptionBased,
} = useVenue();
const { spaces, getSpaceList, space } = useSpace();
const { currentUser } = useLocalAuth();
const { formatColor, formatStatus } = useUtils();
const {
  isVenueMember,
  isVenueOwner,
  isVenueAdmin,
  isAdmin,
  isUser,
  isAdminSales,
  isAdminMember,
} = useAccess();

const clonedVenueData = ref(); // cloned initial venue data before changes
const formValid = ref<boolean>(false);
const form = ref();
const loading = ref(true);
const showPublishPrompt = ref(false);
const showPromptDelete = ref(false);
const showSuspendPrompt = ref(false);
const showRejectPrompt = ref(false);
const showApprovedPrompt = ref(false);
const showRestorePrompt = ref(false);
const showPermanentlyDeletePrompt = ref(false);
const deletedSucessDialog = ref(false);
// const activePage = ref(1);
const processing = ref(false);
const approveInfo = ref(false);
const updatingVenue = ref(false);
const venueKey = ref(0);
const showNotYetDonePrompt = ref(false);
const showExitDraftDialog = ref(false);
const showExitDialog = ref(false);

const cookiePage = useCookie<number>("cookie_page");

const status = computed(() => {
  return venue.value?.status;
});

// allow approval of venue if no space for approval and one published venue;
const isForApproval = computed(() => {
  const atLeastOneIsPublished = spaces.value?.some(
    (x: TVenueSpace) => x.status == "PUBLISHED"
  );
  const noPendingForApproval = !spaces.value?.some(
    (x: TVenueSpace) => x.status == "FOR_APPROVAL"
  );
  return atLeastOneIsPublished && noPendingForApproval;
});

const isForRejection = computed(() => {
  const status = venue.value.status;
  return status === "FOR_APPROVAL";
});

const isAllowSuspend = computed(() => {
  const status = venue.value.status;
  return status === "PUBLISHED";
});

const isForDeletion = computed(() => {
  return venue.value.status === "FOR_DELETION";
});

const isDRAFT = computed(() => {
  const status = venue.value.status;
  return status == "DRAFT";
});

const isVenueDeletedOrForDeletion = computed(() => {
  const status = venue.value.status;
  return status == "DELETED" || status === "FOR_DELETION";
});
const isSpaceDeletedOrForDeletion = computed(() => {
  const status = venue.value.status;
  return status == "DELETED" || status === "FOR_DELETION";
});

// const adminStatusMessage = computed(() => {
//     const status = venue.value.status;

//     if (status == "DRAFT")
//         return { color: "draft", message: "This Venue is a draft." };
//     else if (status == "FOR_APPROVAL")
//         return { color: "for_approval", message: "This Venue is for approval." };
//     else if (status == "PUBLISHED")
//         return { color: "published", message: "This Venue is approved!" };
//     else if (status == "REJECTED")
//         return { color: "rejected", message: "This Venue has been rejected." };
//     else if (status == "SUSPENDED")
//         return { color: "suspended", message: "This Venue has been suspended." };
//     else if (status == "FOR_DELETION")
//         return { color: "for_deletion", message: "This Venue is for deletion." };
//     else if (status == "INPROGRESS")
//         return { color: "inprogress", message: "This Venue is in progress." };
//     else if (status == "ARCHIVED")
//         return { color: "archived", message: "This Venue is archived." };
// });

const venueListerPage = {
  name: "country-venues-management",
  params: { country: country },
};

const pageRoute = "country-venues-management-venue-venueId-formId";

const pageItems = [
  {
    title: "",
    id: "",
  },
  {
    title: "Overview",
    page: 1,
    id: "overview",
  },
  {
    title: "Address",
    page: 2,
    id: "address",
  },
  {
    title: "Food & Beverages",
    page: 3,
    id: "food&beverages",
  },
  {
    title: "Venue Details",
    page: 4,
    id: "venue-details",
  },
  {
    title: "Policy",
    page: 5,
    id: "policy",
  },
  {
    title: isAdmin ? "Payment Options" : "",
    page: isAdmin ? 6 : Infinity,
    id: "payment-options",
  },
  {
    title: "Spaces",
    page: isAdmin ? 7 : 6,
    id: "spaces",
  },
  {
    title: "Review",
    page: isAdmin ? 8 : 7,
    id: "review",
  },
];

// watchEffect(() => {
//     activePage.value = pageItems.find(x => x.id == 'formId')?.page || 1;
// });

// const handleChangePage = async (index: number) => {
//     if (mode.value == "view") {
//         cookiePage.value = index;
//     } else {
//         await form.value.validate();
//         scrollToError();
//         const el = document.querySelector(".v-field--error:first-of-type");
//         const el2 = document.querySelector(".v-input--error:first-of-type");
//         if (el || el2) {
//             // mode.value = "update";
//             return;
//         }
//         await handleUpdateVenue();
//         cookiePage.value = index;
//     }
// };

const handleExitClick = () => {
  const clonedVenueAfter = JSON.stringify(venue.value);

  // exit automatic if no changes were made
  if (clonedVenueData.value == clonedVenueAfter) {
    handleExit();
    return;
  }

  // automatic exit when admin
  if (isAdmin || mode.value == "view") {
    handleExit();
    return;
  }

  // no prompt for page 6 and 7
  if (activePage.value == 7 || activePage.value == 8) {
    handleExit();
    return;
  }

  const status = space.value?.status;
  if (status == "DRAFT" || status == "INPROGRESS") {
    showExitDraftDialog.value = true;
  } else {
    showExitDialog.value = true;
  }
};

const handleSave = async () => {
  await saveProgress("exit");
};

const handleExit = () => {
  navigateTo({ name: "country-venues-management", params: { country } });
};

// get venue data

const handleRefreshVenue = async () => {
  const { data: venueData, error } = await getVenue(venueId as string);
  if (venueData) {
    const res = venueData.value as any;
    if (!res || !res.data || res.data.data.length === 0) {
      navigateTo(venueListerPage);
      setSnackbar({
        color: "error",
        modal: true,
        text: "Something is wrong. Please try again later.",
      });
      return;
    }
    venue.value = new MVenue(res.data.data[0]);
    venueKey.value++;
    setTimeout(() => {
      clonedVenueData.value = JSON.stringify(venue.value);
    }, 300);
  }

  if (error.value) {
    setSnackbar({
      color: "error",
      modal: true,
      text: "Something is wrong. Please try again later.",
    });
    navigateTo(venueListerPage);
  }
};
// refreshVenueFunc();

// get space list

// const assignSpaceList = async () => {
//     const { data: spaceListData, refresh: refreshSpaceList } = await getSpaceList(
//         venueId as string,
//     );
//     if (spaceListData) {
//         const res = spaceListData.value as any;
//         spaces.value = res.data.data;
//     }
// };
// assignSpaceList();

// check if at least one space is created && finished (to add logic for status)
const atleastOneSpaceFinished = computed(() => {
  // spaces.value.find(
  //     (x) => x.status === "FOR_APPROVAL" || x.status === "PUBLISHED",
  // )
  const status = venue.value?.status;
  if (status == "FOR_APPROVAL" || status == "PUBLISHED") {
    return true;
  } else {
    return false;
  }
});

watchEffect(() => {
  // if (activePage.value == 7 && !loading.value) {
  //     triggerApproveInforPrompt();
  // }

  if (spaces.value.some((x) => x.status == "PUBLISHED")) {
    approveInfo.value = false;
  }

  if (activePage.value == 7) {
    approveInfo.value = false;
  }

  if (activePage.value == 7) {
    if (
      !isAdmin &&
      venue.value?.status == "DRAFT" &&
      spaces.value.some((x) => x.status == "FOR_APPROVAL")
    ) {
      showNotYetDonePrompt.value = true;
    } else showNotYetDonePrompt.value = false;
  }
});

// change route on mobile view
const handlePageChange = (val: number) => {
  if (!val) return;
  const newFormId = pageItems.find((x) => x.page == val)?.id;
  if (!newFormId) return;
  navigateTo({
    name: pageRoute,
    params: { country, venueId, formId: newFormId },
  });
};

const handleGoToNextPage = async () => {
  if (!activePage.value) return;
  if (activePage.value < 8) {
    const nextPageParams = pageItems.find(
      (x) => activePage.value && x.page == activePage.value + 1
    )?.id;
    if (!nextPageParams) return;
    navigateTo(
      `/${country}/venues/management/venue/${venueId}/${nextPageParams}`
    );
  }
};

// const handleChangeTab = (page: number) => {
//     const selectedPageParams = pageItems[page]?.id
//     if (!selectedPageParams) return;
//     navigateTo(`/${country}/venues/management/venue/${venueId}/${selectedPageParams}`)
// }

const backButtonLoading = ref(false);

const handlePrevious = async () => {
  if (activePage.value && activePage.value > 1) {
    backButtonLoading.value = true;

    // update form_steps when in create mode only
    if (!isAdmin && mode.value == "create") {
      await updateVenue(venueId as string, {
        form_steps: activePage.value - 1,
      });
    }
    const nextPageParams = pageItems.find(
      (x) => activePage.value && x.page == activePage.value - 1
    )?.id;
    if (!nextPageParams) return;
    navigateTo(
      `/${country}/venues/management/venue/${venueId}/${nextPageParams}`
    );
    // backButtonLoading.value = false;
  }
};

const saveProgress = async (type?: "exit") => {
  await form.value.validate();
  scrollToError();

  const el = document.querySelector(".v-field--error:first-of-type");
  if (el) {
    // mode.value = "update";
    showExitDialog.value = false;
    showExitDraftDialog.value = false;
    return;
  }

  if (activePage.value == 1 && venue.value.keywords.length == 0) {
    showExitDialog.value = false;
    showExitDraftDialog.value = false;
    setSnackbar({
      color: "error",
      modal: true,
      text: "Please select at least one venue type keyword.",
    });
    return;
  }

  // if (status === "DRAFT") {
  //     space.value.status = "DRAFT";
  //     await handleUpdateVenue();
  //     navigateTo(venueListerPage);
  // } else {

  // }
  processing.value = true;
  await handleUpdateVenue("save");
  await handleRefreshVenue();
  processing.value = false;
  showExitDialog.value = false;
  showExitDraftDialog.value = false;
  type == "exit" && handleExit();
  // mode.value = "view";
};

// const handleSaveDraft = async () => {
//   await form.value.validate();
//   scrollToError();

//   const el = document.querySelector(".v-field--error:first-of-type");
//   if (el) {
//     mode.value = "update";
//     return;
//   }

//   venue.value.status = "DRAFT";
//   await handleUpdateVenue();
//   navigateTo(venueListerPage);
// };

const handleNext = async () => {
  await form.value.validate();
  scrollToError();
  const el = document.querySelector(".v-field--error:first-of-type");
  if (el) {
    // mode.value = "update";
    return;
  }

  if (formValid.value) {
    if (activePage.value === 1 && venue.value.keywords.length === 0) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      setSnackbar({
        color: "error",
        text: "Please select at least one keyword",
        modal: true,
      });
    } else if (
      activePage.value === 5 &&
      venue.value.cancellation_policy.policy?.cancellation_range === "CUSTOM"
    ) {
      if (showCustomValidationDays.value || showCustomValidationRates.value) {
        showExitDialog.value = false;
        showExitDraftDialog.value = false;
        return;
      }
      await handleUpdateVenue();
      handleGoToNextPage();
    } else if (activePage.value === 8) {
      // if (venue.value.venue_spaces.length === 0) {
      //     showExitDialog.value = false;
      //     showExitDraftDialog.value = false;
      //     setSnackbar({
      //         color: "error",
      //         text: "Please add at least one space",
      //         modal: true,
      //     });
      //     return;
      // }
      await handleUpdateVenue();
      navigateTo({
        name: "country-venues-management",
        params: { country: country },
      });
    } else {
      await handleUpdateVenue();
      await form.value.resetValidation();
      handleGoToNextPage();
    }
  } else {
    return;
  }
};

const handleUpdateVenue = async (type?: "save") => {
  if (!formValid.value) return;
  if (mode.value == "view") return;

  updatingVenue.value = true;

  const payload: Partial<TVenue> = {
    // status: venue.value.status,
  };
  const {
    address,
    foods_and_beverages,
    venue_details,
    cancellation_policy,
    name,
    description,
    keywords,
    age_restriction,
    status,
    payment_method,
  } = venue.value;
  if (activePage.value === 1) {
    payload.name = name;
    payload.description = description;
    payload.keywords = keywords;
  } else if (activePage.value === 2) {
    payload.address = address;
  } else if (activePage.value === 3) {
    if (foods_and_beverages.length > 0) {
      payload.foods_and_beverages = foods_and_beverages;
    }
  } else if (activePage.value === 4) {
    if (venue_details.length > 0) {
      payload.venue_details = venue_details;
    }
    payload.age_restriction = age_restriction;
    // if (age_restriction.answer) {
    //     payload.age_restriction = age_restriction;
    // }
  } else if (activePage.value === 5) {
    const { _id, createdAt, venue_id, ...rest } = cancellation_policy;
    payload.cancellation_policy = rest;
  } else if (isAdmin && activePage.value == 6) {
    console.log("admin", isAdmin);

    payload.payment_method = payment_method;
  }

  // ensure that payload has status
  if (!status) {
    delete payload.status;
  }

  if (
    !isAdmin &&
    type !== "save" &&
    mode.value == "create" &&
    activePage.value &&
    activePage.value < 7
  ) {
    payload.form_steps = activePage.value + 1;
  }

  // ensure that payload is not empty
  if (Object.keys(payload).length === 0) {
    updatingVenue.value = false;
    return;
  }

  try {
    await updateVenue(venueId as string, payload);
  } catch (er) {
    console.log(er);
    updatingVenue.value = false;
    processing.value = false;
  }

  await handleRefreshVenue();
  // updatingVenue.value = false;
};

// const handlePromptVenueDelete = () => {
//     const status = venue.value.status;
//     if (status == "FOR_APPROVAL" || status == "PUBLISHED") {
//         showPromptDelete.value = true;
//     } else {
//         showPermanentlyDeletePrompt.value = true;
//     }
// };

const handleDeleteVenue = async () => {
  showPromptDelete.value = false;
  processing.value = true;
  try {
    await updateVenue(venueId as string, { status: "FOR_DELETION" });
    setSnackbar({
      color: "success",
      text: "Venue is submitted for deletion approval!",
      modal: true,
    });
    navigateTo(venueListerPage);
  } catch (error) {
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  }
  processing.value = false;
};

const handlePermanentlyDelete = async () => {
  showPermanentlyDeletePrompt.value = false;
  processing.value = true;
  try {
    isAdmin
      ? await adminDeleteVenue(venueId as string)
      : await deleteVenue(venueId as string);
    setSnackbar({
      color: "success",
      text: "Venue Deleted Successfully!",
      modal: true,
    });
    navigateTo(venueListerPage);
  } catch (error) {
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  }
  processing.value = false;
};

const handleRestoreVenue = async () => {
  processing.value = true;
  try {
    await updateVenue(venueId as string, { status: "FOR_APPROVAL" });
    navigateTo(venueListerPage);
    setSnackbar({
      color: "success",
      text: `${venue.value.name} has been restored successfully!`,
      modal: true,
    });
  } catch (error: any) {
    setSnackbar({
      color: "error",
      text: error,
      modal: true,
    });
  }
  await handleRefreshVenue();
  processing.value = false;
};

const handleAdminAction = async (
  status: "SUSPENDED" | "PUBLISHED" | "REJECTED"
) => {
  showSuspendPrompt.value = false;
  processing.value = true;

  const pageRouteList = "country-venues-management";
  try {
    await adminUpdateVenue(venueId as string, { status });
    if (status === "PUBLISHED") {
      setSnackbar({
        color: "success",
        text: "Venue Approved Successfully!",
        modal: true,
      });
    } else if (status === "SUSPENDED") {
      setSnackbar({
        color: "info",
        text: "Venue Suspended Successfully!",
        modal: true,
      });
      activeStatus.value = "Suspended";
    } else if (status === "REJECTED") {
      setSnackbar({
        color: "info",
        text: "Venue Rejected Successfully!",
        modal: true,
      });
      activeStatus.value = "Rejected";
    }
  } catch (error) {
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  } finally {
    activeStatus.value = "All";
    navigateTo({
      name: pageRouteList,
      params: { country },
    });
    processing.value = false;
  }
};

// validation at review page
const handlePublishValidation = () => {
  const policyObj = venue.value.cancellation_policy.policy;

  const {
    age_restriction,
    cancellation_policy,
    address,
    name,
    keywords,
    description,
    foods_and_beverages,
  } = venue.value;

  const liquorLicenseObj = foods_and_beverages.find((x) => x.key == "4");
  const venueDetailsObj0 = venue.value.venue_details.find((x) => x.key == "0");
  const venueDetailsObj2 = venue.value.venue_details.find((x) => x.key == "2");
  const venueDetailsObj4 = venue.value.venue_details.find((x) => x.key == "4");
  const showError = (page: number, message: string) => {
    cookiePage.value = page;
    setSnackbar({
      text: message,
      modal: true,
      color: "error",
    });
  };

  if (name === "" || keywords.length === 0 || description === "") {
    showError(1, "Please complete the fields.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (description.length < 300 || description.length > 2000) {
    showError(1, "Minimum of 300 characters and maximum of 2000 characters.");
    mode.value = "update";
    return;
  } else if (
    address?.country === "" ||
    address?.street === "" ||
    address?.city === "" ||
    address?.state === "" ||
    address?.postal_code === ""
  ) {
    showError(2, "Please complete the fields.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  }
  // else if(liquorLicenseObj?.answer && (liquorLicenseObj.max_capacity == null || liquorLicenseObj.max_capacity == null)) {
  //   showError(3, "Please complete the fields.");
  //   return;
  // }
  else if (
    venueDetailsObj0?.answer &&
    (venueDetailsObj0?.max_capacity === null ||
      venueDetailsObj0?.max_capacity == "")
  ) {
    showError(4, "Please complete the field.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (
    venueDetailsObj2?.answer &&
    (venueDetailsObj2?.max_capacity === null ||
      venueDetailsObj2?.max_capacity == "")
  ) {
    showError(4, "Please complete the field.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (
    venueDetailsObj4?.answer &&
    (venueDetailsObj4?.max_capacity === null ||
      venueDetailsObj4?.max_capacity == "")
  ) {
    showError(4, "Please complete the field.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (
    age_restriction.answer &&
    (age_restriction.enforcement_time === "" ||
      age_restriction.min_age_requirement === null)
  ) {
    showError(4, "Please complete the field.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (!atleastOneSpaceFinished.value) {
    showError(6, "Please finish at least one space");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (cancellation_policy.description === "") {
    showError(5, "Please complete the fields.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (
    cancellation_policy.policy.cancellation_range === "CUSTOM" &&
    (!policyObj.custom.days_at_least.number_of_days ||
      !policyObj.custom.days_at_least.total_price ||
      !policyObj.custom.days_less_than.number_of_days ||
      !policyObj.custom.days_less_than.total_price ||
      policyObj.custom.days_less_than_but_at_least.some(
        (x) => !x.days_less_than || !x.days_at_least || !x.total_price
      ))
  ) {
    showError(5, "Please complete the custom fields.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else if (
    cancellation_policy.policy.cancellation_range === "CUSTOM" &&
    (showCustomValidationDays.value || showCustomValidationRates.value)
  ) {
    showError(5, "Please input valid range of days or rates.");
    mode.value = mode.value == "view" ? "update" : mode.value;
  } else if (
    venue.value.cancellation_policy.allow_rescheduling.answer &&
    !venue.value.cancellation_policy.allow_rescheduling.months
  ) {
    showError(5, "Please complete the fields.");
    mode.value = mode.value == "view" ? "update" : mode.value;
    return;
  } else {
    showPublishPrompt.value = true;
  }
};

const handlePublish = async () => {
  processing.value = true;
  try {
    await updateVenue(venueId as string, { status: "FOR_APPROVAL" });
  } catch (e) {
    console.log(e);
    setSnackbar({
      modal: true,
      color: "error",
      text: "Something went wrong. Please try again later.",
    });
    processing.value = false;
  }
  navigateTo(venueListerPage);
  processing.value = false;
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

const getActivePage = async () => {
  const formStep = venue.value.form_steps;
  if (!isAdmin && mode.value == "create") {
    if (formStep && formStep > 1 && formStep < 9) {
      const pageParams = pageItems.find((x) => x.page == formStep)?.id;
      if (pageParams) {
        await navigateTo(
          `/${country}/venues/management/venue/${venueId}/${pageParams}`
        );
      } else {
        await navigateTo(
          `/${country}/venues/management/venue/${venueId}/overview`
        );
      }
    } else {
      await navigateTo(
        `/${country}/venues/management/venue/${venueId}/overview`
      );
    }
  }

  activePage.value = pageItems.find((x) => x.id == formId)?.page || 1;
};

const scrollToTop = () => {
  process.client && window.scrollTo(0, 0);
};

const checkMode = async () => {
  const status = venue.value?.status;
  // conditions to check for read-only
  if (
    isVenueMember ||
    space.value.status == "DELETED" ||
    (isAdminMember && status !== "REQUEST_FOR_CONSENT") ||
    isAdminSales
  ) {
    mode.value = "view";
    return;
  }
  (await (isDRAFT.value && !isAdmin))
    ? (mode.value = "create")
    : (mode.value = "update");
};

const { checkOwnerOnboardingStatus } = useVerified();
const ownerVerified = ref(false);

const fetchOnboardingStatus = async () => {
  if (!isAdmin || status.value !== "FOR_APPROVAL") return;
  const userId = venue.value?.user?._id;

  if (!userId) return;
  // try {
  //   const res = await checkOwnerOnboardingStatus(userId);
  //   if (res == true) {
  //     ownerVerified.value = true;
  //   }
  // } catch (e) {
  //   console.log(e);
  // }
};

onMounted(async () => {
  await handleRefreshVenue();
  await checkMode();
  await getActivePage();
  loading.value = false;
  space.value = new MSpace({});
});
</script>

<style scoped>
.v-tab--selected {
  background-color: #1f4b3f !important;
}
</style>
