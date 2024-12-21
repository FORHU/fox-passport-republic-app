<template>
    <v-form ref="form" @submit.prevent v-model="formValid" :key="`${activePage}-${venueKey}`" class=""
        :disabled="mode == 'view'">
        <v-app-bar :elevation="0" style="border-bottom: 2px solid #DEDFE3;">
            <!-- HEADER CREATE MODE -->
            <v-row v-if="mode == 'create' && activePage" no-gutters class="w-100 px-5">
                <v-row no-gutters justify="center">
                    <v-col cols="12" md="10" lg="8" xl="7" class="d-flex ga-7 align-center">
                        <span style="width: 90%;">
                            <span v-if="activePage" class="text-16px text-charcoal">Step {{ activePage + `/3` }}
                                <span class="text-18px text-secondary font-500">{{ pageItems?.find(x => x?.page ==
                                    activePage)?.title
                                    }}</span></span>
                            <span><v-progress-linear v-if="activePage" :model-value="(activePage / 3) * 100"
                                    color="primary" height="5" rounded="lg" class="mt-1"></v-progress-linear></span>
                        </span>
                        <span>
                            <v-btn variant="outlined" border="secondary md" size="large" text="Exit" rounded="lg"
                                @click="handleExit" />
                        </span>
                    </v-col>
                </v-row>
            </v-row>
            <!-- HEADER CREATE MODE -->

            <!-- HEADER UPDATE MODE -->
            <v-row v-else-if="(mode == 'update' || mode == 'view') && activePage" no-gutters class="w-100 px-5"
                justify="center">
                <v-col cols="12" md="10" lg="8" xl="7" class="d-flex  align-center justify-space-between pa-0 ma-0">
                    <v-col cols="8" sm="10" lg="auto" class="d-flex justify-start pa-0 ma-0">
                        <v-tabs v-model="activePage" selected-class="bg-transparent" density="compact" show-arrows
                            size="small" height="50px" @update:model-value="handleChangeTab">
                            <template v-for="tabItem in pageItems" :key="tabItem?.title">
                                <v-tab v-if="tabItem?.title" :value="tabItem?.page" :ripple="false" color="secondary"
                                    selected-class="text-secondary font-500" size="x-small"
                                    class="text-charcoal text-14px py-0"
                                    :style="{ borderBottom: activePage == tabItem?.page ? '2px solid rgba(var(--v-theme-secondary)' : '' }">{{
                                        tabItem?.title }}</v-tab>
                            </template>

                        </v-tabs>

                    </v-col>

                    <span>
                        <v-btn variant="outlined" border="secondary md" size="large" text="Exit" rounded="lg"
                            @click="handleExit" />
                    </span>

                </v-col>
            </v-row>
            <!-- HEADER UPDATE MODE -->

        </v-app-bar>

        <v-main>
            <LoadingDefault v-if="loading" />
            <v-row v-else no-gutters>
                <v-row no-gutters class="w-100 h-100 px-5 px-md-0" justify="center">
                    <v-col cols="12" md="10" lg="8" xl="7" class="py-5">
                        <v-row v-if="mode == 'update'" no-gutters
                            class="w-100 text-20px font-500 mb-10 d-flex align-center justify-space-between">
                            <span>{{ pageItems[activePage || 1]?.title }}</span>
                            <span>
                                <div class="d-flex align-center ga-2 py-2 py-md-3">
                                    <span>
                                        <v-badge :color="formatColor(status as string)" content="6" inline
                                            dot></v-badge>
                                    </span>
                                    <span class="font-400 text-16px">{{ formatStatus(status as string) }}</span>
                                </div>
                            </span>
                        </v-row>
                        <VenueFormOverview v-model="venue" v-if="activePage == 1" />
                        <VenueFormAddressAndLocation v-model="venue" v-if="activePage == 2" />
                        <VenueFormVenueSpaces v-if="activePage === 3" />
                    </v-col>
                </v-row>
            </v-row>
        </v-main>

        <v-app-bar :elevation="0" location="bottom" style="border-top: 2px solid #DEDFE3;">
            <!-- FOOTER -->
            <v-row no-gutters class="w-100 px-5">
                <v-row no-gutters class="w-100 h-100" justify="center">
                    <v-col cols="12" md="10" lg="8" xl="7" class="">
                        <v-row no-gutters class="w-100 h-100" align="center">
                            <v-col cols="6">
                                <v-btn v-if="activePage !== 1" variant="outlined" border="secondary md"
                                    color="secondary" @click.stop="handlePrevious" rounded="lg" size="large" class=""
                                    :loading="backButtonLoading">Back</v-btn>
                            </v-col>
                            <v-col cols="6" class="d-flex justify-end">
                                <v-btn v-if="(activePage !== 3)" :type="mode === 'view' ? 'button' : 'submit'"
                                    color="secondary" rounded="lg" size="large" variant="flat" @click.stop="handleNext"
                                    :loading="updatingVenue" class=""
                                    :text="(mode == 'create' || formId == 'spaces' || mode == 'view') ? 'Next' : 'Save & Continue'" />
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-row>
            <!-- FOOTER -->
        </v-app-bar>
    </v-form>
    <LoadingTransparent v-if="processing" />
