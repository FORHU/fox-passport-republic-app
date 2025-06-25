<template>
  <v-form
    ref="form"
    @submit.prevent
    v-model="formValid"
    :disabled="mode == 'view'"
  >
    <v-app-bar :elevation="0" style="border-bottom: 2px solid #dedfe3">
      <!-- HEADER CREATE MODE -->
      <v-row
        v-if="mode == 'create' && activeSpacePage"
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
              <span class="text-16px text-charcoal"
                >Step {{ activeSpacePage + "/6" }}
                <span class="text-18px text-secondary font-500">{{
                  pageItems[activeSpacePage].title
                }}</span></span
              >
              <span
                ><v-progress-linear
                  :model-value="(activeSpacePage / 6) * 100"
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
                text="Exit Space"
                rounded="lg"
                @click="handleExitClick"
              />
            </span>
          </v-col>
        </v-row>
      </v-row>
      <!-- HEADER CREATE MODE-->

      <!-- HEADER UPDATE MODE -->
      <v-row
        v-else-if="(mode == 'update' || mode == 'view') && activeSpacePage"
        no-gutters
        class="w-100 px-5"
        justify="center"
      >
        <v-col
          cols="12"
          md="10"
          lg="8"
          xl="7"
          class="d-flex align-center justify-space-between"
        >
          <v-col
            v-if="mdAndUp"
            cols="9"
            sm="10"
            lg="auto"
            class="d-flex justify-start pa-0 ma-0"
          >
            <v-tabs
              :model-value="activeSpacePage"
              align-tabs="center"
              class="px-0 mx-0"
              height="50px"
              selected-class="bg-transparent"
              density="compact"
              show-arrows
            >
              <template v-for="tabItem in pageItems" :key="tabItem?.title">
                <v-tab
                  v-if="tabItem?.title"
                  :value="tabItem?.page"
                  :ripple="false"
                  color="secondary"
                  selected-class="text-secondary font-500"
                  @click="
                    navigateTo({
                      name: pageRoute,
                      params: {
                        country,
                        venueId,
                        spaceId,
                        spaceFormId: tabItem?.id,
                      },
                    })
                  "
                  class="text-charcoal text-16px"
                  :style="{
                    borderBottom:
                      activeSpacePage == tabItem?.page
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
              :model-value="activeSpacePage"
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
      <!-- HEADER UPDATE MODE  -->
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
            class="d-flex ga-2 align-center px-2 pt-2 px-sm-5 px-md-0"
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
          <v-col cols="12" md="10" lg="8" xl="7" class="py-10">
            <v-row
              v-if="mode == 'update'"
              no-gutters
              class="w-100 text-20px font-500 mb-10 d-flex align-center justify-space-between"
            >
              <span>{{ pageItems[activeSpacePage || 1]?.title }}</span>
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
            <VenueFormSpaceDetails
              v-if="activeSpacePage === 1"
              v-model="space"
              @save-draft="handleUpdateSpace()"
            />
            <VenueFormSpacePhotos
              v-if="activeSpacePage === 2"
              v-model="space"
            />
            <VenueFormSpaceCapacityAndLayouts
              v-if="activeSpacePage === 3"
              v-model="space"
              @save-draft="handleUpdateSpace()"
              @refresh-space-data="refreshSpaceData"
              @clear-validation="form.resetValidation()"
            />
            <VenueFormSpaceFeatures
              v-if="activeSpacePage === 4"
              v-model="space"
            />
            <VenueFormSpaceKeywords
              v-if="activeSpacePage === 5"
              v-model="space"
            />
            <VenueFormSpacePriceAndOpeningHours
              v-if="activeSpacePage === 6"
              v-model="space"
            />
          </v-col>
        </v-row>
      </v-row>
    </v-main>

    <v-app-bar
      :elevation="0"
      location="bottom"
      style="border-top: 2px solid #dedfe3"
    >
      <v-row no-gutters class="w-100 px-5">
        <v-row no-gutters class="w-100 h-100" justify="center">
          <v-col cols="12" md="10" lg="8" xl="7" class="">
            <v-row no-gutters class="w-100 h-100" align="center">
              <v-col cols="6">
                <v-btn
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
                <!-- ADMIN MEMBER/SALES BUTTONS -->
                <template v-if="(isAdminMember || isAdminSales)">
                  <v-btn
                    type="submit"
                    v-if="
                      activeSpacePage === 6 &&
                      (isAdminMember || isAdminSales) &&
                      status == 'PENDING'
                    "
                    rounded="lg"
                    size="large"
                    text="Publish"
                    color="secondary"
                    variant="flat"
                    class=""
                    :loading="updatingSpace"
                    @click.stop="handlePublishValidation"
                  />
                  <v-btn
                    v-else-if="activeSpacePage !== 6"
                    :type="mode === 'view' ? 'button' : 'submit'"
                    variant="flat"
                    color="secondary"
                    :text="
                      mode == 'create' || mode == 'view'
                        ? 'Next'
                        : 'Save & continue'
                    "
                    class=""
                    rounded="lg"
                    size="large"
                    :loading="updatingSpace"
                    @click.stop="handleNext"
                  />
                  <v-btn
                    v-else-if="
                      activeSpacePage == 6 &&
                      (status == 'REQUIRES_CONSENT' ||
                        status == 'REQUEST_TRANSFER_SENT')
                    "
                    :type="mode === 'view' ? 'button' : 'submit'"
                    variant="flat"
                    color="secondary"
                    text="Save"
                    class=""
                    rounded="lg"
                    size="large"
                    :loading="updatingSpace"
                    @click.stop="saveProgress"
                  />
                </template>

                <!-- ADMIN MEMBER/SALES BUTTONS -->

                <template v-else>
                  <v-btn
                    type="submit"
                    v-if="
                      activeSpacePage === 6 &&
                      mode !== 'view' &&
                      isVenueOwner &&
                      isAllowPublish
                    "
                    rounded="lg"
                    size="large"
                    text="Publish"
                    color="secondary"
                    variant="flat"
                    class=""
                    :loading="updatingSpace"
                    @click.stop="handlePublishValidation"
                  />
                  <v-btn
                    v-else-if="activeSpacePage !== 6"
                    :type="mode === 'view' ? 'button' : 'submit'"
                    variant="flat"
                    color="secondary"
                    :text="
                      mode == 'create' || mode == 'view'
                        ? 'Next'
                        : 'Save & continue'
                    "
                    class=""
                    rounded="lg"
                    size="large"
                    :loading="updatingSpace"
                    @click.stop="handleNext"
                  />
                  <v-btn
                    v-else-if="
                      !isAdmin &&
                      activeSpacePage == 6 &&
                      (status == 'PUBLISHED' || status == 'FOR_APPROVAL')
                    "
                    :type="mode === 'view' ? 'button' : 'submit'"
                    variant="flat"
                    color="secondary"
                    text="Save"
                    class=""
                    rounded="lg"
                    size="large"
                    :loading="updatingSpace"
                    @click.stop="saveProgress"
                  />
                </template>

                <template v-if="activeSpacePage == 6 && isAdmin">
                  <v-btn
                    class="d-sm-none"
                    icon="mdi-dots-horizontal"
                    @click="showApproveButtons = true"
                  />
                  <DialogApproveMobile
                    v-model="showApproveButtons"
                    :updating-space="updatingSpace"
                    :is-allow-suspend="isAllowSuspend"
                    :is-for-approval="isForApproval"
                    :is-for-deletion="isForDeletion"
                    @save="saveProgress"
                    @reject="showRejectPrompt = true"
                    @delete="showPermanentlyDeletePrompt = true"
                    @publish="handleAdminAction('PUBLISHED')"
                  />
                  <div v-if="smAndUp" class="d-flex align-center ga-2">
                    <v-btn
                      type="submit"
                      rounded="lg"
                      size="large"
                      text="Save"
                      color="secondary"
                      border="secondary md"
                      variant="outlined"
                      class=""
                      :loading="updatingSpace"
                      @click.stop="saveProgress"
                    />
                    <v-btn
                      v-if="isForApproval"
                      variant="flat"
                      color="rejected"
                      text="Reject"
                      size="large"
                      rounded="lg"
                      class=""
                      @click="showRejectPrompt = true"
                    ></v-btn>

                    <v-btn
                      v-if="isAllowSuspend"
                      variant="flat"
                      color="rejected"
                      text="Suspend"
                      size="large"
                      rounded="lg"
                      class=""
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
                      @click="showDeletePrompt = true"
                    ></v-btn>

                    <v-btn
                      :disabled="!isForApproval"
                      variant="flat"
                      color="secondary"
                      text="Approve"
                      size="large"
                      rounded="lg"
                      @click="handleAdminAction('PUBLISHED')"
                    ></v-btn>
                  </div>
                </template>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-row>
      <!-- FOOTER -->
    </v-app-bar>
  </v-form>

  <!-- <DialogDeletePrompt v-model:delete="showDeletePrompt" prompt-title="Are you sure you want to delete this space?"
        prompt-text="Please note that deletion requires approval." agree-button-text="Proceed" disagree-button-text="No"
        @disagree="showDeletePrompt = false" @agree="handleDeleteSpace" show-header-message />
