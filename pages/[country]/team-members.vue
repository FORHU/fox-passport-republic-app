<template>
  <v-row no-gutters class="mx-5">
    <v-row no-gutters justify="end"
      class=" mt-10 mb-5 w-100 font-600 text-22px h-100 px-3 d-flex align-center justify-space-between">
      <span>{{
        totalTeamMembers }} {{ totalTeamMembers > 1 ? 'members' : 'member' }}</span>
    </v-row>

    <v-col cols="12" no-gutters class="my-5 w-100 d-flex ga-3 align-center text-16px">
      <v-col class="d-flex align-center ga-2 w-100">
        <span style="width: 60%;">
          <v-text-field v-model="searchText" variant="outlined" color="tertiary"
            placeholder="Search member name or contact" prepend-inner-icon="mdi-magnify" rounded="lg" hide-details
            height="40" @update:model-value="handleSearch" clearable></v-text-field>
        </span>
        <span style="width: 40%;">
          <v-select v-model="selectedRoleFilter" rounded="lg" :items="filterRolesOptions" item-value="value"
            item-title="label" placeholder="Role" hide-details height="40"
            @update:model-value="handleChangeStatusFilter"></v-select>
        </span>
        <span>
          <v-btn v-if="isVenueOwner || isVenueAdmin || isAdmin" class="hidden-md-and-up" rounded="lg" variant="flat"
            color="secondary" icon="mdi-plus" height="40" @click="handleInviteButtonClick" :disabled="venueOwnerUnverified"></v-btn>
        </span>
      </v-col>
      <v-col class="d-none d-md-flex align-center justify-end ga-2 w-100">
        <span v-if="isVenueOwner || isVenueAdmin || isAdmin">
          <v-btn color="secondary" @click="handleInviteButtonClick" prepend-icon="mdi-plus" rounded="lg" class="" :disabled="venueOwnerUnverified">Invite
            Team
            Member</v-btn>
        </span>
      </v-col>
    </v-col>

    <v-row no-gutters class="w-100">
      <v-data-table-server v-model:items-per-page="pageLimit" :headers="headers" :items="mappedVenueList"
        no-data-text="No team members data available" :items-length="totalTeamMembers" item-key="name" height="auto"
        fixed-footer :loading="loading" items-per-page-text="Rows per page" @update:options="loadItems"
        :items-per-page-options="[{ title: '10', value: 10 }, { title: '20', value: 20 }]"
        @update:page="(page: number) => onUpdatePageHandler(page)"
        style="border: 2px solid #DEDFE3; border-radius: 8px;" last-icon="mdi-chevron-double-right"
        first-icon="mdi-chevron-double-left">
        <template v-slot:headers="{ columns }">
          <tr class="bg-light_gray text-charcoal font-500 text-16px">
            <template v-for="column in columns">
              <td :style="{ minWidth: column.key == 'name' ? '400px' : '200px', height: '40px' }">
                <span class="px-2">{{ column.title }}</span>
              </td>
            </template>
          </tr>
        </template>
        <template v-slot:item="{ item }">
          <tr class="text-16px py-2 cursor-pointer text-secondary" style="min-height: 80px;"
            @click="handleViewVenue(item._id as string, item.status as string)">
            <td class="flex">
              <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
                <span>
                  <ProfileAvatar :first_name="item?.name" :img-src="item?.profile_picture" />
                </span>
                <span>{{ item?.name }}</span>
              </div>
            </td>
            <td>
              <div class="d-flex flex-column  py-2 py-md-3">
                <span v-if="item?.contact">{{ item?.contact }}
                </span>
                <span>{{ item?.email }}
                </span>

              </div>
            </td>

            <td v-if="!teamAdmin">
              <div v-if="!item?.all_venues" class="d-flex align-start flex-column py-2 py-md-3 pl-3">
                <template v-for="x in item?.venue_assigned.slice(0, 4)" :key="x?._id">
                  <span>{{ sliceContent(x?.name, 25) }}
                  </span>

                </template>
                <span v-if="item?.venue_assigned.length > 4">& more ...</span>
              </div>
              <div v-else class="d-flex align-start flex-column py-2 py-md-3 pl-3">
                <span>All Venues</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-center flex-column py-2 py-md-3">
                <template v-for="x in item.role" :key="x">
                  <span class="w-100">{{ roleName(x) }}</span>
                </template>
              </div>
            </td>

            <td>
              <v-row v-if="isSuspendedHigh == false && item?.invited_user?._id !== currentUser._id" no-gutters
                class="d-flex ga-2 justify-end py-2 py-md-3">
                <v-btn v-if="(isVenueOwner || isVenueAdmin || isAdmin) && !item?.is_owner" border="secondary sm" flat
                  icon="mdi-square-edit-outline" size="small" rounded="lg"
                  @click.stop="handleUpdateMember(item?.user)"></v-btn>
                <v-btn border="secondary sm" v-if="(isVenueOwner || isVenueAdmin || isAdmin) && !item?.is_owner" flat
                  icon="mdi-trash-can-outline" size="small" rounded="lg" @click.stop="handleRemoveMember(item)"></v-btn>
                <v-btn v-if="(isVenueOwner || isVenueAdmin|| isAdmin) && !item?.is_owner" border="secondary sm" flat
                  size="medium" rounded="lg" @click.stop="suspendMember(item)">
                  <v-icon size="20" :color="item.suspension_time && item.suspension_time!='REMOVE_SUSPENSION' ? 'red' : 'black'"
                    class="mx-3">mdi-account-cancel-outline</v-icon>
                </v-btn>
              </v-row>
            </td>
          </tr>
        </template>

        <template v-slot:loading>
          <v-row class="w-100 py-2" no-gutters>
            <v-col cols="12">
              <LoadingChat :lines="5" />
            </v-col>
          </v-row>
        </template>
        <!-- <template v-slot:no-data>
          <v-row no-gutters class="w-100" justify="center">
            <v-empty-state v-if="isZeroSearch" icon="mdi-magnify" height="300"
              text="Try adjusting your search terms or filters. Sometimes less specific terms or broader queries can help you find what you're looking for."
              title="We couldn't find a match."></v-empty-state>
            <v-empty-state v-else title="No Team Members Yet" height="300"
              text="You haven't finished any venues yet. When you do, they'll appear here."></v-empty-state>
          </v-row>
        </template> -->
      </v-data-table-server>
    </v-row>

    <DialogAddTeamMember v-model:venues="venues" v-model:dialog="dialog" />
    <DialogEditTeamMember v-model:venues="venues" v-model:dialog="editDialog" v-model:details="selectedMemberForUpdate"
      @refresh-data="loadItems" />
    <DialogSuspendMember @suspending="suspending" :suspendData="suspendData" v-model="openSuspendDialog" />
  </v-row>
  <DialogPromptNew v-model="showRemoveMemberPrompt" @agree="handleRemoveMemberAction"
    :prompt-title="`Are you sure to delete ${sliceContent(selectedMember?.name, 50)}?`"
    prompt-text="Once you delete it, you can't get it back" disagree-button-text="Nevermind"
    agree-button-text="Delete it" :loading="processingRemoveMember" />

  <!-- ADMIN -->
  <DialogAddAdminTeamMember v-model:dialog="adminDialog" />
  <DialogEditAdminTeamMember v-model:dialog="adminEditDialog" v-model:details="selectedMemberForUpdate"
    @refresh-data="loadItems" :adminResponse="adminResponse"/>
  <DialogSuspendAdminTeamMember @suspending="suspending" :suspendData="suspendData" v-model="adminSuspendDialog" />
  <!-- ADMIN -->
  <DialogCompleteAccountDetails />
