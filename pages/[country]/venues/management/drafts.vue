<template>
    <v-row no-gutters class="w-100 pa-5 pa-md-7">

        <v-col cols="12" class="mt-2">
            <ButtonBack label="Back" @click="goBack" />
        </v-col>
        <v-col cols="12"
            class="my-5 my-md-7 w-100 font-600 text-22px h-100 px-3 d-flex align-center justify-space-between"><span>{{
                totalDraftsCount }} Drafts</span>
            <span class="d-flex align-center ga-2">
                <span v-if="!isAdmin && venues.length > 0">
                    <v-btn rounded="lg" variant="outlined" border="secondary md" prepend-icon="mdi-trash-can-outline"
                        text="Delete All" height="40" @click="showDeleteAllPrompt = true"></v-btn>
                </span>
            </span></v-col>
        <v-col cols="12" class="px-3">
            <v-data-table-server v-model:items-per-page="pageLimit" :headers="headers" :items="mappedVenueList"
                :items-length="totalDraftsCount" item-key="name" height="auto" fixed-footer :loading="loading"
                items-per-page-text="Rows per page" @update:options="loadItems"
                @update:page="(page: number) => onUpdatePageHandler(page)"
                style="border: 2px solid #DEDFE3; border-radius: 8px;" last-icon="mdi-chevron-double-right"
                first-icon="mdi-chevron-double-left">
                <template v-slot:headers="{ columns }">
                    <tr class="bg-light_gray text-charcoal font-500 text-16px">
                        <template v-for="column in columns">
                            <td :style="{ minWidth: column.key == 'venue' ? '400px' : '200px', height: '40px' }">
                                <span class="px-2">{{ column.title }}</span>
                            </td>
                        </template>
                    </tr>
                </template>
                <template v-slot:item="{ item }">
                    <tr class="text-16px py-2 cursor-pointer text-charcoal" style="min-height: 80px;"
                        @click="handleViewVenue(item._id as string, item.status as string)">
                        <td>
                            <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
                                <span>
                                    <v-card rounded="lg" flat color="light_gray" height="54" width="54">
                                        <v-row no-gutters class="fill-height w-100" justify="center" align="center">
                                            <v-icon icon="mdi-home" color="charcoal" size="30"></v-icon>
                                        </v-row>
                                    </v-card>
                                </span>
                                <span>{{ sliceContent(item.venue, 30) }}</span>
                            </div>
                        </td>
                        <td>
                            <!-- <div class="d-flex align-center ga-2 py-2 py-md-3">
                                <span>
                                    <v-badge :color="formatColor(item.status as string)" content="6" inline
                                        dot></v-badge>
                                </span>
                                <span class="text-16px">{{ formatStatus(item.status as string) }}</span>
                            </div> -->
                            <v-chip variant="outlined" color="secondary" density="comfortable"
                                :text="formatStatus(item.status as string)" class="bg-light_gray"></v-chip>
                        </td>
                        <td>
                            <v-row no-gutters class="d-flex ga-2 justify-end py-2 py-md-3 text-16px">
                                <v-btn v-if="!isAdmin" border="secondary sm" flat size="small" text="Finish" height="40"
                                    rounded="lg" @click.stop="handleEditVenue(item._id as string)"></v-btn>
                                <v-btn border="secondary sm"
                                    v-if="!isAdmin && item.status != 'DELETED' && item.status != 'FOR_DELETION'" flat
                                    icon="mdi-trash-can-outline" size="small" rounded="lg"
                                    @click.stop="handleDeleteVenue(item)"></v-btn>
                            </v-row>
                        </td>
                    </tr>
                </template>

                <template v-slot:loading>
                    <LoadingChat :lines="5" />
                </template>
                <template v-slot:no-data>
                    <v-empty-state title="No Drafts" height="300"
                        text="You haven't started any creation of venue yet. When you do, they'll appear here."></v-empty-state>
                </template>
            </v-data-table-server>
        </v-col>
    </v-row>
    <DialogPromptNew v-model="showDeletePrompt" @agree="handleDeleteVenueAction"
        :prompt-title="`Are you sure to delete ${sliceContent(selectedVenue?.venue, 50)}?`"
        prompt-text="Once you delete it, you can’t get it back." agree-button-text="Delete it"
        disagree-button-text="Nevermind" :loading="processing" />
    <DialogPromptNew v-model="showDeleteAllPrompt" @agree="handleDeleteAllDraftAction"
        prompt-title="Are you sure to delete all draft?" prompt-text="Once you delete it, you can’t get it back"
        agree-button-text="Delete All" disagree-button-text="Nevermind" :loading="processing" />
</template>

<script setup lang="ts">
import MVenue from '~/models/venue.model';
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