-->
  <DialogPromptNew
    v-model="showDeletePrompt"
    prompt-title="Are you sure you want to delete this space?"
    prompt-text="Please note that your space won't be listed anymore."
    agree-button-text="Approve Delete"
    disagree-button-text="No"
    @disagree="showDeletePrompt = false"
    @agree="handleApproveDeleteSpace"
    show-header-message
    agree-button-color="rejected"
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

  <LoadingTransparent v-if="processing" />

  <DialogPromptNew
    v-model="showExitDraftDialog"
    @agree="handleSave"
    @disagree="handleExit"
    :prompt-title="`Unsaved Space`"
    prompt-text="Are you sure to exit this page with an unfinished space or save this space as a draft?"
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

  <DialogPromptNew
    v-model="showNoSelectedFeaturePrompt"
    @agree="handleProceedToNextPage"
    @disagree="showNoSelectedFeaturePrompt = false"
    prompt-title="No selected feature"
    prompt-text="Are you sure you want to proceed without selecting any feature?"
    disagree-button-text="No"
    :agree-button-text="isDRAFT ? 'Proceed to next page' : 'Save & continue'"
    :loading="updatingSpace"
  />
</template>

<script setup lang="ts">
import MSpace from "~/models/space.model";

definePageMeta({
  layout: "bare",
  middleware: ["auth", "owner-admin-access"],
});

