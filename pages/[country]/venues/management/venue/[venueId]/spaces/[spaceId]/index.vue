<template>
  <v-form ref="form" @submit.prevent v-model="formValid" class="bg-primaryBG" :key="`${activePage} + ${keyComponent}`"
    :disabled="mode === 'view'" @click="handleViewModeClick">
    <v-row no-gutters justify="center" class="mx-2 mx-sm-5">
      <v-col col="12" class="py-5" style="max-width: 1100px">
        <!-- <v-row v-if="mode === 'view' && canDelete && (!isVenueDeletedOrForDeletion && !isSpaceDeletedOrForDeletion)"
          no-gutters justify="end">
          <v-btn color="error" class="text-uppercase" @click.stop="showDeletePrompt = true">Delete Space</v-btn>
        </v-row> -->
        <v-row v-if="isAdmin" no-gutters class="mb-2">
          <AlertAdminStatus :admin-status-message="adminStatusMessage" />
        </v-row>

        <v-row v-if="isAdmin && !isDRAFT" no-gutters justify="end">
          <v-btn v-if="!isForDeletion && activePage == 6" color="success" class="text-uppercase"
            :disabled="!isForApproval" @click.stop="showApprovedPrompt = true">Approve Space</v-btn>
          <v-btn v-if="isForDeletion && activePage == 6" color="error" variant="outlined" class="text-uppercase"
            @click.stop="showPermanentlyDeletePrompt = true">APPROVE DELETE Space</v-btn>
          <v-btn color="error" class="text-uppercase ml-2" v-if="space?.status == 'PUBLISHED' && activePage == 6"
            :disabled="!isAllowSuspend && !isForDeletion && activePage == 6"
            @click.stop="showSuspendPrompt = true">Suspend Space</v-btn>
          <v-btn color="error" class="text-uppercase ml-2" v-if="space?.status == 'FOR_APPROVAL' && activePage == 6"
            @click.stop="showRejectPrompt = true">Reject Space</v-btn>
        </v-row>

        <v-breadcrumbs v-model="activePage" :items="showFullBreadCrumbs ? items : items.slice(0, activePage + 1)"
          class="px-0 text-subtitle-1" style="display: block">
          <template v-slot:title="{ item, index }">
            <v-breadcrumbs-item @click.stop="index !== 0 && handleChangePage(index)">
              <span class="cursor-pointer text-no-wrap" :class="activePage === index
                ? 'text-primary font-weight-bold'
                : 'text-secondary font-weight-black'
                ">
                {{ item.title }}
              </span>
            </v-breadcrumbs-item>
          </template>
          <template v-slot:divider>
            <span class="text-primary">/</span>
          </template>
        </v-breadcrumbs>

        <AddVenueFormTemplateTitle :title="items[activePage].title" @save-draft="saveProgress('DRAFT')"
          @save-changes="saveProgress" :is-venue-deleted-or-for-deletion="isVenueDeletedOrForDeletion"
          :is-space-deleted-or-for-deletion="isSpaceDeletedOrForDeletion" :hide-edit-save-button="isAdmin && isDRAFT" />

        <SpacesDetails v-if="activePage === 1" v-model="space" @save-draft="handleUpdateSpace()" />
        <SpacesPhotos v-if="activePage === 2" v-model="space" @refresh-space-data="refreshSpaceData"
          @save-draft="handleUpdateSpace()" />
        <SpacesCapacityAndLayouts v-if="activePage === 3" v-model="space" @save-draft="handleUpdateSpace()"
          @refresh-space-data="refreshSpaceData" @clear-validation="form.resetValidation()" />
        <SpacesFeatures v-if="activePage === 4" v-model="space" />
        <SpacesKeywords v-if="activePage === 5" v-model="space" />
        <SpacesPriceAndOpeningHours v-if="activePage === 6" v-model="space" />

        <v-row no-gutters class="w-100 d-flex justify-space-between">
          <v-col cols="6">
            <v-btn variant="flat" color="secondary" text="Back" class="text-uppercase" @click.stop="handlePrevious" />
          </v-col>
          <v-col cols="6" align="end">
            <v-btn type="submit" v-if="activePage === 6 && mode !== 'view' && isVenueOwner" text="Publish"
              color="secondary" variant="flat" class="text-uppercase" :loading="updatingSpace"
              @click.stop="handlePublishValidation" />
            <v-btn v-else-if="activePage !== 6" :type="mode === 'view' ? 'button' : 'submit'" variant="flat"
              color="secondary" text="Next" class="text-uppercase" :loading="updatingSpace" @click.stop="handleNext" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
  <DialogReviewPrompt v-model:review="showPublishPrompt" prompt-title="Are you sure you want to publish?"
    prompt-text="Please note that the approval process typically takes up to 7 business days"
    agree-button-text="Yes, Submit This" disagree-button-text="No, Back" @disagree="showPublishPrompt = false"
    @agree="handlePublish" />

  <DialogDeletePrompt v-model:delete="showDeletePrompt" prompt-title="Are you sure you want to delete this space?"
    prompt-text="Please note that deletion requires approval." agree-button-text="Proceed" disagree-button-text="No"
    @disagree="showDeletePrompt = false" @agree="handleDeleteSpace" show-header-message />

  <DialogDeletePrompt v-model:delete="showPermanentlyDeletePrompt"
    prompt-title="Are you sure you want to PERMANENTLY delete this space?"
    prompt-text="Please note that this action can't be undone." agree-button-text="Permanently Delete"
    disagree-button-text="No" @disagree="showPermanentlyDeletePrompt = false" @agree="handlePermanentlyDelete"
    show-header-message />

  <DialogDeletePrompt v-model:delete="showSuspendPrompt" prompt-title="Are you sure you want to suspend this space?"
    prompt-text="Please note that by proceeding, this space will be removed from the listing."
    agree-button-text="Suspend" disagree-button-text="No" @disagree="showSuspendPrompt = false"
    @agree="handleAdminAction('SUSPENDED')" show-header-message />

  <DialogDeletePrompt v-model:delete="showRejectPrompt"
    prompt-title="Are you sure you want to reject approval of this space?"
    prompt-text="Please note that by proceeding, this space will not be listed." agree-button-text="Reject"
    disagree-button-text="No" @disagree="showRejectPrompt = false" @agree="handleAdminAction('REJECTED')"
    show-header-message />

  <DialogApprovePrompt v-model="showApprovedPrompt" prompt-title="Are you sure you want to approve this space?"
    prompt-text="By proceeding, this space will be shown in the space lists." agree-button-text="Approve"
    disagree-button-text="No" @disagree="showApprovedPrompt = false" @agree="handleAdminAction('PUBLISHED')"
    :showHeaderMessage="true" />
  <LoadingTransparent v-if="processing" />
