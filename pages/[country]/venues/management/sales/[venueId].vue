<template>
    <v-form ref="form" @submit.prevent v-model="formValid" :key="`${activePage}-${venueKey}`" class=""
        :disabled="mode == 'view'">
        <v-app-bar :elevation="0" style="border-bottom: 2px solid #DEDFE3;" :height="smAndDown ? '100' : '80'">
            <!-- HEADER CREATE MODE -->
            <v-row no-gutters justify="center" class="py-5">
                <v-col cols="12" md="10" lg="8" xl="7" class="d-flex ga-2 align-center px-2 px-sm-5 px-md-0">
                    <div style="width: 90%;" class="d-flex flex-column ga-1 ga-sm-0">
                        <span class="text-h6 text-sm-h5 text-lg-h4 font-500" style="line-height: 1.1;">{{
                            sliceContent(venue?.name, 40)
                            }}</span>
                        <span class="text-caption text-sm-subtitle-1 text-md-subtitle-1 font-500"
                            style="line-height: 1.1;">{{
                                formatAddress(venue?.address) }}</span>
                    </div>
                    <span v-if="status == 'REQUIRES_CONSENT' || status == 'REQUEST_TRANSFER_SENT'">
                        <v-btn variant="outlined" border="secondary md" :size="smAndUp ? 'large' : ''"
                            :class="smAndUp ? '' : 'px-3 py-2'" text="Delete" rounded="lg"
                            @click="showDeletePrompt = true" />
                    </span>
                    <span>
                        <v-btn variant="outlined" border="secondary md" :size="smAndUp ? 'large' : ''"
                            :class="smAndUp ? '' : 'px-3 py-2'" text="Exit" rounded="lg" @click="handleExit" />
                    </span>
                </v-col>
            </v-row>
            <!-- HEADER CREATE MODE -->
        </v-app-bar>

        <v-main class="fill-height w-100">
            <v-row no-gutters justify="center" class="pt-3">
                <v-col cols="12" md="10" lg="8" xl="7" class="d-flex ga-2 align-center px-2 px-sm-5 px-md-0">
                    <AlertAdminStatus v-if="statusMessage?.message && !loading" :admin-status-message="statusMessage" />
                </v-col>
            </v-row>

            <LoadingDefault v-if="loading" />

            <v-row v-else-if="totalItems !== 0 && !loading" no-gutters>
                <v-row no-gutters class="w-100 h-100 px-5 px-md-0" justify="center">
                    <v-col cols="12" md="10" lg="8" xl="7" class="py-5">
                        <v-row v-if="mode == 'update'" no-gutters
                            class="w-100 text-20px font-500 mb-10 d-flex align-center justify-space-between">
                        </v-row>
                        <span class="text-18px font-500">Space no. {{ page }} details</span>

                        <CardImageGallery :photos-arr="space.space_photo" />


                        <v-row no-gutters class="w-100 text-22px font-500">{{ space.name }}</v-row>
                        <v-row no-gutters class="w-100 text-16px">
                            <template v-for="(item, index) in space?.capacity_layout.filter(x => x.answer)"
                                :key="item._id">
                                <span v-if="item.answer"><span v-if="index != 0">&nbsp;<span>•</span>&nbsp;</span>{{
                                    item?.max_capacity }}
                                    {{ item?.question }}&nbsp;</span>
                            </template>
                            <span class="ml-1">• {{ space?.guest_capacity?.floorspace?.value }} sqm</span>
                        </v-row>
                        <SpacesType :space-type="space.representation" class="mt-5" />

                        <v-divider class="my-5"></v-divider>

                        <v-row no-gutters class="w-100 text-18px font-500">Description</v-row>
                        <ExpandableDescription :description="space.description" />

                        <v-divider class="my-5"></v-divider>

                        <v-row no-gutters class="w-100 text-18px font-500">Features</v-row>
                        <SpacesDetailsFacilities :specific-space="space" class="mt-3" />

                        <v-divider class="my-5"></v-divider>

                        <v-row no-gutters class="w-100 text-18px font-500">Keywords</v-row>
                        <KeywordsDisplay :keywords="space.keywords" hide-title />

                        <v-divider class="my-5"></v-divider>

                        <v-row no-gutters class="w-100 text-18px font-500">Pricing</v-row>
                        <SpacesDetailsPrices :specific-space="{ pricing: space.pricing }" />

                        <!-- <v-divider class="my-5"></v-divider> -->

                        <!-- <v-row no-gutters class="w-100 text-18px font-500">Terms and Conditions</v-row>
                        <p class="mt-2 text-16px">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex
                            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                            dolore eu fugiat nulla
                            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                            mollit anim id est
                            laborum.</p> -->

                    </v-col>
                </v-row>
            </v-row>
            <v-row v-else no-gutters class="h-100 w-100 d-flex" align-content="center" justify="center"
                style="min-height: 80dvh;">
                <v-empty-state text="When you do, they'll appear here." title="No Spaces created yet"></v-empty-state>
            </v-row>
        </v-main>

        <v-app-bar :elevation="0" location="bottom" style="border-top: 2px solid #DEDFE3;">
            <!-- FOOTER -->
            <v-row no-gutters class="w-100 px-5">
                <v-row no-gutters class="w-100 h-100" justify="center">
                    <v-col cols="12" md="10" lg="8" xl="7" class="">
                        <v-row no-gutters class="w-100 h-100" align="center">
                            <v-col cols="9" class="d-flex justify-start w-100">
                                <div v-if="totalPages > 1">
                                    <v-pagination v-model="page" :length="totalPages" rounded="circle" class="w-100"
                                        color="secondary" @update:model-value="handlePageChange"
                                        :total-visible="width < 520 ? 1 : 4" size="small"></v-pagination>
                                </div>

                            </v-col>
                            <v-col cols="3" class="d-flex justify-end ga-2">
                                <template v-if="status == 'REQUIRES_CONSENT' || status == 'REQUEST_TRANSFER_SENT'">
                                    <v-btn color="secondary" rounded="lg" size="" variant="outlined"
                                        @click.stop="showDeclinedDialog = true" :loading="updatingVenue"
                                        class="px-4 py-2" :text="'Decline'" />
                                    <v-btn v-if="status == 'REQUIRES_CONSENT'" color="secondary" rounded="lg" size=""
                                        variant="flat" @click.stop="showApprovalDialog = true" :loading="updatingVenue"
                                        class="px-4 py-2" :text="'Approve'" />
                                    <v-btn v-if="status == 'REQUEST_TRANSFER_SENT'" color="secondary" rounded="lg"
                                        size="" variant="flat" @click.stop="showResendTransferDialog = true"
                                        :loading="updatingVenue" class="px-4 py-2" :text="'Resend'" />
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
    <DialogApprovalDialog v-model="showApprovalDialog" v-model:email="emailInput" @approve="handleApproval"
        title="Are you sure you want to proceed with the approval?" :loading="approveProcessing" />
    <DialogResendTransferOwnership v-model="showResendTransferDialog" :email="venue?.user?.email"
        @approve="handleResendTransfer" :loading="resending"
        title="Are you sure you want to resend transfer of ownership?" @update-email="showApprovalDialog = true" />
    <DialogPromptNew v-model="showDeclinedDialog" prompt-title="Are you sure you want to decline this venue?"
        prompt-text="Please note that this action is irreversible. " agree-button-color="red"
        agree-button-text="Decline" @agree="handleDeclineAction" :loading="declineProcessing" />
    <DialogPromptNew v-model="showDeletePrompt" prompt-title="Are you sure you want to DELETE this venue?"
        prompt-text="Please note that this action is irreversible. " agree-button-text="Delete"
        @agree="handleRequestForDeletion" :loading="declineProcessing" />