import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

const { setSnackbar, country, currentCurrency } = useLocal();
const {
  isVenueMember,
  isVenueOwner,
  isVenueAdmin,
  isAdmin,
  isUser,
  isAdminMember,
  isAdminSales,
} = useAccess();
const { currentUser } = useLocalAuth();
const {
  updateSpace,
  getSpace,
  space,
  spaces,
  adminDeleteSpace,
  adminUpdateSpace,
  getFilteredSpaceList,
  getAllSpacesWithoutPagination,
} = useSpace();
const {
  mode,
  venue,
  activeSpacePage,
  updateVenue,
  isVenuePartOfVenueWithConsent,
} = useVenue();
const { formatColor, formatStatus } = useUtils();

const clonedSpaceData = ref();
const { spaceId, venueId, spaceFormId } = useRoute().params;
const cookieSpacePage = useCookie<number>("space_page");
const showPublishPrompt = ref(false);
const showDeletePrompt = ref(false);
const showApprovedPrompt = ref(false);
const showSuspendPrompt = ref(false);
const showRejectPrompt = ref(false);
const showPermanentlyDeletePrompt = ref(false);
const form = ref();
const processing = ref(false);
const formValid = ref(false);
const keyComponent = ref(0);
const updatingSpace = ref(false);
const loading = ref(false);
const showExitDraftDialog = ref(false);
const showExitDialog = ref(false);
const showApproveButtons = ref(false);
const showNoSelectedFeaturePrompt = ref(false);

// watchEffect(() => {
//     activeSpacePage.value = cookieSpacePage.value || 1;

//     // if(activeSpacePage.value === 2){
//     //   formValid.value = true;
//     // }
// });

const pageRoute =
  "country-venues-management-venue-venueId-spaces-spaceId-spaceFormId";
const venuePageName = "country-venues-management-venue-venueId-formId";
const adminVenuePageName = "country-venues-management-admin-venue-venueId";

const pageItems = [
  {
    title: "",
    id: "",
  },
  {
    title: "Details",
    page: 1,
    id: "details",
  },
  {
    title: "Photos",
    page: 2,
    id: "photos",
  },
  {
    title: "Capacity",
    page: 3,
    id: "capacity",
  },
  {
    title: "Features",
    page: 4,
    id: "features",
  },
  {
    title: "Keywords",
    page: 5,
    id: "keywords",
  },
  {
    title: "Pricing",
    page: 6,
    id: "pricing",
  },
];

const status = computed(() => {
  return space.value?.status;
});

const isForApproval = computed(() => {
  const status = space.value.status;
  return status === "FOR_APPROVAL";
});

const isAllowSuspend = computed(() => {
  const status = space.value.status;
  return status === "PUBLISHED";
});

const isAllowPublish = computed(() => {
  const status = space.value.status;
  return (
    status !== "PUBLISHED" && status !== "FOR_APPROVAL" && status !== "DELETED"
  );
});

const isForDeletion = computed(() => {
  const status = space.value.status;
  return status === "FOR_DELETION";
});

const isVenueDeletedOrForDeletion = computed(() => {
  const status = space.value.status;
  return status == "DELETED" || status === "FOR_DELETION";
});
const isSpaceDeletedOrForDeletion = computed(() => {
  const status = space.value.status;
  return status == "DELETED" || status === "FOR_DELETION";
});

const isDRAFT = computed(() => {
  const status = space.value.status;
  return status == "DRAFT" || status == "INPROGRESS";
});

const adminStatusMessage = computed(() => {
  const status = space.value.status;

  if (status == "DRAFT")
    return { color: "draft", message: "This Space is a draft." };
  else if (status == "FOR_APPROVAL")
    return { color: "for_approval", message: "This Space is for approval." };
  else if (status == "PUBLISHED")
    return { color: "published", message: "This Space is approved!" };
  else if (status == "REJECTED")
    return { color: "rejected", message: "This Space has been rejected." };
  else if (status == "SUSPENDED")
    return { color: "suspended", message: "This Space has been suspended." };
  else if (status == "FOR_DELETION")
    return { color: "for_deletion", message: "This Space is for deletion." };
  else if (status == "INPROGRESS")
    return { color: "inprogress", message: "This Space is in progress." };
  else if (status == "ARCHIVED")
    return { color: "archived", message: "This Space is archived." };
});

