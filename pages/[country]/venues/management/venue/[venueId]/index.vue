<template>
  <LoadingDefault v-if="loading" />
  <v-form
    ref="form"
    v-else
    @submit.prevent
    v-model="formValid"
    :key="`${activePage}-${venueKey}`"
    :disabled="mode === 'view'"
    class="bg-primaryBG py-5"
    style="min-height: 100%"
    @click="handleViewModeClick"
  >
    <v-row no-gutters justify="center" class="mx-2 mx-sm-5">
      <v-col col="12" style="max-width: 1100px">
        <v-row v-if="isAdmin" no-gutters class="mb-2">
          <AlertAdminStatus :admin-status-message="adminStatusMessage" />
        </v-row>
        <v-row
          v-if="
            mode === 'view' &&
            isVenueOwner &&
            !isVenueDeletedOrForDeletion &&
            !isSpaceDeletedOrForDeletion
          "
          no-gutters
          justify="end"
        >
          <v-btn
            color="error"
            variant="flat"
            class="text-uppercase"
            @click.stop="handlePromptVenueDelete"
            :density="smAndUp ? 'default' : 'comfortable'"
            >Delete</v-btn
          >
        </v-row>
        <v-row v-if="isAdmin && !isDRAFT" no-gutters justify="end">
          <v-btn
            v-if="!isForDeletion && activePage == 7"
            color="success"
            class="text-uppercase"
            :disabled="!isForApproval"
            :density="smAndUp ? 'default' : 'comfortable'"
            @click.stop="showApprovedPrompt = true"
            >Approve</v-btn
          >
          <v-btn
            v-if="isForDeletion && activePage == 7"
            color="error"
            variant="outlined"
            class="text-uppercase ml-2"
            :density="smAndUp ? 'default' : 'comfortable'"
            @click.stop="showPermanentlyDeletePrompt = true"
            >Approve Delete</v-btn
          >
          <v-btn
            color="error"
            class="text-uppercase ml-2"
            v-if="
              venue.status !== 'SUSPENDED' &&
              venue.status !== 'FOR_APPROVAL' &&
              activePage == 7
            "
            :disabled="!isAllowSuspend && !isForDeletion"
            :density="smAndUp ? 'default' : 'comfortable'"
            @click.stop="showSuspendPrompt = true"
            >Suspend</v-btn
          >
          <v-btn
            color="error"
            class="text-uppercase text-white ml-2"
            v-if="venue.status == 'FOR_APPROVAL' && activePage == 7"
            :disabled="!isAllowSuspend && !isForDeletion"
            :density="smAndUp ? 'default' : 'comfortable'"
            @click.stop="showRejectPrompt = true"
            >Reject</v-btn
          >

          <v-btn
            color="yellow"
            class="text-uppercase ml-2"
            v-if="venue.status == 'SUSPENDED' || venue.status == 'ARCHIVED'"
            :density="smAndUp ? 'default' : 'comfortable'"
            @click.stop="showRestorePrompt = true"
            >RESTORE</v-btn
          >
        </v-row>

        <v-breadcrumbs
          v-model="activePage"
          :items="showFullBreadCrumbs ? items : items.slice(0, activePage + 1)"
          class="px-0 text-subtitle-1 font-weight-bold"
          style="display: block"
        >
          <template v-slot:title="{ item, index }">
            <v-breadcrumbs-item
              @click.stop="item.title !== 'Home' && handleChangePage(index)"
            >
              <span
                class="cursor-pointer text-no-wrap"
                :class="
                  activePage === index
                    ? 'text-primary font-weight-bold'
                    : 'text-secondary font-weight-black'
                "
                >{{ item.title }}</span
              >
            </v-breadcrumbs-item>
          </template>
          <template v-slot:divider>
            <span class="text-primary">/</span>
          </template>
        </v-breadcrumbs>

        <AddVenueFormTemplateTitle
          :title="items[activePage].title"
          @save-draft="saveProgress('DRAFT')"
          @save-changes="saveProgress"
          :is-venue-deleted-or-for-deletion="isVenueDeletedOrForDeletion"
          :is-space-deleted-or-for-deletion="isSpaceDeletedOrForDeletion"
          :hide-edit-save-button="activePage == 7 || (isAdmin && isDRAFT)"
          :no-save-draft="activePage == 7"
        />

        <AddVenueFormOverview v-if="activePage === 1" v-model="venue" />
        <AddVenueFormAddressAndLocation
          v-else-if="activePage === 2"
          v-model="venue"
        />
        <AddVenueFormFoodAndBeverages
          v-else-if="activePage === 3"
          v-model="venue"
        />
        <AddVenueFormVenueDetails
          v-else-if="activePage === 4"
          v-model="venue"
        />

        <AddVenueFormVenuePolicyDetails
          v-else-if="activePage === 5"
          v-model="venue"
        />

        <AddVenueFormVenueSpaces
          v-else-if="activePage === 6"
          @refresh-space="assignSpaceList"
        />

        <AddVenueFormReviewVenue
          v-else-if="activePage === 7"
          v-model="venue"
          @refresh-venue="handleRefreshVenue"
        />
        <v-row no-gutters>
          <v-col cols="6" align="start">
            <v-btn
              v-if="activePage !== 1"
              variant="flat"
              color="secondary"
              @click.stop="handlePrevious"
              class="text-uppercase"
              >Back</v-btn
            >
          </v-col>
          <v-col cols="6" align="end">
            <v-btn
              type="submit"
              v-if="activePage === 7"
              color="secondary"
              variant="flat"
              class="text-uppercase"
              @click="handleExit"
              >Exit</v-btn
            >
            <p
              v-if="
                !atleastOneSpaceFinished && activePage === 6 && mode !== 'view'
              "
              class="text-disabled text-subtitle-2"
            >
              Finish adding spaces before you continue
            </p>
            <v-btn
              v-else-if="activePage !== 7"
              :type="mode === 'view' ? 'button' : 'submit'"
              color="secondary"
              variant="flat"
              @click.stop="handleNext"
              :loading="updatingVenue"
              class="text-uppercase"
              >Next</v-btn
            >
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
  <LoadingTransparent v-if="processing" />
  <DialogReviewPrompt
    v-model:review="showPublishPrompt"
    prompt-title="Are you sure you want to submit?"
    prompt-text="Please note that the approval process typically takes up to 7 business days"
    agree-button-text="Yes, Submit This"
    disagree-button-text="No, Back"
    @disagree="showPublishPrompt = false"
    @agree="handlePublish"
  />

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

  <DialogDeletePrompt
    v-model:delete="showSuspendPrompt"
    prompt-title="Are you sure you want to suspend this venue?"
    prompt-text="Please note that by proceeding, this venue will be removed from the listing."
    agree-button-text="Suspend"
    disagree-button-text="No"
    @disagree="showSuspendPrompt = false"
    @agree="handleAdminAction('SUSPENDED')"
    show-header-message
  />

  <DialogDeletePrompt
    v-model:delete="showRejectPrompt"
    prompt-title="Are you sure you want to reject approval of this venue?"
    prompt-text="Please note that by proceeding, this venue will not be listed."
    agree-button-text="Reject"
    disagree-button-text="No"
    @disagree="showRejectPrompt = false"
    @agree="handleAdminAction('REJECTED')"
    show-header-message
  />

  <DialogDeletePrompt
    v-model:delete="showPermanentlyDeletePrompt"
    prompt-title="Are you sure you want to PERMANENTLY delete this venue?"
    prompt-text="Please note that this action can't be undone."
    agree-button-text="Permanently Delete"
    disagree-button-text="No"
    @disagree="showPermanentlyDeletePrompt = false"
    @agree="handlePermanentlyDelete"
    max-width="500"
    :showHeaderMessage="true"
  />

  <DialogApprovePrompt
    v-model="showApprovedPrompt"
    prompt-title="Are you sure you want to approve this venue?"
    prompt-text="By proceeding, this venue will be shown in the venue lists."
    agree-button-text="Approve"
    disagree-button-text="No"
    @disagree="showApprovedPrompt = false"
    @agree="handleAdminAction('PUBLISHED')"
    :showHeaderMessage="true"
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
  <!-- <DialogDeletePrompt v-model="deletedSucessDialog" prompt-text="Successfully Deleted"
      agree-button-text="BACK TO DASHBOARD" @agree="useRouter().push(venueListerPage)" max-width="500"
      :showHeaderMessage="false" /> -->

  <DialogApproveInfo
    v-model="approveInfo"
    @disagree="approveInfo = false"
    @go-to-spaces="
      cookiePage = 6;
      approveInfo = false;
    "
    :showHeaderMessage="true"
  />
  <!-- <DialogNotYetDone v-model="showNotYetDonePrompt" @go-to="handleGoToNextPage" /> -->