</template>

<script setup lang="ts">
definePageMeta({
    layout: "bare",
});
import MVenue from "~/models/venue.model";
import MSpace from "~/models/space.model";
import { useDisplay } from "vuetify";
const { smAndUp, lgAndUp, mdAndUp, smAndDown, width } = useDisplay();

const { country,
    setSnackbar,
} = useLocal();
const { venueId, formId } = useRoute().params as { venueId: string, formId: string };

const {
    mode,
    venue,
    updateVenue,
    getVenue,
    activePage,
    approvalOwnerConsent,
    resendOwnerTransferEmail,
} = useVenue();
const { space, getFilteredSpaceList, spaces } = useSpace();
const { currentUser } = useLocalAuth();
const { formatColor, formatStatus, formatAddress, sliceContent } = useUtils();
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isUser, isAdminSales, isAdminMember } = useAccess();



const clonedVenueData = ref(); // cloned initial venue data before changes
const formValid = ref<boolean>(false);
const form = ref();
const loading = ref(true);
const activeSpacePage = ref(1);
const processing = ref(false);
const updatingVenue = ref(false);
const venueKey = ref(0);
const totalPages = ref(0);
const totalItems = ref(0)
const page = ref(1);
const pageLimit = ref(1);
const showApprovalDialog = ref(false);
const showDeclinedDialog = ref(false);
const emailInput = ref('')
const declineProcessing = ref(false);
const approveProcessing = ref(false);
const showDeletePrompt = ref(false);
const showResendTransferDialog = ref(false);
const resending = ref(false);


const backButtonLoading = ref(false);

const cookiePage = useCookie<number>("cookie_page");
const somethingWentWrongMessage = {
    color: "error",
    modal: true,
    text: "Something went wrong. Please try again later.",
}