const showFullBreadCrumbs = computed(() => {
  const status = space.value.status;
  const role = currentUser.value?.role;

  if (
    mode.value == "view" ||
    mode.value == "update" ||
    status == "FOR_APPROVAL" ||
    status == "PUBLISHED" ||
    status == "DELETED" ||
    status == "FOR_DELETION"
  ) {
    return true;
  } else return false;
});

const venueListerPageRoute = {
  name: "country-venues-management",
  params: { country: country },
};
const venueManagementPageRoute = {
  name: venuePageName,
  params: { country: country, venueId: venueId, formId: "spaces" },
};

const venueListerDraftsPageRoute = {
  name: "country-venues-management-drafts",
  params: { country: country },
};

const somethingWentWrongMessage = {
  modal: true,
  color: "error",
  text: "Something went wrong. Please try again later.",
};

const items = [
  {
    title: "All spaces",
    to: venueManagementPageRoute,
  },
  {
    title: "Details",
    page: 1,
    disabled: false,
  },
  {
    title: "Photos",
    page: 2,
    disabled: false,
  },
  {
    title: "Capacity and Layouts",
    page: 3,
    disabled: false,
  },
  {
    title: "Features",
    page: 4,
    disabled: false,
  },
  {
    title: "Keywords",
    page: 5,
    disabled: false,
  },
  {
    title: "Prices",
    page: 6,
    disabled: false,
  },
];

const saveProgress = async (type?: "exit") => {
  await form.value.validate();
  scrollToError();
  // handle Page 6 validation separately
  const obj = space.value;

  if (activeSpacePage.value === 6) {
    if (
      obj.pricing.selected_pricing == "HIRE_FEE" &&
      obj?.pricing?.hire_fee?.days.length === 0
    ) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      return setSnackbar({
        text: "Please select at least one day.",
        color: "error",
        modal: true,
      });
    } else if (
      obj.pricing.selected_pricing == "HIRE_FEE" &&
      obj?.pricing?.hire_fee?.days.some(
        (item) => !item.fullRateCheckkBox && !item.hourlyCheckBox
      )
    ) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      return setSnackbar({
        text: "Please select rate.",
        color: "error",
        modal: true,
      });
    } else if (
      obj.pricing.selected_pricing === "CUSTOM_PRICE" &&
      obj?.pricing?.custom_price?.prices.length === 0
    ) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      return setSnackbar({
        text: "Please select at least one option.",
        color: "error",
        modal: true,
      });
    } else if (
      obj.pricing.selected_pricing === "CUSTOM_PRICE" &&
      obj?.pricing?.custom_price?.prices.some(
        (item) => item.weekdays.length === 0
      )
    ) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      return setSnackbar({
        text: "Please select days of the week.",
        color: "error",
        modal: true,
      });
    }
  }

  // PAGE 2 VALIDATION
  if (activeSpacePage.value === 2) {
    if (space.value.space_photo.length < 4) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      setSnackbar({
        text: "Please upload at least 4 photo of the space",
        color: "error",
        modal: true,
      });
      return;
    }
  }

  if (activeSpacePage.value === 3) {
    if (
      !space.value.guest_capacity.maximum ||
      space.value.guest_capacity.maximum == 0
    ) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      setSnackbar({
        text: "Fill in the capacity for at least one layout",
        color: "error",
        modal: true,
      });
      return;
    }
  }

  if (activeSpacePage.value == 4) {
    //  ADD CUSTOM FACILITY ISSUE IF UNCHECKED
    const obj = space.value.features?.find(
      (x) => x.key == "12" && x.reference == "facilities"
    );
    if (obj && obj?.answer && obj?.options.length == 0) {
      showExitDialog.value = false;
      showExitDraftDialog.value = false;
      setSnackbar({
        text: "Please add at least one custom facility",
        color: "error",
        modal: true,
      });
      return;
    }
  }

  const el = document.querySelector(".v-field--error:first-of-type");
  if (el) {
    mode.value = "update";
    showExitDialog.value = false;
    showExitDraftDialog.value = false;
    return;
  }

  // if (status === "DRAFT") {
  //     processing.value = true;
  //     space.value.status = "DRAFT";
  //     await handleUpdateSpace();
  //     navigateTo(venueListerDraftsPageRoute);
  // }

  processing.value = true;
  await handleUpdateSpace("save");
  // mode.value = "view";
  type == "exit" && handleExit();
  processing.value = false;
};

