<template>
    <v-row no-gutters class="pa-5 pa-md-7 text-secondary text-16px d-flex flex-column justify-start"
        style="min-height: fit-content;">
        <v-col cols="12" class="w-100 font-600 text-22px h-100 px-3 d-flex align-center justify-space-between"><span>{{
            totalVenuesCount }} Venues</span>
            <span v-if="!mdAndUp" class="d-flex align-center ga-2">
                <span class="">
                    <ButtonToggleView v-model="viewMode" max-height="40px"
                        @update:model-value="handleButtonToggleChange" />
                </span>
                <!-- <span v-if="isAdmin || isAdminMember">
                    <v-btn icon="mdi-file-arrow-up-down-outline" variant="outlined" color="secondary"
                        text="Batch Upload" height="40" rounded="lg" @click="handleBatchUpload"></v-btn>
                </span> -->
                <span v-if="isVenueOwner || isVenueAdmin || isAdminMember || isAdminSales">
                    <v-btn rounded="lg" variant="flat" border="secondary md" icon="mdi-plus" height="40"
                        color="secondary" @click="addNewVenue"></v-btn>
                </span>
            </span></v-col>

        <v-col cols="12" no-gutters class="my-5 w-100 d-flex ga-3 align-center text-16px">
            <v-col class="d-flex align-center ga-2 w-100">
                <span style="width: 60%;">
                    <v-text-field v-model="searchText" variant="outlined" color="tertiary"
                        placeholder="Search venue or space name" prepend-inner-icon="mdi-magnify" rounded="lg"
                        hide-details height="40" @update:model-value="handleSearch" clearable></v-text-field>
                </span>
                <span style="width: 40%;">
                    <v-select v-model="status" rounded="lg" item-title="label" item-value="value"
                        :items="mappedStatusList" placeholder="Status" hide-details height="40"
                        @update:model-value="handleChangeStatusFilter"></v-select>
                </span>
                <!-- <span v-if="!mdAndUp">
                    <v-btn rounded="lg" variant="flat" color="secondary" text="Drafts" icon="mdi-plus" height="40"
                        @click="addNewVenue"></v-btn>
                </span> -->
            </v-col>
            <v-col class="d-none d-md-flex align-center justify-end ga-2 w-100">
                <span class="">
                    <ButtonToggleView v-model="viewMode" max-height="40px"
                        @update:model-value="handleButtonToggleChange" />
                </span>
                <!-- <span>
                    <v-btn rounded="lg" variant="outlined" border="secondary md" text="Drafts"
                        prepend-icon="mdi-archive-outline" height="40" @click="goToDrafts"></v-btn>
                </span> -->
                <!-- <span v-if="isAdmin || isAdminMember">
                    <v-btn prepend-icon="mdi-file-arrow-up-down-outline" variant="outlined" color="secondary"
                        text="Batch Upload" height="40" rounded="lg" @click="handleBatchUpload"></v-btn>
                </span> -->

                <span v-if="isVenueOwner || isVenueAdmin || isAdminMember || isAdminSales">
                    <v-btn prepend-icon="mdi-plus" color="secondary" text="Add Venue" height="40" rounded="lg"
                        @click="addNewVenue"></v-btn>
                </span>

            </v-col>
        </v-col>
        <v-col v-if="viewMode == 'table'" cols="12" class="">

            <v-row v-if="totalVenuesCount == 0 && !smAndUp && !loading" no-gutters class="w-100" justify="center">
                <v-empty-state v-if="isZeroSearch" icon="mdi-magnify" height="300"
                    text="Try adjusting your search terms or filters. Sometimes less specific terms or broader queries can help you find what you're looking for."
                    title="We couldn't find a match."></v-empty-state>
                <v-empty-state v-else title="No Venues Yet" height="300"
                    text="You haven't finished any venues yet. When you do, they'll appear here."></v-empty-state>
            </v-row>

            <v-data-table-server v-else v-model:items-per-page="pageLimit" :headers="headers" :items="mappedVenueList"
                :items-length="totalVenuesCount" item-key="name" height="auto" fixed-footer :loading="loading"
                items-per-page-text="Rows per page" @update:options="loadItems" v-model:expanded="expanded"
                item-value="_id" :items-per-page-options="[{ title: '10', value: 10 }, { title: '20', value: 20 }]"
                @update:page="(page: number) => onUpdatePageHandler(page)"
                style="border: 2px solid #DEDFE3; border-radius: 8px;" last-icon="mdi-chevron-double-right"
                first-icon="mdi-chevron-double-left">
                <template v-slot:headers="{ columns }">
                    <tr class="bg-light_gray text-charcoal font-500 text-16px">
                        <template v-for="column in columns">
                            <td :style="{ minWidth: column.key == 'venue' ? '350px' : '0px', height: '40px' }">
                                <span class="px-2">{{ column.title }}</span>
                            </td>
                        </template>
                    </tr>
                </template>
                <template v-slot:item="{ item, isExpanded, internalItem }">
                    <tr class="cursor-pointer text-16px text-secondary"
                        @click="handleEditVenue(item._id as string, item.status as string)">
                        <td>
                            <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
                                <span>
                                    <v-img :lazy-src="imageSrc(item._id as string) || '/svg/default-draft-image.svg'"
                                        :src="imageSrc(item._id as string) || '/svg/default-draft-image.svg'"
                                        height="54px" width="54px" cover rounded="lg" alt="venue default image"></v-img>
                                </span>
                                <span>{{ sliceContent(item.venue, 30) }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-center ga-2 py-2 py-md-3">
                                <span>
                                    <v-badge :color="formatColor(item.status as string)" content="6" inline
                                        dot></v-badge>
                                </span>
                                <span class="text-16px">{{ formatStatus(item.status as string) }}</span>
                                <span v-if="teamAdmin && !isVenuePartOfVenueWithConsent(item.status as string)"
                                    class="d-flex align-center text-secondary">
                                    <v-btn density="compact" variant="text" icon size="small" flat
                                        @mouseover="activeOwnerVerificationStatus(item?.user?._id as string, (item?.user?.first_name as string), (item?.user?.email  as string))">
                                        <v-icon>mdi-information-variant-circle-outline</v-icon>
                                        <v-tooltip activator="parent" :location="lgAndUp ? 'right' : 'top'"
                                            open-on-click>
                                            <template v-if="verifyingOwner">
                                                <p>Checking...</p>
                                            </template>
                                            <template v-else>
                                                <div v-html="ownerTooltipDiv">
                                                </div>
                                            </template>

                                        </v-tooltip>
                                    </v-btn>
                                </span>
                            </div>
                        </td>
                        <td>
                            <div no-gutters class="w-100 d-flex ga-2 justify-end py-2 py-md-3">
                                <template
                                    v-if="(isAdminSales || isAdminMember) && item?.status != 'DELETED' && isVenuePartOfSalesViewOnly(item?.status as string)">
                                    <v-btn border="secondary sm" flat icon="mdi-briefcase-eye" size="small" rounded="lg"
                                        @click.stop="handleViewSalesPage(item?._id as string)"></v-btn>
                                </template>
                                <template
                                    v-if="(isAdminSales || isAdminMember) && item?.status != 'DELETED' && isVenuePartOfVenueWithConsent(item?.status as string)">
                                    <v-btn border="secondary sm" flat icon="mdi-circle-edit-outline" size="small"
                                        rounded="lg" @click.stop="handleEditSalesPage(item?._id as string)"></v-btn>
                                </template>

                                <template v-else-if="!isAdminSales && !isAdminMember && item?.status != 'DELETED'">
                                    <v-btn border="secondary sm" flat
                                        :icon="showEditActionButton(item?.status as string) ? 'mdi-square-edit-outline' : 'mdi-eye-outline'"
                                        size="small" rounded="lg"
                                        @click.stop="handleEditVenue(item._id as string, item?.status as string)"></v-btn>
                                </template>
                                <v-btn border="secondary sm"
                                    v-if="isVenueOwner && item.status != 'DELETED' && item.status != 'FOR_DELETION' || (isVenuePartOfVenueWithConsent(item?.status as string) && (isAdmin || isAdminMember))"
                                    flat icon="mdi-trash-can-outline" size="small" rounded="lg"
                                    @click.stop="handleDeleteVenue(item)"></v-btn>
                                <v-btn color="secondary"
                                    :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                    variant="text" @click.stop.prevent="handleExpanded(item)"></v-btn>
                            </div>
                        </td>
                    </tr>
                </template>


                <!-- EXPANDED ROWS FOR SPACE -->
                <template v-slot:expanded-row="{ columns, item }">
                    <template v-if="loadingSpaceList">
                        <tr>
                            <td colspan="3">
                                <LoadingChat :lines="1" />
                            </td>
                        </tr>
                    </template>
                    <template v-else-if="!loadingSpaceList && selectedVenueSpaceList.length > 0">

                        <tr v-for="spaceItem in selectedVenueSpaceList" :key="spaceItem._id"
                            class="bg-blue-grey-lighten-5 cursor-pointer"
                            @click="handleViewSpace(spaceItem?._id as string, item?._id as string, item?.status, item?.form_steps)">
                            <td>
                                <div class="d-flex align-center ga-3 pl-7 py-2 py-md-3">
                                    <span>
                                        <v-img
                                            :lazy-src="featuredImage(spaceItem as TVenueSpace) || '/svg/default-draft-image.svg'"
                                            :src="featuredImage(spaceItem as TVenueSpace) || '/svg/default-draft-image.svg'"
                                            height="54px" width="54px" cover rounded="lg"
                                            alt="venue featured image"></v-img>
                                    </span>
                                    <span>{{ sliceContent(spaceItem?.name, 30) }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-center ga-2 py-2 py-md-3">
                                    <span>
                                        <v-badge :color="formatColor(spaceItem?.status as string)" content="6" inline
                                            dot></v-badge>
                                    </span>
                                    <span class="text-16px">{{ formatStatus(spaceItem?.status as string) }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="w-100 d-flex ga-2 justify-end py-2 py-md-3">
                                    <v-btn v-if="spaceItem.status !== 'DELETED'" border="secondary sm" flat
                                        :icon="(isVenueMember || ((isAdminMember || isAdminSales) && item.status !== 'PENDING' && item.status !== 'REQUIRES_CONSENT')) ? 'mdi-eye-outline' : 'mdi-square-edit-outline'"
                                        size="small" rounded="lg"
                                        @click.stop="handleViewSpace(spaceItem._id as string, item?._id as string, item?.status, item?.form_steps)"></v-btn>
                                    <v-btn border="secondary sm" v-if="
                                        isVenueOwner &&
                                        spaceItem?.status !== 'DELETED' &&
                                        spaceItem?.status !== 'FOR_DELETION'
                                    " flat icon="mdi-trash-can-outline" size="small" rounded="lg"
                                        @click.stop="showDeleteSpacePromptHandler(spaceItem as any, item as any)"></v-btn>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr>
                            <td colspan="3">
                                <div class="d-flex justify-center">
                                    No space created yet.
                                </div>
                            </td>
                        </tr>
                    </template>
                </template>

                <template v-slot:loading>
                    <v-row class="w-100 py-2" no-gutters>
                        <v-col cols="12">
                            <LoadingChat :lines="5" />
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:no-data>
                    <v-row no-gutters class="w-100" justify="center">
                        <v-empty-state v-if="isZeroSearch" icon="mdi-magnify" height="300"
                            text="Try adjusting your search terms or filters. Sometimes less specific terms or broader queries can help you find what you're looking for."
                            title="We couldn't find a match."></v-empty-state>
                        <v-empty-state v-else title="No Venues Yet" height="300"
                            text="You haven't finished any venues yet. When you do, they'll appear here."></v-empty-state>
                    </v-row>
                </template>
            </v-data-table-server>


        </v-col>

        <v-col v-else cols="12" class="d-flex flex-column">
            <v-row v-if="mappedVenueList.length > 0 && !loading" no-gutters class="picture-grid px-3">
                <template v-for="item in mappedVenueList">

                    <div align="center" class="grid-box pb-15">
                        <v-card rounded="lg" elevation="2" class="cursor-pointer"
                            :lazy-image="imageSrc(item._id as string) || '/images/venue/housedefault.png'"
                            :image="imageSrc(item._id as string) || '/images/venue/housedefault.png'" height="100%"
                            width="100%" cover variant="flat"
                            @click="handleEditVenue(item._id as string, item.status as string)">
                            <v-row no-gutters class="w-100 text-secondary">
                                <v-col cols="12" align="start" class="pa-3 d-flex align-center justify-space-between">
                                    <span>
                                        <v-chip color="white" variant="flat">
                                            <div class="d-flex align-center ga-2 py-2 py-md-3">
                                                <span>
                                                    <v-badge :color="formatColor(item.status as string)" content="6"
                                                        inline dot></v-badge>
                                                </span>
                                                <span class="text-16px text-charcoal">{{ formatStatus(item.status as
                                                    string)
                                                }}</span>
                                            </div>

                                        </v-chip>
                                    </span>
                                    <span @click.stop>
                                        <v-menu transition="scale-transition" location="left">
                                            <template v-slot:activator="{ props }">
                                                <v-btn icon="mdi-dots-horizontal" v-bind="props" size="30"></v-btn>
                                            </template>

                                            <v-list>
                                                <template
                                                    v-if="(isAdminSales || isAdminMember) && item?.status != 'DELETED' && isVenuePartOfSalesViewOnly(item?.status as string)">
                                                    <v-list-item @click.stop="handleViewSalesPage(item?._id as string)">
                                                        <template v-slot:prepend>
                                                            <v-icon icon="mdi-briefcase-eye"></v-icon>
                                                        </template>
                                                        View Sales
                                                    </v-list-item>
                                                </template>
                                                <template
                                                    v-if="(isAdminSales || isAdminMember) && item?.status != 'DELETED' && isVenuePartOfVenueWithConsent(item?.status as string)">
                                                    <v-list-item @click.stop="handleEditSalesPage(item?._id as string)">
                                                        <template v-slot:prepend>
                                                            <v-icon icon="mdi-circle-edit-outline"></v-icon>
                                                        </template>
                                                        Edit
                                                    </v-list-item>
                                                </template>

                                                <v-list-item
                                                    v-else-if="!isAdminSales && !isAdminMember && item?.status != 'DELETED'"
                                                    @click="handleEditVenue(item._id as string)">
                                                    <template v-slot:prepend>
                                                        <v-icon icon="mdi-square-edit-outline"></v-icon>
                                                    </template>
                                                    Edit
                                                </v-list-item>
                                                <v-list-item
                                                    v-if="isVenueOwner && item.status != 'DELETED' && item.status != 'FOR_DELETION' || (isVenuePartOfVenueWithConsent(item?.status as string) && (isAdmin || isAdminMember))"
                                                    @click="handleDeleteVenue(item)">
                                                    <template v-slot:prepend>
                                                        <v-icon icon="mdi-trash-can-outline"></v-icon>
                                                    </template>Delete</v-list-item>
                                            </v-list>
                                        </v-menu>

                                    </span>
                                </v-col>
                            </v-row>
                        </v-card>

                        <v-row no-gutters class="w-100 text-16px text-secondary text-start px-2 pt-2"
                            style="word-break:keep-all; text-align: start; line-height: 1.2;">{{
                                sliceContent(item.venue, 30) }}</v-row>
                    </div>

                </template>
            </v-row>

            <v-row v-else-if="mappedVenueList.length == 0 && !loading" no-gutters>
                <v-col cols="12" class="mt-10">
                    <v-empty-state v-if="isZeroSearch" icon="mdi-magnify" height="300"
                        text="Try adjusting your search terms or filters. Sometimes less specific terms or broader queries can help you find what you're looking for."
                        title="We couldn't find a match."></v-empty-state>

                    <v-empty-state v-else title="No Venues Yet" height="300"
                        text="You haven't finished any venues yet. When you do, they'll appear here."></v-empty-state>

                </v-col>
            </v-row>

            <v-col v-else cols="12" class="d-flex flex-column">
                <v-row no-gutters class="picture-grid px-3">
                    <template v-for="item in 10">
                        <v-col align="center" class="grid-box pb-5">
                            <v-skeleton-loader rounded="lg" class="border " height="100%" width="100%"
                                type="table-heading, image"></v-skeleton-loader>
                        </v-col>
                    </template>
                </v-row>
            </v-col>

            <v-row v-if="totalPages > 1" no-gutters class="w-100 mt-4">
                <v-col align="center">
                    <v-pagination v-model="page" :length="totalPages" :total-visible="5"></v-pagination>
                </v-col>
            </v-row>
        </v-col>
    </v-row>

    <!-- VENUE DELETE ACTION DIALOG -->
    <DialogPromptNew v-model="showDeletePrompt" @agree="handleDeleteVenueAction"
        :prompt-title="`Are you sure to delete ${sliceContent(selectedVenue?.venue, 50)}?`"
        prompt-text="Please note that deletion requires approval." agree-button-text="Delete it"
        disagree-button-text="Nevermind" :loading="processing" />
    <DialogPromptNew v-model="showDeleteDraftPrompt" @agree="handleDeleteDraftAction"
        :prompt-title="`Are you sure to delete ${sliceContent(selectedVenue?.venue, 50)}?`"
        prompt-text="Once you delete it, you can’t get it back." agree-button-text="Delete it"
        disagree-button-text="Nevermind" :loading="processing" />
    <!-- VENUE DELETE ACTION DIALOG -->


    <!-- SPACE DELETE ACTION DIALOG -->
    <DialogPromptNew v-model="showPermanentlyDeleteSpacePrompt" @agree="handlePermanentlyDeleteSpace"
        :prompt-title="`Are you sure you want to delete ${sliceContent(selectedSpace?.name, 50)} permanently?`"
        prompt-text="Once you delete it, you can't get it back" agree-button-text="Delete it"
        disagree-button-text="Nevermind" :loading="spaceDeleteProcessing" />
    <DialogPromptNew v-model="showDeleteSpacePrompt" @agree="handleDeleteWithSpaceValidation"
        :prompt-title="`Are you sure you want to delete ${sliceContent(selectedSpace?.name, 50)}?`"
        prompt-text="By proceeding, they system will check for ongoing transactions/bookings."
        agree-button-text="Delete it" disagree-button-text="Nevermind" :loading="spaceDeleteProcessing" />
    <!-- SPACE DELETE ACTION DIALOG -->

    <DialogCompleteAccountDetails />
    <input type="file" accept=".xlsx, .xls," id="batch-file-upload" ref="fileInput" style="display: none"
        @change="handleFileChange" />
</template>

<script setup lang="ts">
import MVenue from "~/models/venue.model";
definePageMeta({
    layout: "venue-management-new",
    middleware: ['auth', 'owner-admin-access']
});

import { useDisplay } from "vuetify";
import type SpaceFormId from "./venue/[venueId]/spaces/[spaceId]/[spaceFormId].vue";
const { smAndUp, mdAndUp, lgAndUp } = useDisplay();
const { loggedIn, currentUser } = useLocalAuth();
const { country, setSnackbar } = useLocal();
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isUser, isAdminMember, isAdminSales, teamAdmin } = useAccess();
const { getAllSpacesWithoutPagination, featuredImage, deleteMultipleSpaces, deleteSpaceWithValidation } = useSpace();
const {
    venues,
    venue,
    mode,
    getVenueList,
    getAdminVenueList,
    activeStatus,
    getAdminVenueCount,
    venueCount,
    getVenueCount,
    drawer,
    viewMode,
    status,
    updateVenue,
    deleteVenue,
    deleteMultipleVenues,
    statusList,
    isVenuePartOfVenueWithConsent,
    isVenuePartOfSalesViewOnly,
    batchUploadExcelFile
} = useVenue();
const { formatAddress, formatStatus, formatColor, sliceContent } = useUtils();
const { checkOwnerOnboardingStatus } = useVerified();

interface ISpaceList {
    name: string;
    _id: string;
    status: string;
    space_photo: TFile[]
}


const selectedVenue = ref();
const showDeletePrompt = ref(false);
const showDeleteDraftPrompt = ref(false);
const loading = ref(true);
const processing = ref(false);
const page = ref(1);
const pageLimit = ref(10);
const totalPages = ref(1);
const selectedData = ref("");
const totalVenuesCount = ref(0);
const searchText = ref('');
const menuOpen = ref(false);
const expanded = ref<string[]>([]);
const fileInput = ref()
const batchUploading = ref(false);

const selectedVenueSpaceList = ref<ISpaceList[]>([])
const loadingSpaceList = ref(false);

const somethingWentWrongMessage = {
    color: "error",
    text: "Something went wrong. Please try again.",
    modal: true,
};


const headers = [
    { title: 'Venue', align: 'start', sortable: false, key: 'venue' },
    { title: 'Status', align: 'end', key: 'status' },
    { title: '', key: 'action', align: 'end' },
]

const mappedVenueList = computed(() => {
    return venues.value.sort((a: any, b: any) => b.updatedAt - a.updatedAt).map((x: TVenue) => ({
        venue: x.name,
        status: x.status,
        _id: x?._id,
        form_steps: x?.form_steps,
        user: x?.user
    }))
});


const mappedStatusList = computed(() => {

    // find requires consent obj
    const requiresConsentObj = statusList.find((x: any) => x.value === 'REQUIRES_CONSENT')

    // find transfer request sent obj
    const requestTransferSentObj = statusList.find((x: any) => x.value === 'REQUEST_TRANSFER_SENT')

    // find pending status obj
    const pendingObj = statusList.find((x: any) => x.value === 'PENDING')

    // find owner declined status obj
    const ownerDeclinedObj = statusList.find((x: any) => x.value === 'OWNER_DECLINED')

    // find owner deletion status obj
    const ownerRequestDeletionObj = statusList.find((x: any) => x.value === 'OWNER_REQUEST_DELETION')

    // find All status obj
    const allObject = statusList.find((x: any) => x.value === null)


    // exclusions
    const excludeVenueLister = ['PENDING', 'REQUIRES_CONSENT', 'OWNER_DECLINED', 'OWNER_REQUEST_DELETION', 'REQUEST_TRANSFER_SENT']
    const excludeAdminSales = [null, 'REQUIRES_CONSENT', 'OWNER_DECLINED', 'PENDING', 'OWNER_REQUEST_DELETION', 'REQUEST_TRANSFER_SENT']
    const excludeAdminMember = [null, 'REQUIRES_CONSENT', 'OWNER_DECLINED', 'PENDING', 'OWNER_REQUEST_DELETION', 'REQUEST_TRANSFER_SENT']

    if (isVenueOwner || isVenueOwner || isVenueMember) {
        return statusList.filter((x: any) => !excludeVenueLister?.includes(x.value))
    } else if (isAdminSales) {
        return [allObject, requiresConsentObj, requestTransferSentObj, ownerDeclinedObj, ownerRequestDeletionObj, pendingObj].concat(statusList.filter((x: any) => !excludeAdminSales.includes(x.value)))
    } else if (isAdminMember) {
        return [allObject, requiresConsentObj, requestTransferSentObj, pendingObj, ownerRequestDeletionObj, ownerDeclinedObj].concat(statusList.filter((x: any) => !excludeAdminMember.includes(x.value)))
    }
    else {
        return statusList
    }
})



// check if there is present filter
const isZeroSearch = computed(() => {
    return (status.value !== 'All' && status.value !== null) || searchText.value
})


// fetch VenueList on mount
const fetchVenueList = async (
    status: string,
    page: number,
    limit = pageLimit.value,
    venue_name?: string | null,
    skipLoading?: boolean
) => {
    loading.value = skipLoading ? false : true;
    try {
        const { data } = await getVenueList(status, page, limit, venue_name);
        if (!data || !data.value) return;
        const res = data.value as any;
        if (!res.data.data) {
            setSnackbar(somethingWentWrongObj);
            return;
        }

        venues.value = res.data.data;
        totalPages.value = res.data.total_pages;
        totalVenuesCount.value = res.data.total_items;
    } catch (error) {
        console.error("Error fetching venue list:", error);
        venues.value = [];
    } finally {
        loading.value = false;
    }
};

// fetch ADMIN VenueList  on mount
const fetchAdminVenueList = async (
    status: string,
    page: number,
    limit = pageLimit.value,
    venue_name?: string | null
) => {
    loading.value = true;
    try {
        const { data } = await getAdminVenueList(status, page, limit, venue_name);
        if (!data || !data.value) return;
        const res = data.value as any;
        if (!res.data.data) {
            setSnackbar(somethingWentWrongObj);
            return;
        }

        venues.value = res.data.data;
        totalPages.value = res.data.total_pages;
        totalVenuesCount.value = res.data.total_items;
    } catch (error) {
        console.error("Error fetching venue list:", error);
        venues.value = [];
    } finally {
        loading.value = false;
    }
};



const pageRoute = "country-venues-management";
const somethingWentWrongObj = { color: "error", text: "Something went wrong. Please try again.", modal: true, }


const addNewVenue = async () => {
    mode.value = "create";
    navigateTo({
        name: "country-venues-management-new-venue",
        params: { country: country },
    });
};

const handleEditVenue = async (id: string, status: string) => {
    if (!id) return;

    if (isVenuePartOfVenueWithConsent(status) && isAdminSales) {
        handleEditSalesPage(id)
        return;
    }
    navigateTo({
        name: "country-venues-management-venue-venueId-formId",
        params: { country: country, venueId: id, formId: 'overview' },
    });
};

// const handleEditSalesVenue = async (id: string, status: string) => {
//     if (!id) return;
//     if (isVenuePartOfSalesViewOnly(status)) {
//         navigateTo({
//         name: "country-venues-management-sales-venueId",
//         params: { country: country, venueId: id },
//     });
//     return;

//     } else {
//         navigateTo({
//             name: "country-venues-management-admin-venue-venueId",
//             params: { country: country, venueId: id },
//         });
//     }
// };

const handleViewSalesPage = (id: string) => {
    if (!id) return;
    navigateTo({
        name: "country-venues-management-sales-venueId",
        params: { country: country, venueId: id },
    });
}

const handleEditSalesPage = (id: string) => {
    if (!id) return;
    navigateTo({
        name: "country-venues-management-admin-venue-venueId",
        params: { country: country, venueId: id },
    });
}



const handleViewSpace = async (spaceId: string, venueId: string, venueStatus: string, venueFormSteps: number) => {

    if (venueStatus == 'DRAFT' && venueFormSteps < 6 && (isVenueOwner || isVenueAdmin)) {
        navigateTo({
            name: "country-venues-management-venue-venueId-formId",
            params: { country: country, venueId, formId: 'overview' },
        });
        return;
    }

    if (!spaceId || !venueId) return;
    navigateTo({
        name: "country-venues-management-venue-venueId-spaces-spaceId-spaceFormId",
        params: { country: country, venueId, spaceId, spaceFormId: 'details' },
    });
};


// const goToDrafts = () => {
//     navigateTo({
//         name: "country-venues-management-drafts",
//         params: { country },
//     });
// }




// // fetch venue count on mount for admin
// const { data: venueCountData } = isAdmin
//     ? await getAdminVenueCount()
//     : await getVenueCount();
// if (venueCountData) {
//     venueCount.value = (venueCountData.value as any).data;
//     // console.log(venueCount.value);
// }

const imageSrc = (venueId: string) => {
    const venueObj = venues.value.find((obj) => obj._id === venueId);
    if (
        !venueObj ||
        (!venueObj?.space_photos) ||
        (venueObj?.space_photos?.length == 0)
    )
        return null;

    const imageExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".bmp",
        ".svg",
        ".webp",
    ];

    const sortedVenuePhotos = venueObj?.space_photos

    if (!Array.isArray(sortedVenuePhotos)) return;

    const imageObj = sortedVenuePhotos.find((image) => {
        const extension = image.path
            .substring(image.path.lastIndexOf("."))
            .toLowerCase();
        return imageExtensions.includes(extension);
    });

    return imageObj?.path || null;
};

//CHECK IF AT LEAST ONE VENUE IS FOR_APPROVAL/PUBLISHED
const withForApprovalOrPublishVenue = computed(() => {
    return venues.value.some(
        (x) => x.status == "PUBLISHED" || x.status == "FOR_APPROVAL",
    );
});



const loadItems = async () => {
    try {
        teamAdmin
            ? await fetchAdminVenueList(status.value as string, page.value, pageLimit.value, searchText.value)
            : await fetchVenueList(status.value as string, page.value, pageLimit.value, searchText.value);
    } catch (error) {
    }
}

const loadItemsWithoutLoading = async () => {
    try {
        teamAdmin
            ? await fetchAdminVenueList(status.value as string, page.value, pageLimit.value, searchText.value)
            : await fetchVenueList(status.value as string, page.value, pageLimit.value, searchText.value, true);
    } catch (error) {
    }
}

let timeoutId: ReturnType<typeof setTimeout>;
const handleSearch = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        page.value = 1;
        loadItems();;
    }, 300); // Adjust the delay as needed (1000ms = 1s)
}