const statusMessage = computed(() => {
    const venueStatus = status.value;

    let color = '';
    let message = '';

    if (venueStatus == 'OWNER_DECLINED') {
        color = 'red-darken-4';
        message = 'This venue has been declined by the client.'
    } else if (venueStatus == 'OWNER_REQUEST_DELETION') {
        message = 'This venue has been requested for deletion by the client.'
    } else if (venueStatus == 'PENDING') {
        message = 'This venue is still in progress.'
        color = 'light-blue-lighten-4'
    } else if (venueStatus == 'REQUEST_TRANSFER_SENT') {
        message = "This venue has already been requested for transfer. You may resend the request via the 'Resend' button."
        color = 'green-lighten-1'
    }

    return {
        message, color
    }
})


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
                setSnackbar(somethingWentWrongMessage);
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
        await fetchSpaceList(venueId as string);
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
        backButtonLoading.value = false;
    }
};




const fetchSpaceList = async (venueId: string) => {
    loading.value = true;
    const statusFilter = computed(() => {
        return 'REQUIRES_CONSENT,OWNER_DECLINED,OWNER_REQUEST_DELETION,DRAFT'
    });

    const query: ISpaceManagementListQuery = {
        // venueId as string, statusFilter.value, page.value, pageLimit.value
        venueId,
        page: page.value,
        limit: pageLimit.value,
    };

    if (statusFilter.value) {
        query.status = statusFilter.value;
    }

    try {
        // const { data } = await getFilteredSpaceList(venueId as string, statusFilter.value, page.value, pageLimit.value);
        const { data, error } = await getFilteredSpaceList(venueId as string, statusFilter.value, page.value, pageLimit.value);
        if (data.value) {
            const res = data.value as any;
            const spaceData = res.data.data;
            spaces.value = spaceData;
            totalPages.value = res.data.total_pages;
            totalItems.value = res.data.total_items;
            space.value = new MSpace(spaceData[0])
        }
    } catch (error) {
        console.error("Error fetching space list:", error);
        setSnackbar(somethingWentWrongMessage);
        spaces.value = [];
    } finally {
        loading.value = false;
    }
};

const handlePageChange = () => {
    fetchSpaceList(venueId as string)
}



const handleExit = () => {
    navigateTo({ name: 'country-venues-management', params: { country } });
}

const handleApproval = async () => {
    approveProcessing.value = true;
    try {
        const res: any = await approvalOwnerConsent({ venueId, email: emailInput.value })
        if (res) {

            const message = res?.data?.message
            const description = res?.data?.description
            if (message == 'VENUE_SUCCESSFULLY_TRANSFERRED') {
                setSnackbar({ modal: true, color: 'success', text: `Venue Transferred Successfully to ${emailInput.value}!.` })
            } else {
                setSnackbar({ modal: true, color: 'success', text: "Venue Approved Successfully! Please check client's email for account transfer link." })
            }
            showApprovalDialog.value = false;
            await handleRefreshVenue();

        }
    } catch (error: any) {
        const desc = error?.description
        if (desc == 'VENUE_OWNER_PENDING_PROFILE') {
            setSnackbar({ modal: true, color: 'error', text: `Venue Owner's email has an ongoing transfer. Please complete your profile to proceed.` })
        } else {
            setSnackbar(somethingWentWrongMessage)
        }
    } finally {
        approveProcessing.value = false;
    }
}

const handleResendTransfer = async () => {
    resending.value = true;
    try {
        const res = await resendOwnerTransferEmail(venueId as string);
        if (res) {
            setSnackbar({ modal: true, color: 'info', text: "Venue transfer request resent! Please check the client's email for the account transfer link." })
            showResendTransferDialog.value = false;
            await handleRefreshVenue();

        }
    } catch (error: any) {
        setSnackbar(somethingWentWrongMessage)
    } finally {
        resending.value = false;
    }
}


const handleDeclineAction = async () => {
    declineProcessing.value = true;
    try {
        const { data, error } = await updateVenue(venueId as string, { status: 'OWNER_DECLINED' })
        if (data.value) {
            setSnackbar({ modal: true, color: 'info', text: "Venue successfully declined!" })
            showDeclinedDialog.value = false;
            await handleRefreshVenue();
        }
        if (error.value) {
            setSnackbar(somethingWentWrongMessage);
        }

    } catch (error: any) {
        console.log('decline-action-error', error.message);
        setSnackbar(somethingWentWrongMessage);
    } finally {
        declineProcessing.value = false;
    }

}

const handleRequestForDeletion = async () => {
    declineProcessing.value = true;
    try {
        const { data, error } = await updateVenue(venueId as string, { status: 'OWNER_REQUEST_DELETION' })
        if (data.value) {
            setSnackbar({ modal: true, color: 'info', text: "Venue successfully requested for deletion!" })
            showDeletePrompt.value = false;
            await handleRefreshVenue();
        }
        if (error.value) {
            setSnackbar(somethingWentWrongMessage);
        }

    } catch (error: any) {
        console.log('decline-action-error', error.message);
        setSnackbar(somethingWentWrongMessage);
    } finally {
        declineProcessing.value = false;
    }
}

onMounted(async () => {
    await handleRefreshVenue();
    loading.value = false;

})

</script>

<style scoped></style>