// const handleSaveDraft = async () => {
//   space.value.status = "DRAFT";
//   await handleUpdateSpace();
//   navigateTo(venueListerPageRoute);
// };

// const handleDeleteSpace = async () => {
//     processing.value = true;
//     await updateSpace(spaceId as string, { status: "FOR_DELETION" });
//     useCookie<number>("cookie_page").value = 5;
//     processing.value = false;
//     navigateTo(venueManagementPageRoute);
// };

const handleApproveDeleteSpace = async () => {
  showPermanentlyDeletePrompt.value = false;
  processing.value = true;
  try {
    const response = await adminDeleteSpace(spaceId as string);
    if (response.value) {
      setSnackbar({
        color: "success",
        text: "Space Deleted Successfully!",
        modal: true,
      });
      navigateTo(venueManagementPageRoute);
    }
  } catch (error) {
    console.log(error);
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  }
  processing.value = false;
};

let spaceListArr: any = [];
// get list of spaces without paginationso baka ka
const getSpacesArray = async () => {
  const { data, error } = await getAllSpacesWithoutPagination(
    venueId as string
  );
  if (error.value) {
    setSnackbar(somethingWentWrongMessage);
    return;
  }
  const res = data.value as any;
  const spaceData = res?.data;
  if (!spaceData || spaceData.length == 0) {
    setSnackbar(somethingWentWrongMessage);
    console.log("space-list API issue");
  }
  spaceListArr = spaceData;
};

const handleAdminAction = async (
  status: "SUSPENDED" | "PUBLISHED" | "REJECTED"
) => {
  showSuspendPrompt.value = false;
  processing.value = true;

  try {
    await adminUpdateSpace(spaceId as string, { status });
    if (status === "PUBLISHED") {
      await getSpacesArray();
      const atLeastOneIsPublished = spaceListArr.some(
        (x: TVenueSpace) => x.status == "PUBLISHED"
      );
      const noPendingForApproval = !spaceListArr.some(
        (x: TVenueSpace) => x.status == "FOR_APPROVAL"
      );

      if (atLeastOneIsPublished && noPendingForApproval) {
        await updateVenue(venueId as string, { status: "PUBLISHED" });
      }

      setSnackbar({
        color: "success",
        text: "Space Approved Successfully!",
        modal: true,
      });
    } else if (status === "SUSPENDED") {
      setSnackbar({
        color: "info",
        text: "Space Suspended Successfully!",
        modal: true,
      });
    } else if (status === "REJECTED") {
      setSnackbar({
        color: "info",
        text: "Space Rejected Successfully!",
        modal: true,
      });
    }
  } catch (error) {
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  } finally {
    navigateTo(venueManagementPageRoute);
    processing.value = false;
  }
};

const handleUpdateSpace = async (type?: "save") => {
  // console.log(space.value);

  const payload: Partial<TVenueSpace> = {
    // status: space.value.status,
  };

  if (!formValid.value || mode.value == "view") {
    showExitDialog.value = false;
    showExitDraftDialog.value = false;
    return;
  }
  updatingSpace.value = true;

  if (activeSpacePage.value === 1) {
    payload.name = space.value.name;
    payload.description = space.value.description;
    payload.type = space.value.type;
    payload.representation = space.value.representation;
  } else if (activeSpacePage.value == 2) {
    const payloadSpacePhoto = computed(() => {
      if (space.value.space_photo.length > 0) {
        return space.value.space_photo.map((x: any) => x._id);
      } else {
        return [];
      }
    });

    const payloadFloorPlanPhoto = computed(() => {
      if (space.value.floor_plan.length > 0) {
        return space.value.floor_plan.map((x: any) => x._id);
      } else {
        return [];
      }
    });

    const payloadMenuPhoto = computed(() => {
        if (space.value.menu_photo && space.value.menu_photo.length > 0) {
            return space.value.menu_photo.map((x: any) => x._id);
        } else {
            return [];
        }
    });
    payload.space_photo = payloadSpacePhoto.value;
    payload.floor_plan = payloadFloorPlanPhoto.value;
    payload.menu_photo = payloadMenuPhoto.value;
  } else if (activeSpacePage.value === 3) {
    payload.capacity_layout = space.value.capacity_layout;
    payload.guest_capacity = space.value.guest_capacity;
    if (!space.value.guest_capacity.minimum) {
      payload.guest_capacity.minimum = null;
    }
  } else if (activeSpacePage.value === 4) {
    payload.features = space.value.features;
  } else if (activeSpacePage.value === 5) {
    if (space.value.keywords.length > 0) {
      payload.keywords = space.value.keywords;
    }
  } else if (activeSpacePage.value === 6) {
    if (space.value.pricing.selected_pricing === "HIRE_FEE") {
      const { custom_price, ...rest } = space.value.pricing;
      payload.pricing = rest;
    } else if (space.value.pricing.selected_pricing === "CUSTOM_PRICE") {
      const { hire_fee, ...rest } = space.value.pricing;
      payload.pricing = rest;
      if (payload?.pricing?.custom_price?.opening_hours_preview) {
        delete payload.pricing.custom_price.opening_hours_preview;
      }
    }
    // // set current Currency based on registered country
    // if (payload.pricing?.currency) {
    //     payload.pricing.currency = currentCurrency(
    //         currentUser.value.country,
    //     ).code;
    // }
  }

  // ensure that payload has status
  if (!space.value.status) {
    delete payload.status;
  }

  // add formsteps
  if (!isAdmin && type !== "save" && activeSpacePage.value < 6) {
    payload.form_steps = activeSpacePage.value + 1;
  }

  if (Object.keys(payload).length === 0) {
    location.reload();
    return;
  }

  try {
    const { error } = await updateSpace(spaceId as string, payload);
    if (error.value) {
      setSnackbar({
        color: "error",
        text: "Something went wrong. Please try again later",
        modal: true,
      });
      navigateTo(venueListerPageRoute);
    }
    refreshSpaceData();
    // updatingSpace.value = false;
  } catch (err) {
  } finally {
    processing.value = false;
    updatingSpace.value = false;
  }
};