const handleChangeStatusFilter = async () => {
    page.value = 1;
    loadItems();
}

watch(page, async () => {
    await onUpdatePageHandler(page.value)
});


const handleButtonToggleChange = () => {
    if (viewMode.value == 'table') {
        navigateTo({ name: pageRoute, params: { country } })
    } else {
        navigateTo({ name: pageRoute, params: { country }, query: { view: 'grid' } })
    }
}

const handleDeleteVenue = (venueData: any) => {
    selectedVenue.value = venueData;
    if (venueData?.status == 'DRAFT' || isVenuePartOfVenueWithConsent(venueData?.status)) {
        showDeleteDraftPrompt.value = true;
    } else {
        showDeletePrompt.value = true;
    }
}

const handleDeleteVenueAction = async () => {
    const venueId = selectedVenue.value?._id

    if (!venueId) {
        showDeletePrompt.value = false;
        return
    }

    if (venueId) {
        processing.value = true;
        try {
            const response = await deleteVenue(venueId as string);
            if (response.value) {

                setSnackbar({
                    color: "success",
                    text: "Venue is submitted for deletion approval!",
                    modal: true,
                });
                await loadItems();
            }

        } catch (error: any) {
            if (error?.message == 'VENUE_CAN_NOT_BE_DELETED_WITH_PENDING_ENQUIRIES') {
                setSnackbar({ modal: true, color: 'info', text: 'Venue cannot be deleted with ongoing space inquiries/bookings' })
            } else if (error?.message == "VENUE_CAN_NOT_BE_DELETED_WITH_PENDING_BOOKINGS") {
                setSnackbar({
                    modal: true,
                    color: "info",
                    text: "Venue cannot be deleted with ongoing space bookings",
                });
            } else if (error?.message == "VENUE_CAN_NOT_BE_DELETED_WITH_PENDING_ENQUIRIES_AND_BOOKINGS") {
                setSnackbar({
                    modal: true,
                    color: "info",
                    text: "Venue cannot be deleted with ongoing space bookings or inquiries",
                });
            } else {
                setSnackbar(somethingWentWrongObj);
            }

        } finally {
            showDeletePrompt.value = false;
            processing.value = false;

        }

    }
}