</template>

<script setup lang="ts">
definePageMeta({
  layout: "venue",
});
import MVenue from "~/models/venue.model";
import MSpace from "~/models/space.model";
import { useDisplay } from "vuetify";
const { smAndUp } = useDisplay();

const {
  defaultSnackbar,
  defaultSnackbarText,
  defaultSnackbarColor,
  country,
  setSnackbar,
} = useLocal();
const { venueId } = useRoute().params;

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
} = useVenue();
const { spaces, getSpaceList, space } = useSpace();
const { currentUser } = useLocalAuth();

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
const activePage = ref(1);
const processing = ref(false);
const approveInfo = ref(false);
const updatingVenue = ref(false);
const venueKey = ref(0);
const showNotYetDonePrompt = ref(false);

const cookiePage = useCookie<number>("cookie_page");

const isVenueOwner = computed(() => {
  return currentUser.value?.role === "VENUE_OWNER";
});

const isAdmin = computed(() => {
  return currentUser.value?.role === "ADMIN";
});

const isForApproval = computed(() => {
  const status = venue.value.status;
  return (
    (status === "FOR_APPROVAL" || status === "SUSPENDED") &&
    spaces.value.some((x) => x.status === "PUBLISHED")
  );
});

const isAllowSuspend = computed(() => {
  const status = venue.value.status;
  return status === "FOR_APPROVAL" || status === "PUBLISHED";
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

const adminStatusMessage = computed(() => {
  const status = venue.value.status;

  if (status == "DRAFT")
    return { color: "draft", message: "This Venue is a draft." };
  else if (status == "FOR_APPROVAL")
    return { color: "for_approval", message: "This Venue is for approval." };
  else if (status == "PUBLISHED")
    return { color: "published", message: "This Venue is approved!" };
  else if (status == "REJECTED")
    return { color: "rejected", message: "This Venue has been rejected." };
  else if (status == "SUSPENDED")
    return { color: "suspended", message: "This Venue has been suspended." };
  else if (status == "FOR_DELETION")
    return { color: "for_deletion", message: "This Venue is for deletion." };
  else if (status == "INPROGRESS")
    return { color: "inprogress", message: "This Venue is in progress." };
  else if (status == "ARCHIVED")
    return { color: "archived", message: "This Venue is archived." };
});

const showFullBreadCrumbs = computed(() => {
  const status = venue.value.status;
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

const venueListerPage = {
  name: "country-venues-management",
  params: { country: country},
};

const venueListerDraftsPage = {
  name: "country-venues-management-drafts",
  params: { country: country,},
};

watchEffect(() => {
  activePage.value = cookiePage.value || 1;
});

const handleExit = () => {
  navigateTo(venueListerPage)
}

const handleChangePage = async (index: number) => {
  if (mode.value == "view") {
    cookiePage.value = index;
  } else {
    await form.value.validate();
    scrollToError();
    const el = document.querySelector(".v-field--error:first-of-type");
    const el2 = document.querySelector(".v-input--error:first-of-type");
    if (el || el2) {
      // mode.value = "update";
      return;
    }
    await handleUpdateVenue();
    cookiePage.value = index;
  }
};

const pageRoute = "country-venues-management-venueId";

const items = [
  {
    title: "All venues",
    to: venueListerPage,
  },
  {
    title: "Overview",
    page: 1,
    disabled: false,
  },
  {
    title: "Address",
    page: 2,
    disabled: false,
  },
  {
    title: "Food & Beverages",
    page: 3,
    disabled: false,
  },
  {
    title: "Venue Details",
    page: 4,
    disabled: false,
  },
  {
    title: "Policy",
    page: 5,
    disabled: false,
  },
  {
    title: "Spaces",
    page: 6,
    disabled: false,
  },
  {
    title: "Review",
    page: 7,
    disabled: false,
  },
];

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
  }
};
// refreshVenueFunc();

// get space list

const assignSpaceList = async () => {
  const { data: spaceListData, refresh: refreshSpaceList } = await getSpaceList(
    venueId as string,
  );
  if (spaceListData) {
    const res = spaceListData.value as any;
    spaces.value = res.data.data;
  }
};
assignSpaceList();

// check if at least one space is created && finished (to add logic for status)
const atleastOneSpaceFinished = computed(() => {
  if (
    spaces.value.find(
      (x) => x.status === "FOR_APPROVAL" || x.status === "PUBLISHED",
    )
  ) {
    return true;
  } else {
    return false;
  }
});

// show prompt for approval info
const triggerApproveInforPrompt = () => {
  setTimeout(() => {
    if (
      isAdmin.value &&
      venue.value.status === "FOR_APPROVAL" &&
      !spaces.value.some((x) => x.status == "PUBLISHED") &&
      activePage.value === 7
    ) {
      approveInfo.value = true;
    } else return false;
  }, 300);
};
triggerApproveInforPrompt();

watchEffect(() => {
  if (activePage.value == 7) {
    triggerApproveInforPrompt();
  }

  if (spaces.value.some((x) => x.status == "PUBLISHED")) {
    approveInfo.value = false;
  }

  if (activePage.value == 5) {
    approveInfo.value = false;
  }

  if(activePage.value == 5){
    if(!isAdmin.value && venue.value?.status == "DRAFT" && spaces.value.some((x) => x.status == "FOR_APPROVAL")){
      showNotYetDonePrompt.value = true
    } else showNotYetDonePrompt.value = false
  }
});

const handleGoToNextPage = () => {
  cookiePage.value = 6;
  showNotYetDonePrompt.value = false;
}

const handlePrevious = async () => {
  cookiePage.value--;
};

const saveProgress = async (status?: "DRAFT") => {
  await form.value.validate();
  scrollToError();

  const el = document.querySelector(".v-field--error:first-of-type");
  if (el) {
    // mode.value = "update";
    return;
  }

  if (activePage.value == 1 && venue.value.keywords.length == 0) {
    setSnackbar({
      color: "error",
      modal: true,
      text: "Please select at least one venue type keyword.",
    });
    return;
  }

  processing.value = true;
  if (status === "DRAFT") {
    space.value.status = "DRAFT";
    await handleUpdateVenue();
    navigateTo(venueListerDraftsPage);
  } else {
    await handleUpdateVenue();
    await handleRefreshVenue();
    processing.value = false;
    mode.value = "view";
  }
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

  if (mode.value === "update" || mode.value === "create") {
    if (formValid.value) {
      if (activePage.value === 1 && venue.value.keywords.length === 0) {
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
          return;
        }
        await handleUpdateVenue();
        cookiePage.value++;
      } else if (activePage.value === 7) {
        if (venue.value.venue_spaces.length === 0) {
          setSnackbar({
            color: "error",
            text: "Please add at least one space",
            modal: true,
          });
          return;
        }
        await handleUpdateVenue();
        navigateTo({
          name: "country-venues-management",
          params: { country: country },
        });
      } else {
        await handleUpdateVenue();
        await form.value.resetValidation();
        cookiePage.value++;
      }
    } else { 
      await handleUpdateVenue();

    }
  } else {
    cookiePage.value++;
  }
};

const handleUpdateVenue = async () => {
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
  } = venue.value;
  if (activePage.value === 1) {
    payload.name = name;
    payload.description = description;
    payload.keywords = keywords;
  } else if (activePage.value === 2) payload.address = address;
  else if (activePage.value === 3 && foods_and_beverages.length > 0)
    payload.foods_and_beverages = foods_and_beverages;
  else if (activePage.value === 4) {
    if (venue_details.length > 0) {
      payload.venue_details = venue_details;
    }
    payload.age_restriction = age_restriction;
  } else if (activePage.value === 5) {
    const { _id, createdAt, venue_id, ...rest } = cancellation_policy;
    payload.cancellation_policy = rest;
  }
  // ensure that payload is not empty
  if (Object.keys(payload).length === 0) {
    updatingVenue.value = false;
    return;
  }

  // ensure that payload has status
  if (!status) {
    delete payload.status;
  }

  try {
    await updateVenue(venueId as string, payload);
  } catch (er) {
    console.log(er);
    updatingVenue.value = false;
    processing.value = false;
  }

  updatingVenue.value = false;
  await handleRefreshVenue();
  assignSpaceList();
};