const filteredExteriorVenuePhotos = computed(() => {
  return space.value.venue_photo.filter(
    (x: any) => x.description === "exterior_venue_photo"
  );
});

const filteredInteriorVenuePhotos = computed(() => {
  return space.value.venue_photo.filter(
    (x: any) => x.description === "interior_venue_photo"
  );
});

const handleNext = async () => {
  await form.value?.validate();
  scrollToError();

  if (mode.value === "update" || mode.value === "create") {
    // prevent space name to duplicate
    if (activeSpacePage.value === 1 && formValid.value) {
      await getSpacesArray(); //
      const duplicateName = spaceListArr.some(
        (x: TVenueSpace) => x.name == space.value?.name && x._id !== spaceId
      );
      if (duplicateName) {
        setSnackbar({
          text: "Space name already exists",
          color: "error",
          modal: true,
        });
        return;
      }
    }

    // add page 3 first to skip formValid validation
    if (activeSpacePage.value === 3) {
      if (
        !space.value.guest_capacity.maximum ||
        space.value.guest_capacity.maximum == 0
      ) {
        setSnackbar({
          text: "Fill in the capacity for at least one layout",
          color: "error",
          modal: true,
        });
        return;
      }
    }

    if (activeSpacePage.value == 4) {
      //  ADD CUSTOM FACILITY ISSUE IF UNCHECKED
      const obj = space.value.features?.find(
        (x) => x.key == "12" && x.reference == "facilities"
      );
      if (obj && obj?.answer && obj?.options.length == 0) {
        setSnackbar({
          text: "Please add at least one custom facility",
          color: "error",
          modal: true,
        });
        return;
      }

      // show prompt when no feature is selected
      const arr = space.value.features || [];
      const atLeastOneTrue = arr.some((x) => x?.answer);

      if (!isAdmin && (arr.length === 0 || !atLeastOneTrue)) {
        showNoSelectedFeaturePrompt.value = true;
        return;
      }
    }

    if (activeSpacePage.value === 2) {
      const photo_arr = space.value?.space_photo as TFile[];
      if (photo_arr.length < 4) {
        setSnackbar({
          text: "Please upload at least 4 photo/videos of the space",
          color: "error",
          modal: true,
        });
        return;
      }
      // check if at least one uploaded is image
      const atLeastOneImage = photo_arr?.some((x) =>
        x?.contentType?.includes("image")
      );
      if (!atLeastOneImage) {
        setSnackbar({
          text: "At least 1 photo is required for thumbnail",
          color: "error",
          modal: true,
        });
        return;
      }
    }
    if (activeSpacePage.value === 5 && space.value.keywords.length < 1) {
      setSnackbar({
        text: "Please select at least one keyword.",
        color: "error",
        modal: true,
      });
      return;
    } else if (!formValid.value) return;
    else {
      await handleUpdateSpace();
      handleGoToNextPage();
      form.value.resetValidation();
    }
  } else {
    handleGoToNextPage();
  }
};

const handleProceedToNextPage = async () => {
  await handleUpdateSpace();
  handleGoToNextPage();
};

const handlePageChange = (val: number) => {
  if (!val) return;
  const newFormId = pageItems.find((x) => x.page == val)?.id;
  if (!newFormId) return;
  navigateTo({
    name: pageRoute,
    params: { country, venueId, spaceId, spaceFormId: newFormId },
  });
};