// draft delete or permanent delete are the same
const handleDeleteDraftAction = async () => {
    const venueId = selectedVenue.value?._id

    if (!venueId) {
        showDeletePrompt.value = false;
        return
    }

    if (venueId) {
        processing.value = true;
        try {
            const { error } = await deleteMultipleVenues([venueId]);
            if (error.value) {
                setSnackbar(somethingWentWrongObj);
                return;
            }
            setSnackbar({
                color: "success",
                text: "Venue Deleted Successfully!",
                modal: true,
            });
            await loadItems(); // refresh table
        } catch (error) {
            setSnackbar(somethingWentWrongObj);
        } finally {
            showDeleteDraftPrompt.value = false;
            processing.value = false;
        }

    }
}

// const handlePageChange = async () => {
//     await loadItems(); // refresh table

// }


// page change on table
const onUpdatePageHandler = async (pageNum: number) => {
    page.value = pageNum
    await loadItems();

}

const fetchSpaceListWithoutPagination = async (spaceId: string) => {
    // fetch space list
    try {
        loadingSpaceList.value = true;
        const { data } = await getAllSpacesWithoutPagination(spaceId)
        if (data.value) {
            const res = data.value as any
            selectedVenueSpaceList.value = res?.data || []
        }


    } catch {
        setSnackbar(somethingWentWrongObj)
    } finally {
        loadingSpaceList.value = false;
    }
}