const { country, setSnackbar } = useLocal();
const { viewMode, getAdminVenueList, getVenueList, venue, mode, deleteMultipleVenues, deleteVenue } = useVenue();
const { currentUser } = useLocalAuth();
const { sliceContent, formatStatus, formatColor } = useUtils();

const page = ref(1);
const pageLimit = ref(10);
const totalPages = ref(1);
const totalDraftsCount = ref(0)
const loading = ref(true);
const showDeleteAllPrompt = ref(false);
const showDeletePrompt = ref(false);
const processing = ref(false);
const selectedVenue = ref();

const venues = ref([]);
const pageRoute = "country-venues-management";
const somethingWentWrongObj = { color: "error", text: "Something went wrong. Please try again.", modal: true, }

const mappedVenueList = computed(() => {
    return venues.value.map((x: TVenue) => ({
        venue: x.name,
        status: x.status,
        _id: x?._id
    }))
});

const headers = [
    { title: 'Venue', align: 'start', sortable: false, key: 'venue' },
    { title: 'Status', align: 'end', key: 'status' },
    { title: '', align: 'end', key: 'action' },
]


const loadItems = async () => {
    isAdmin.value
        ? await fetchAdminVenueList('DRAFT', page.value, pageLimit.value)
        : await fetchVenueList('DRAFT', page.value, pageLimit.value);
}

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
        if (!res.data.data) return;

        venues.value = res.data.data;
        totalPages.value = res.data.total_pages;
        totalDraftsCount.value = res.data.total_items;
    } catch (error) {
        console.error("Error fetching venue list:", error);
        venues.value = [];
    } finally {
        loading.value = false;
    }
};

// fetch VenueList on mount
const fetchVenueList = async (
    status: string,
    page: number,
    limit = pageLimit.value,
    venue_name?: string | null
) => {
    loading.value = true;
    try {
        const { data } = await getVenueList(status, page, limit, venue_name);
        if (!data || !data.value) return;
        const res = data.value as any;
        if (!res.data.data) return;

        venues.value = res.data.data;
        totalPages.value = res.data.total_pages;
        totalDraftsCount.value = res.data.total_items;
    } catch (error) {
        console.error("Error fetching venue list:", error);
        venues.value = [];
    } finally {
        loading.value = false;
    }
};


const isAdmin = computed(() => {
    return currentUser.value?.role === "ADMIN";
});


const goBack = () => {
    navigateTo({ name: pageRoute, params: { country } })
}


const onUpdatePageHandler = async (pageNum: number) => {
    page.value = pageNum
    await loadItems();

}

const handleDeleteVenue = (venueData: any) => {
    selectedVenue.value = venueData;
    showDeletePrompt.value = true;
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
            const { error } = await deleteMultipleVenues([venueId]);
            if (error.value) {
                setSnackbar(somethingWentWrongObj);
                return;
            }
            setSnackbar({
                color: "success",
                text: "Draft Deleted Successfully!",
                modal: true,
            });
            await loadItems(); // refresh table
        } catch (error) {
            setSnackbar(somethingWentWrongObj);
        } finally {
            showDeletePrompt.value = false;
            processing.value = false;
        }

    }
}

const handleEditVenue = (id: string) => {
    mode.value = "update";
    navigateTo({
        name: "country-venues-management-venue-venueId",
        params: { country: country, venueId: id },
    });
};

const handleViewVenue = async (id: string, status: string) => {
    if ((status === "INPROGRESS" || status == "DRAFT") && !isAdmin.value) mode.value = "update";
    else mode.value = "view";
    navigateTo({
        name: "country-venues-management-venue-venueId",
        params: { country: country, venueId: id },
    });
};

const handleDeleteAllDraftAction = async () => {

    if (venues.value.length == 0) return;
    const idsArray = venues.value.map((x: TVenue) => {
        if (x.status == 'DRAFT') {
            return x?._id;
        }
    })

    if (idsArray.length == 0) return;
    processing.value = true;
    try {
        const { error } = await deleteMultipleVenues(idsArray as string[])

        if (error.value) {
            setSnackbar(somethingWentWrongObj);
            return;
        }
        setSnackbar({
            color: "success",
            text: "All Drafts Deleted Successfully!",
            modal: true,
        });
        await loadItems(); // refresh table
    } catch (error) {
        setSnackbar(somethingWentWrongObj);

    } finally {
        showDeleteAllPrompt.value = false;
        processing.value = false;
    }
}


onMounted(async () => {
    viewMode.value = useRoute().query?.view == 'grid' ? 'grid' : 'table'
    await loadItems();
    venue.value = new MVenue(); //reset venue data
    useCookie<number>("cookie_page").value = 1; // reset cookie page number to 1
    mode.value = "view";
    loading.value = false;
});

</script>

<style scoped></style>