</template>

<script setup lang="ts">
// const { getVenueList } = useVenue();
const { sliceContent } = useUtils();
const { getTeamMembers, getAdminTeamMembers, selectedRoleFilter, searchText, deleteTeamMember, rolesOptions, adminRolesOptions, getVenueDetails, deleteAdminTeamMember, getVenueDetailsForAdmin } = useTeamMembers();
const { setSnackbar } = useLocal();
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isAdminMember, isAdminSales } = useAccess();
const { currentUser, loggedIn } = useLocalAuth();


definePageMeta({
  layout: 'team-members',
  middleware: ['auth', 'owner-admin-access']
})

const dialog = ref(false);
const adminDialog = ref(false);
const editDialog = ref(false);
const adminEditDialog = ref(false);
const adminSuspendDialog=ref(false)
const venues = ref<Partial<TVenue>[] | []>([]);

const somethingWentWrongMessage = {
  text: 'Something went wrong. Please try again later.',
  modal: true,
  color: 'error'

}
const pageLimit = ref(10);
const page = ref(1);
const loading = ref(false);
const totalTeamMembers = ref(0);
const members = ref([]);
const showRemoveMemberPrompt = ref(false);
const selectedMember = ref<TTeamMember | null>(null)
const selectedMemberForUpdate = ref<TTeamMember | null>(null);
const processingRemoveMember = ref(false);
const openSuspendDialog = ref(false)
const suspendData = ref()
const adminResponse = ref()

const headers = computed(() => {
  const arr = [
    { title: 'Name', align: 'start', sortable: false, key: 'name' },
    { title: 'Contact', align: 'end', key: 'contact' },
    { title: 'Venue Assigned', align: 'end', key: 'venue_assigned' },
    { title: 'Role', align: 'end', key: 'role' },
    { title: '', align: 'end', key: 'action' },
  ]

  if (teamAdmin.value) {
    return arr.filter(x => x.key !== 'venue_assigned')
  } else {
    return arr

  }
})