const handleExpanded = async (item: any) => {
    if (expanded.value.includes(item._id)) {
        expanded.value = []
    } else {
        expanded.value = [item._id]
    }
    await fetchSpaceListWithoutPagination(item?._id);
}

// SPACE DELETION FUNCTIONS
const showPermanentlyDeleteSpacePrompt = ref(false);
const selectedSpace = ref();
const showDeleteSpace = ref(false);
const showDeleteSpacePrompt = ref(false);
const spaceDeleteProcessing = ref(false);

const showDeleteSpacePromptHandler = (space: Partial<TVenueSpace>, venue: any) => {
    if (!space || !venue) return;
    selectedSpace.value = space;
    selectedVenue.value = venue;

    if (space && (space?.status == "DRAFT" || space?.status == "INPROGRESS")) {
        showPermanentlyDeleteSpacePrompt.value = true;
    } else {
        showDeleteSpacePrompt.value = true;
    }
};


const handlePermanentlyDeleteSpace = async () => {
    spaceDeleteProcessing.value = true;
    const spaceId = selectedSpace.value?._id
    const spaceStatus = selectedSpace.value?.status
    const venueId = selectedVenue.value?._id

    if (!spaceId || !venueId) return;

    try {
        const { error } = await deleteMultipleSpaces([spaceId]);
        if (error.value) {
            setSnackbar(somethingWentWrongMessage);
        }

    } catch (error) {
        setSnackbar(somethingWentWrongMessage);
    } finally {
        await fetchSpaceListWithoutPagination(venueId);
        if (spaceStatus != 'DRAFT') {
            status.value = null;
            loadItemsWithoutLoading();
        }
        spaceDeleteProcessing.value = false;
        showPermanentlyDeleteSpacePrompt.value = false;
    }
};