</template>

<script setup lang="ts">
import MSpace from "~/models/space.model";

definePageMeta({
  layout: "venue",
});

const { setSnackbar, country, currentCurrency } = useLocal();
const { currentUser } = useLocalAuth();
const {
  updateSpace,
  getSpace,
  space,
  spaces,
  adminDeleteSpace,
  adminUpdateSpace,
} = useSpace();
const { mode, venue, updateVenue } = useVenue();

const { spaceId, venueId } = useRoute().params;
const activePage = ref(1);
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

watchEffect(() => {
  activePage.value = cookieSpacePage.value || 1;

  // if(activePage.value === 2){
  //   formValid.value = true;
  // }
});

const isVenueOwner = computed(() => {
  return currentUser.value?.role === "VENUE_OWNER";
});

const isAdmin = computed(() => {
  return currentUser.value?.role === "ADMIN";
});

const isForApproval = computed(() => {
  const status = space.value.status;
  return status === "FOR_APPROVAL";
});

const isAllowSuspend = computed(() => {
  const status = space.value.status;
  return status === "FOR_APPROVAL" || status === "PUBLISHED";
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
  name: "country-venues-management-venue-venueId",
  params: { country: country, venueId: venueId },
};

const venueListerDraftsPageRoute = {
  name: "country-venues-management-drafts",
  params: { country: country },
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

const handleChangePage = async (index: number) => {
  if (mode.value !== "view") {
    await form.value.validate();
    scrollToError();
    const obj = space.value;

    const el = document.querySelector(".v-field--error:first-of-type");
    const el2 = document.querySelector(".v-input--error:first-of-type");
    if (el || el2) {
      // mode.value = "update";
      return;
    }

    if (activePage.value === 6) {
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
          (item) => !item.fullRateCheckkBox && !item.hourlyCheckBox,
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
          (item) => item.weekdays.length === 0,
        )
      )
        return setSnackbar({
          text: "Please select days of the week.",
          color: "error",
          modal: true,
        });
    }

    // PAGE 2 VALIDATION
    if (activePage.value === 2) {
      if (space.value.space_photo.length < 4) {
        setSnackbar({
          text: "Please upload at least 4 photo of the space",
          color: "error",
          modal: true,
        });
        return;
      }
    }

    if (activePage.value === 3) {
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

    await handleUpdateSpace();
    cookieSpacePage.value = index;
  }
  cookieSpacePage.value = index;
};

const saveProgress = async (status?: "DRAFT") => {
  await form.value.validate();
  scrollToError();
  // handle Page 6 validation separately
  const obj = space.value;

  if (activePage.value === 6) {
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
        (item) => !item.fullRateCheckkBox && !item.hourlyCheckBox,
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
        (item) => item.weekdays.length === 0,
      )
    )
      return setSnackbar({
        text: "Please select days of the week.",
        color: "error",
        modal: true,
      });
  }

  // PAGE 2 VALIDATION
  if (activePage.value === 2) {
    if (space.value.space_photo.length < 4) {
      setSnackbar({
        text: "Please upload at least 4 photo of the space",
        color: "error",
        modal: true,
      });
      return;
    }
  }

  if (activePage.value === 3) {
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

  const el = document.querySelector(".v-field--error:first-of-type");
  if (el) {
    mode.value = "update";
    return;
  }

  if (status === "DRAFT") {
    processing.value = true;
    space.value.status = "DRAFT";
    await handleUpdateSpace();
    navigateTo(venueListerDraftsPageRoute);
  }

  processing.value = true;
  await handleUpdateSpace();
  mode.value = "view";
  processing.value = false;
};