const handleGoToNextPage = () => {
  if (activeSpacePage.value !== 6) {
    const nextPageParams = pageItems.find(
      (x) => activeSpacePage.value && x.page == activeSpacePage.value + 1
    )?.id;
    if (!nextPageParams) return;
    // navigateTo(`/${country}/venues/management/venue/${venueId}/spaces/${spaceId}/${nextPageParams}`)
    // const scrollBody = document.getElementsByClassName('scroll-body')[0];
    const el = document.querySelector(".scroll-body");
    console.log(el);

    el?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    navigateTo({
      name: "country-venues-management-venue-venueId-spaces-spaceId-spaceFormId",
      params: { country, venueId, spaceId, spaceFormId: nextPageParams },
    });
  }
};

const backButtonLoading = ref(false);
const handlePrevious = async () => {
  if (activeSpacePage.value > 1) {
    backButtonLoading.value = true;
    !isAdmin &&
      (await updateSpace(spaceId as string, {
        form_steps: activeSpacePage.value - 1,
      }));
    const nextPageParams = pageItems.find(
      (x) => activeSpacePage.value && x.page == activeSpacePage.value - 1
    )?.id;
    if (!nextPageParams) return;
    navigateTo(
      `/${country}/venues/management/venue/${venueId}/spaces/${spaceId}/${nextPageParams}`
    );
    // backButtonLoading.value = false;
  } else if (activeSpacePage.value == 1) {
    if (isVenuePartOfVenueWithConsent(status.value as string)) {
      navigateTo(`/${country}/venues/management/admin-venue/${venueId}`);
    } else {
      navigateTo(`/${country}/venues/management/venue/${venueId}/spaces`);
    }
  }
};