const handlePromptVenueDelete = () => {
  const status = venue.value.status;
  if (status == "FOR_APPROVAL" || status == "PUBLISHED") {
    showPromptDelete.value = true;
  } else {
    showPermanentlyDeletePrompt.value = true;
  }
};

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
    isAdmin.value
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
  status: "SUSPENDED" | "PUBLISHED" | "REJECTED",
) => {
  showSuspendPrompt.value = false;
  processing.value = true;

  const pageRoute = "country-venues-management";
  try {
    await adminUpdateVenue(venueId as string, { status });
    navigateTo({
      name: pageRoute,
      params: { country, status: activeStatus.value || "all" },
    });
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
    } else if (status === "REJECTED") {
      setSnackbar({
        color: "info",
        text: "Venue Rejected Successfully!",
        modal: true,
      });
    }
  } catch (error) {
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  }
  processing.value = false;
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
        (x) => !x.days_less_than || !x.days_at_least || !x.total_price,
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
  // try {
  //   await updateVenue(venueId as string, { status: "FOR_APPROVAL" });
  // } catch (e) {
  //   console.log(e);
  //   setSnackbar({
  //     modal: true,
  //     color: "error",
  //     text: "Something went wrong. Please try again later.",
  //   });
  //   processing.value = false;
  // }
  // navigateTo(venueListerPage);
  processing.value = false;
};

// handle double click
const click = ref(0);
const handleViewModeClick = () => {
  if (mode.value === "view" && !isAdmin.value && activePage.value != 7) {
    form.value.resetValidation(); // reset vakudation in view mode
    click.value++;
    if (click.value == 3) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setSnackbar({
        text: "You're in view mode.",
        modal: true,
        color: "info",
      });
    }
  }
};
watch(click, (newwVal) => {
  if (newwVal >= 3) {
    click.value = 0;
  }
});

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

onMounted(async () => {
  if (!cookiePage.value) {
    cookiePage.value = 1;
  }
  await handleRefreshVenue();
  space.value = new MSpace({});
  loading.value = false;
});
</script>

<style scoped>
.v-tab--selected {
  background-color: #1f4b3f !important;
}
</style>