const mappedVenueList = computed(() => {
  return members.value.sort((a: any, b: any) => b.updatedAt - a.updatedAt).map((x: any) => ({
    name: (x?.invited_user?.first_name || '') + ' ' + (x?.invited_user?.last_name || ''),
    contact: x?.invited_user?.phone_number || '',
    email: x?.invited_user?.email || '',
    venue_assigned: x?.venues || [],
    role: x?.assigned_roles || [],
    _id: x?._id, // org member id
    profile_picture: x?.invited_user?.profile_picture,
    all_venues: x?.all_venues,
    user: x,
    is_owner: x?.is_owner || false,   // check if the user is the original owner.
    suspension_time: x?.suspension_time, // check if the user is suspended.
    invited_user: x?.invited_user
  }))
});

const teamAdmin = computed(() => {
  return isAdmin || isAdminMember || isAdminSales
})


const fetchVenueData = async () => {
  try {
    const response = await getVenueDetails();
    adminResponse.value = teamAdmin ? await getVenueDetailsForAdmin() : []
    const dataValue = response.data?.value as any;
    // console.log("Data:", dataValue);
    const fetchedVenues = dataValue?.data || [];
    venues.value = fetchedVenues;
  } catch (err) {
    console.error("Error fetching venue list:", err);
  }
};

const loadItems = async () => {
  loading.value = true;

  const query: GetTeamMembersQuery = {
    page: page.value,
    limit: pageLimit.value,
    status: 'ACCEPTED'
  }

  if (selectedRoleFilter.value !== null) {
    query.assigned_roles = selectedRoleFilter.value;
  }

  if (searchText.value) {
    query.search = searchText.value;
  }


  try {
    const res = teamAdmin.value ? await getAdminTeamMembers(query) : await getTeamMembers(query);
    if (res) {
      totalTeamMembers.value = res?.total_items || 0;
      members.value = res?.data;
    }

  } catch (error) {
    loading.value = false;
    setSnackbar(somethingWentWrongMessage);
    console.log(error);

  } finally {
    loading.value = false;
  }
}

// page change on table
const onUpdatePageHandler = async (pageNum: number) => {
  page.value = pageNum
  await loadItems();

}

const handleChangeStatusFilter = async () => {
  page.value = 1;
  await loadItems();
}

let timeoutId: ReturnType<typeof setTimeout>;
const handleSearch = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    page.value = 1;
    loadItems();;
  }, 300); // Adjust the delay as needed (1000ms = 1s)
}

const filterRolesOptions = computed(() => {
  if (teamAdmin.value) {
    return [{ label: 'All Roles', value: null }, ...adminRolesOptions]
  }
  return [{ label: 'All Roles', value: null }, ...rolesOptions]
})

// role names displayed
const roleName = (role: string) => {
  const obj = teamAdmin.value ? adminRolesOptions.find((x: any) => x.value == role) : rolesOptions.find((x: any) => x.value == role);
  if (obj) {
    return obj.label || '-';
  } else return '-';

}

const handleRemoveMember = (member: TTeamMember) => {
  selectedMember.value = member;
  showRemoveMemberPrompt.value = true;
}

const handleRemoveMemberAction = async () => {
  const memberId = selectedMember.value?._id
  if (!memberId) {
    showRemoveMemberPrompt.value = false;
    return;
  }

  try {
    processingRemoveMember.value = true;

    const res = teamAdmin.value ? await deleteAdminTeamMember(memberId) : await deleteTeamMember(memberId);
    if (res) {
      setSnackbar({
        color: "success",
        text: "Team member has been deleted!",
        modal: true,
      });
    }
  } catch (error) {
    console.log('removing-member-error', error);
    setSnackbar(somethingWentWrongMessage);

  } finally {
    processingRemoveMember.value = false;
    showRemoveMemberPrompt.value = false;
    loadItems()
  }
}

const handleUpdateMember = (orgMember: any) => {
  if (!orgMember) return;
  selectedMemberForUpdate.value = orgMember;
  if (teamAdmin.value) {
    adminEditDialog.value = true
  } else {
    editDialog.value = true
  }
}


const handleInviteButtonClick = () => {
  if (isAdmin) {
    adminDialog.value = true;
  } else {
    dialog.value = true;
  }
}

onMounted(() => {
  fetchVenueData();
});


function suspendMember(val) {
  if (teamAdmin.value) {
    adminSuspendDialog.value = true
    suspendData.value = val
    return
  }
  openSuspendDialog.value = true
  suspendData.value = val
}
function suspending() {
  fetchVenueData()
  loadItems()
}

const isSuspendedHigh = computed(() => {
  return members.value.some(
    (el: TTeamMember) => {
      return el?.invited_user._id === currentUser.value?._id && el?.suspension_time
    }
  );
});

const isAccountCompleted = computed(() => {
  return currentUser.value.stripe_account == "COMPLETED";
});

const isEmailVerified = computed(() => {
  return currentUser.value.status == 'ACTIVE';
});

const venueOwnerUnverified = computed(() => {
  if (loggedIn.value && (!isAccountCompleted.value || !isEmailVerified.value) && isVenueOwner) {
   return true;
  } else {
    return false;
  }
  
})

</script>

<style scoped>
.v-checkbox :deep(.v-label) {
  opacity: 1 !important;
}

.v-radio :deep(.v-label) {
  opacity: 1 !important;
}
</style>