const handleExitClick = () => {
  const clonedSpaceAfter = JSON.stringify(space.value);

  // exit automatic if no changes were made
  if (clonedSpaceData.value == clonedSpaceAfter) {
    handleExit();
    return;
  }

  // automatic exit when admin
  if (isAdmin || mode.value == "view") {
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
  if (isVenuePartOfVenueWithConsent(status.value as string)) {
    navigateTo({
      name: adminVenuePageName,
      params: { country, venueId, formId: "spaces" },
    });
  } else
    navigateTo({
      name: venuePageName,
      params: { country, venueId, formId: "spaces" },
    });
};

// scroll into view
const scrollToError = () => {
  if (mode.value !== "view") {
    const el = document.querySelector(".v-field--error:first-of-type");
    el?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }
};

const refreshSpaceData = async () => {
  // get space data
  const { data: spaceData, error } = await getSpace(spaceId as string);
  if (!spaceData) return;
  const res = spaceData.value as any;
  space.value = new MSpace(res.data.data[0]);
  space.value.pricing.currency =
    currentCurrency(space.value?.venue?.address?.country).code || "";
  keyComponent.value++;
  setTimeout(() => {
    clonedSpaceData.value = JSON.stringify(space.value);
  }, 300);
};

const handlePublishValidation = async () => {
  await form.value.validate();
  scrollToError();
  const el = document.querySelector(".v-field--error:first-of-type");
  const el2 = document.querySelector(".v-input--error:first-of-type");
  if (el || el2) {
    mode.value = "update";
    return;
  }
  const obj = space.value;
  const noiseObj = obj.features.find(
    (x) => x.key === "3" && x.reference == "music_sound"
  );
  const showError = (page: number, message: string) => {
    cookieSpacePage.value = page;
    setSnackbar({
      text: message,
      modal: true,
      color: "error",
    });
  };
  // handle Page 6 validation separately
  if (
    obj.pricing.selected_pricing == "HIRE_FEE" &&
    obj?.pricing?.hire_fee?.days.length === 0
  )
    return setSnackbar({
      text: "Please select at least one day.",
      color: "error",
      modal: true,
    });
  else if (
    obj.pricing.selected_pricing == "HIRE_FEE" &&
    obj?.pricing?.hire_fee?.days.some(
      (item) => !item.fullRateCheckkBox && !item.hourlyCheckBox
    )
  )
    return setSnackbar({
      text: "Please select rate.",
      color: "error",
      modal: true,
    });
  else if (
    obj.pricing.selected_pricing === "CUSTOM_PRICE" &&
    obj?.pricing?.custom_price?.prices.length === 0
  )
    return setSnackbar({
      text: "Please select at least one option.",
      color: "error",
      modal: true,
    });
  else if (
    obj.pricing.selected_pricing === "CUSTOM_PRICE" &&
    obj?.pricing?.custom_price?.prices.some(
      (item) => item.weekdays.length === 0
    )
  )
    return setSnackbar({
      text: "Please select days of the week.",
      color: "error",
      modal: true,
    });
  else if (!formValid.value) return;
  await handleUpdateSpace();

  if (obj.name == "" || obj.type == "" || obj.description == "")
    return showError(1, "Please fill in all required fields");
  if (obj.description.length < 300 || obj.description.length > 2000)
    return showError(
      1,
      "Minimum of 300 characters and maximum of 2000 characters."
    );
  else if (obj.space_photo.length < 4)
    return showError(2, "Please upload at least 4 space photos.");
  else if (
    obj.guest_capacity.maximum === 0 ||
    obj.guest_capacity.maximum === null ||
    obj.guest_capacity.floorspace.value === null
  )
    return showError(3, "Please fill in all required fields.");
  else if (obj.guest_capacity.maximum < obj.guest_capacity.minimum)
    return showError(
      3,
      "Please enter a lower number. The minimum number of attendees cannot exceed the maximum venue capacity."
    );
  else if (
    noiseObj?.answer &&
    (noiseObj?.max_capacity == null || noiseObj?.max_capacity == "")
  )
    return showError(4, "Please complete the fields.");
  else if (obj.keywords.length < 1)
    return showError(5, "Please select at least (1) one keyword.");
  // else showPublishPrompt.value = true;
  else await handlePublish();

  // if (obj.pricing.selected_pricing == 'HIRE_FEE' && obj.pricing.hire_fee.days.some(item =>  && )) return showError(6, "Please select rate.")
};

const handlePublish = async () => {

  if(status.value == 'FOR_APPROVAL' && isAdminSales){
    setSnackbar({text: "Sales Account cannot Re-publish 'For Approval' spaces", modal: true, color: 'error'})
    return
  }

  const payload: Partial<TVenueSpace> = {
    name: space.value.name,
    status: isAdminMember || isAdminSales ? "REQUIRES_CONSENT" : "FOR_APPROVAL",
  };

  processing.value = true;
  try {
    const { error } = await updateSpace(spaceId as string, payload);
    if (error.value) {
      setSnackbar(somethingWentWrongMessage);
      return;
    }

    let venueStatus =
      isAdminMember || isAdminSales ? "REQUIRES_CONSENT" : "FOR_APPROVAL";
    let formSteps = isAdminMember || isAdminSales ? 3 : 7;
    const redirectRoute =
      isAdminMember || isAdminSales ? adminVenuePageName : venuePageName;

    const { error: venueUpdateError } = await updateVenue(venueId as string, {
      status: venueStatus,
      form_steps: formSteps,
    });
    if (venueUpdateError.value) {
      setSnackbar(somethingWentWrongMessage);
      return;
    }
    if (isAdminMember || isAdminSales) {
      useCookie<number>("cookie_page").value = 3; // set to space view
    }
    navigateTo({
      name: redirectRoute,
      params: { country, venueId, formId: "spaces" },
    });
  } catch (err) {
    console.log(err);
    setSnackbar(somethingWentWrongMessage);
  } finally {
    processing.value = false;
  }
};

const getActivePage = async () => {
  const formSteps = space.value.form_steps;

  if (!isAdmin && mode.value == "create") {
    if (formSteps && formSteps > 1 && formSteps < 7) {
      const pageParams = pageItems.find((x) => x.page == formSteps)?.id;
      if (pageParams) {
        await navigateTo(
          `/${country}/venues/management/venue/${venueId}/spaces/${spaceId}/${pageParams}`
        );
      } else {
        await navigateTo(
          `/${country}/venues/management/venue/${venueId}/spaces/${spaceId}/details`
        );
      }
    } else {
      await navigateTo(
        `/${country}/venues/management/venue/${venueId}/spaces/${spaceId}/details`
      );
    }
  }

  activeSpacePage.value = pageItems.find((x) => x.id == spaceFormId)?.page || 1;
};

const checkMode = async () => {
  // conditions to check for read-only
  const status = space.value?.status;
  const formSteps = space.value?.form_steps;

  if (isVenueMember || space.value.status == "DELETED") {
    mode.value = "view";
    return;
  }

  // CHECK FOR ADMIN MEMBER

  if (
    (isAdminMember || isAdminSales) &&
    !isVenuePartOfVenueWithConsent(status as string)
  ) {
    mode.value = "view";
    return;
  }

  // check if space is not yet finished with fillup
  // if ((formSteps && formSteps < 6 && !isAdmin)) {
  //     mode.value = 'create'
  //     return;
  // }

  (await ((isDRAFT.value || status == "PENDING") && !isAdmin))
    ? (mode.value = "create")
    : (mode.value = "update");
};

// const fullyVerified = computed(() => {
//     const venueOwnerObj = space.value.venue.user;

//     let color = '';
//     let message = '';

//     if (venueStatus == 'FOR_APPROVAL') {
//         color = 'red-darken-4';
//         message = 'This venue account is not yet fully verified.'
//     }

//     return {
//         message, color
//     }
// })

const { checkOwnerOnboardingStatus } = useVerified();
const ownerVerified = ref(false);

const fetchOnboardingStatus = async () => {
  if (!isAdmin || status.value !== "FOR_APPROVAL") return;
  const userId = space.value?.venue?.user?._id;

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
  loading.value = true;
  await refreshSpaceData();
  await checkMode();
  await getActivePage();
  loading.value = false;
});
</script>

<style scoped></style>