const handleDeleteWithSpaceValidation = async () => {
    showPermanentlyDeleteSpacePrompt.value = false;
    spaceDeleteProcessing.value = true;
    const spaceId = selectedSpace.value?._id
    const spaceStatus = selectedSpace.value?.status
    const venueId = selectedVenue.value?._id

    if (!spaceId || !venueId) return;

    try {
        const response = await deleteSpaceWithValidation(
            spaceId as string
        );
        if (response.value) {
            setSnackbar({
                modal: true,
                color: "success",
                text: "Space successfully archived!",
            });
        }
    } catch (error: any) {
        if (error?.message == "SPACE_CAN_NOT_BE_DELETED_WITH_PENDING_ENQUIRIES") {
            setSnackbar({
                modal: true,
                color: "info",
                text: "Space cannot be deleted with ongoing inquiries",
            });
        } else if (error?.message == "SPACE_CANNOT_BE_DELETED_WITH_PENDING_BOOKING") {
            setSnackbar({
                modal: true,
                color: "info",
                text: "Space cannot be deleted with ongoing bookings",
            });
        } else if (error?.message == "SPACE_CAN_NOT_BE_DELETED_WITH_PENDING_ENQUIRIES_AND_BOOKINGS") {
            setSnackbar({
                modal: true,
                color: "info",
                text: "Space cannot be deleted with ongoing bookings or inquiries",
            });
        } else {
            setSnackbar(somethingWentWrongMessage);
        }
    } finally {
        await fetchSpaceListWithoutPagination(venueId);
        if (spaceStatus != 'DRAFT') {
            status.value = null;
            loadItemsWithoutLoading();
        }
        showDeleteSpacePrompt.value = false;
        spaceDeleteProcessing.value = false;
    }
};