// const handleSaveDraft = async () => {
//   space.value.status = "DRAFT";
//   await handleUpdateSpace();
//   navigateTo(venueListerPageRoute);
// };

const handleDeleteSpace = async () => {
  processing.value = true;
  await updateSpace(spaceId as string, { status: "FOR_DELETION" });
  useCookie<number>("cookie_page").value = 5;
  processing.value = false;
  navigateTo(venueManagementPageRoute);
};

const handlePermanentlyDelete = async () => {
  showPermanentlyDeletePrompt.value = false;
  processing.value = true;
  try {
    await updateSpace(spaceId as string, { status: "DELETED" });
    setSnackbar({
      color: "success",
      text: "Space Deleted Successfully!",
      modal: true,
    });
    navigateTo(venueManagementPageRoute);
  } catch (error) {
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  }
  processing.value = false;
};

const handleAdminAction = async (status: "SUSPENDED" | "PUBLISHED") => {
  showSuspendPrompt.value = false;
  processing.value = true;

  try {
    await adminUpdateSpace(spaceId as string, { status });
    navigateTo(venueManagementPageRoute);
    if (status === "PUBLISHED") {
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

const handleUpdateSpace = async () => {
  // console.log(space.value);

  const payload: Partial<TVenueSpace> = {
    // status: space.value.status,
  };

  if (!formValid.value || mode.value == "view") return;
  updatingSpace.value = true;

  if (activePage.value === 1) {
    payload.name = space.value.name;
    payload.description = space.value.description;
    payload.type = space.value.type;
    payload.representation = space.value.representation;
  } else if (activePage.value == 2) {
    const payloadSpacePhoto = computed(() => {
      if (space.value.space_photo.length > 0) {
        return space.value.space_photo.map((x: any) => x._id);
      } else {
        return [];
      }
    });

    const payloadVenuePhoto = computed(() => {
      if (space.value.venue_photo.length > 0) {
        return space.value.venue_photo.map((x: any) => x._id);
      } else {
        return [];
      }
    });
    payload.space_photo = payloadSpacePhoto.value;
    payload.venue_photo = payloadVenuePhoto.value;
  } else if (activePage.value === 3) {
    payload.capacity_layout = space.value.capacity_layout;
    payload.guest_capacity = space.value.guest_capacity;
    if (!space.value.guest_capacity.minimum) {
      payload.guest_capacity.minimum = null;
    }
  } else if (activePage.value === 4) {
    payload.features = space.value.features;
  } else if (activePage.value === 5) {
    if (space.value.keywords.length > 0) {
      payload.keywords = space.value.keywords;
    }
  } else if (activePage.value === 6) {
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
    // set current Currency based on registered country
    if (payload.pricing?.currency) {
      payload.pricing.currency = currentCurrency(
        currentUser.value.country,
      ).code;
    }
  }

  if (Object.keys(payload).length === 0) {
    location.reload();
    return;
  }

  // ensure that payload has status
  if (!space.value.status) {
    delete payload.status;
  }

  try {
    await updateSpace(spaceId as string, payload);
    refreshSpaceData();
    updatingSpace.value = false;
  } catch (err) {
    processing.value = false;
    updatingSpace.value = false;
  }
};

const filteredExteriorVenuePhotos = computed(() => {
  return space.value.venue_photo.filter(
    (x: any) => x.description === "exterior_venue_photo",
  );
});

const filteredInteriorVenuePhotos = computed(() => {
  return space.value.venue_photo.filter(
    (x: any) => x.description === "interior_venue_photo",
  );
});

const handleNext = async () => {
  scrollToError();

  if (mode.value === "update" || mode.value === "create") {
    // add page 3 first to skip formValid validation
    if (activePage.value === 3) {
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

    if (activePage.value === 2) {
      if (space.value.space_photo.length < 4) {
        setSnackbar({
          text: "Please upload at least 4 photo of the space",
          color: "error",
          modal: true,
        });
        return;
      } else {
        await handleUpdateSpace();
        cookieSpacePage.value++;
      }
    } else if (activePage.value === 5 && space.value.keywords.length < 1) {
      setSnackbar({
        text: "Please select at least one keyword.",
        color: "error",
        modal: true,
      });
      return;
    } else if (!formValid.value) return;
    else {
      await handleUpdateSpace();
      cookieSpacePage.value++;
      form.value.resetValidation();
    }
  } else {
    cookieSpacePage.value++;
  }
};

const handlePrevious = async () => {
  if (activePage.value === 1) {
    navigateTo(venueManagementPageRoute);
  } else {
    cookieSpacePage.value--;
  }
};

// handle double click
const click = ref(0);
const handleViewModeClick = () => {
  if (mode.value === "view") {
    form.value.resetValidation(); // reset validation in view mode
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
  keyComponent.value++;
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
    (x) => x.key === "3" && x.reference == "music_sound",
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
      (item) => !item.fullRateCheckkBox && !item.hourlyCheckBox,
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
      (item) => item.weekdays.length === 0,
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
      "Minimum of 300 characters and maximum of 2000 characters.",
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
      "Please enter a lower number. The minimum number of attendees cannot exceed the maximum venue capacity.",
    );
  else if (
    noiseObj?.answer &&
    (noiseObj?.max_capacity == null || noiseObj?.max_capacity == "")
  )
    return showError(4, "Please complete the fields.");
  else if (obj.keywords.length < 1)
    return showError(5, "Please select at least (1) one keyword.");
  else showPublishPrompt.value = true;

  // if (obj.pricing.selected_pricing == 'HIRE_FEE' && obj.pricing.hire_fee.days.some(item =>  && )) return showError(6, "Please select rate.")
};

const handlePublish = async () => {
  const payload: Partial<TVenueSpace> = {
    name: space.value.name,
    status: "FOR_APPROVAL",
  };

  processing.value = true;
  try {
    const { error } = await updateSpace(spaceId as string, payload);
    if (error.value) {
      setSnackbar({
        modal: true,
        color: "error",
        text: "Something went wrong. Please try again later.",
      });
      return;
    }

    const { error: venueUpdateError } = await updateVenue(venueId as string, { status: "FOR_APPROVAL" });
    if (venueUpdateError.value) {
      setSnackbar({
        modal: true,
        color: "error",
        text: "Something went wrong. Please try again later.",
      });
      return;
    }


  } catch (err) {
    console.log(err);
    setSnackbar({
      modal: true,
      color: "error",
      text: "Something went wrong. Please try again later.",
    });
  } finally {
    processing.value = false;
    useCookie<number>("cookie_page").value = 7; // force to go back to space page
    navigateTo(venueManagementPageRoute);
  }

};

onMounted(async () => {
  await refreshSpaceData();
  if (!cookieSpacePage.value) {
    cookieSpacePage.value = 1;
  }
});
</script>

<style scoped></style>