</template>

<script setup lang="ts">
definePageMeta({
    layout: "bare",
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
    isSubscriptionBased
} = useVenue();
const { spaces, getSpaceList, space } = useSpace();
const { currentUser } = useLocalAuth();
const { formatColor, formatStatus } = useUtils();
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isUser, isAdminSales, isAdminMember } = useAccess();


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
const backButtonLoading = ref(false);

const cookiePage = useCookie<number>("cookie_page");


const pageItems = [
    {
        title: "",
        id: '',
    },
    {
        title: "Overview",
        page: 1,
        id: 'overview'
    },
    {
        title: "Address",
        page: 2,
        id: 'address'
    },
    {
        title: "Spaces",
        page: 3,
        id: 'spaces'
    }
];

const isDRAFT = computed(() => {
    const status = venue.value.status;
    return status == "DRAFT";
});

const status = computed(() => {
    return venue.value?.status
});


const venueListerPage = {
    name: "country-venues-management",
    params: { country: country },
};

const handleRefreshVenue = async () => {
    loading.value = true;
    try {
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
            }, 300)
        }

        if (error.value) {
            setSnackbar({
                color: "error",
                modal: true,
                text: "Something is wrong. Please try again later.",
            });
            navigateTo(venueListerPage);
        }
    } catch (error) {
        console.log(error);


    } finally {
        loading.value = false;
    }

};


const handlePrevious = async () => {
    if (activePage.value && activePage.value > 1) {
        backButtonLoading.value = true;

        // update form_steps when in create mode only
        if (!isAdmin && mode.value == 'create') {
            await updateVenue(venueId as string, { form_steps: activePage.value - 1 })
            handleRefreshVenue();
        }
        activePage.value = cookiePage.value = activePage.value - 1
        backButtonLoading.value = false;
    }
};

const handleNext = async () => {

    const { name, description, address, keywords } = venue.value;

    await form.value.validate();
    scrollToError();
    const el = document.querySelector(".v-field--error:first-of-type");
    if (el) {
        // mode.value = "update";
        showExitDialog.value = false;
        showExitDraftDialog.value = false;
        return;
    }

    if (activePage.value == 1) {
        if (keywords.length == 0) {
            showExitDialog.value = false;
            showExitDraftDialog.value = false;
            setSnackbar({
                color: "error",
                text: "Please select at least one keyword",
                modal: true,
            });
            return;
        }
    }

    const payload: Partial<TVenue> = {
        // status: venue.value.status,
    };


    if (activePage.value === 1) {
        payload.name = name;
        payload.description = description;
        payload.keywords = keywords;
    } else if (activePage.value === 2) {
        payload.address = address;
    }

    if (!isAdmin && mode.value == 'create' && activePage.value && activePage.value < 3) {
        payload.form_steps = activePage.value + 1;
    }

    // ensure that payload is not empty
    if (Object.keys(payload).length === 0) {
        updatingVenue.value = false;
        return;
    }

    try {
        updatingVenue.value = true;
        await updateVenue(venueId as string, payload);
    } catch (er) {
        console.log(er);
        updatingVenue.value = false;
        processing.value = false;
    } finally {
        updatingVenue.value = false;
        processing.value = false;
       
        await handleRefreshVenue();
        if (mode.value !== 'create' && activePage.value && activePage.value < 3) {
            cookiePage.value = activePage.value + 1;
        }
        
    }



}


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


watchEffect(() => {
    const formStep = venue.value.form_steps
    if (mode.value == 'create') {
        activePage.value = formStep ? formStep : 1;
    } else {
        activePage.value = cookiePage.value;
    }
})

const checkPageOnMount = () => {
    if (mode.value !== 'create') {
        activePage.value = cookiePage.value || 1;
    }
}

const handleChangeTab = (pageNum: number) => {
    cookiePage.value = pageNum
}

const checkMode = async () => {
    const status = venue.value?.status
    // conditions to check for read-only
    // if (isVenueMember.value || space.value.status == 'DELETED' || (isAdminMember && status !== 'REQUEST_FOR_CONSENT') || isAdminSales) {
    //     mode.value = 'view';
    //     return;
    // }
    await (status == 'PENDING') ? mode.value = 'create' : mode.value = 'update'
}

onMounted(async () => {
    await handleRefreshVenue();
    await checkMode();
    checkPageOnMount()
    loading.value = false;

})

</script>

<style scoped></style>