const handleBatchUpload = () => {
    fileInput.value?.click();
}

const handleFileChange = async (e: any) => {
    batchUploading.value = true;
    const input = e.target as HTMLInputElement;
    const excelFile = input.files?.[0]
    if (!excelFile) return;
    try {
        const formData = new FormData();
        formData.append("file", excelFile);

        const res = await batchUploadExcelFile(formData);
        if (res) {
            setSnackbar({
                modal: true,
                color: "success",
                text: "Batch upload executed!",
            })
        }

    } catch (error: any) {
        if (error.code == 'DATA_VALIDATION_FAILED') {
            setSnackbar({
                modal: true,
                color: "error",
                text: "Data validation failed.",
            });
            return;
        }
        setSnackbar(somethingWentWrongMessage);

    } finally {
        batchUploading.value = false;
        await loadItems();
    }
}

const showSalesEditActionButton = (status: string) => {
    return isVenuePartOfSalesViewOnly(status) ? false : true;

}


// this button is for roles that can edit
const showEditActionButton = (status: string) => {
    return isVenueMember ? false : true;
}


const verifyingOwner = ref(false);
const ownerStatusObject = ref({
    is_email_verified: null as null | boolean,
    is_stripe_account_verified: null as null | boolean,
    owner_first_name: null as null | string,
    email: null as null | string
})

const ownerTooltipDiv = computed(() => {
    const { is_email_verified, is_stripe_account_verified, owner_first_name, email } = ownerStatusObject.value;

    if (is_email_verified == null || is_stripe_account_verified == null) {
        return `<p>Verification Error</p>`;
    } else {
        return `
      <p>Owner: ${owner_first_name} (${email})</p>
      <p>Email Verification: <span class="${is_email_verified ? 'text-success' : 'text-error'}">${is_email_verified ? 'Completed' : 'Pending'}</span></p>
      <p>Stripe Onboarding: <span class="${is_stripe_account_verified ? 'text-success' : 'text-error'}">${is_stripe_account_verified ? 'Completed' : 'Pending'}</span></p>
    `;
    }
});

const activeOwnerVerificationStatus = async (userId: string, venueOwnerFirstName: string, venueOwnerEmail: string) => {
    if (!userId) return 'No Owner user id'
    ownerStatusObject.value.is_email_verified = null;
    ownerStatusObject.value.is_stripe_account_verified = null;
    verifyingOwner.value = true;
    try {
        const res = await checkOwnerOnboardingStatus(userId)
        if (res) {
            ownerStatusObject.value.is_email_verified = res?.is_email_verified
            ownerStatusObject.value.is_stripe_account_verified = res?.is_stripe_account_verified
            ownerStatusObject.value.owner_first_name = venueOwnerFirstName
            ownerStatusObject.value.email = venueOwnerEmail
        }
    } catch (e) {
        console.error("Error in activeOwnerVerificationStatus:", e);
    } finally {
        verifyingOwner.value = false;
    }
}

onMounted(async () => {
    isUser && navigateTo('/')
    viewMode.value = useRoute().query?.view == 'grid' ? 'grid' : 'table'
    venue.value = new MVenue(); //reset venue data
    useCookie<number>("cookie_page").value = 1; // reset cookie page number to 1
    mode.value = "view";
    // activeStatus.value = status.toString();
});

</script>

<style scoped>
.picture-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    justify-items: center;
    grid-gap: 15px;
    grid-row-gap: 0px;
}

.grid-box {
    width: 100%;
    height: 320px;
}
</style>