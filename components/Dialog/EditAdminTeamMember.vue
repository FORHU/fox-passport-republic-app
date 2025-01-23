<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card rounded="lg">
      <v-row no-gutters justify="space-between" align="center" class="mx-2">
        <p class="text-16px font-500 text-center flex-grow-1 pa-5">
          Admin Team Member Permission
        </p>
        <v-btn flat icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>

      <v-divider></v-divider>

      <v-card-text>
        <v-row no-gutters class="mb-4" justify="center" align="center">
          <v-col
            cols="2"
            justify="center"
            class="d-flex align-center justify-center"
          >
            <ProfileAvatar
              size="60"
              :first_name="name || ''"
              :img-src="profilePic || ''"
              class="mr-4"
            />
          </v-col>

          <v-col cols="10">
            <p>{{ name }}</p>
            <p>{{ email }}</p>
            <p>{{ phoneNum }}</p>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-form ref="form">
          <!-- Assigned Venues -->
          <v-col v-if="isSalesAdmin">
            <p class="text-16px font-500 mt-3">Assigned Venues</p>

            <p v-if="filteredVenues.length === 0">
              No venues requiring consent available.
            </p>

            <v-radio-group
              hide-details
              v-model="venueSelection"
              v-if="filteredVenues.length > 0"
            >
              <v-radio label="Select venues" value="select"></v-radio>
            </v-radio-group>

            <v-checkbox-group
              v-if="venueSelection === 'select' && filteredVenues.length > 0"
              multiple
            >
              <v-row class="ml-0" no-gutters>
                <v-col
                  v-for="(venue, index) in filteredVenues"
                  :key="venue._id"
                  :cols="12"
                  :sm="6"
                  :md="4"
                  class="ml-7"
                >
                  <v-checkbox
                    v-model="selectedVenues"
                    :label="sliceContent(venue.name, 25)"
                    :value="venue._id"
                    hide-details
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-checkbox-group>
          </v-col>

          <!-- Assigned Roles -->
          <p class="text-16px font-500 my-3">Assigned Role</p>
          <v-radio-group v-model="selectedRole" hide-details>
            <template v-for="x in adminRolesOptions" :key="x.value">
              <v-radio :label="x.label" :value="x.value">
                <template v-slot:label>
                  <v-col>
                    <p class="text-black">{{ x.label }}</p>
                    <p class="text-14px font-400 text-charcoal">
                      {{ x.description }}
                    </p>
                  </v-col>
                </template>
              </v-radio>
            </template>
          </v-radio-group>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-row no-gutters justify="space-between" align="center">
        <span>
          <v-btn
            variant="text"
            v-if="!details?.is_owner && isAdmin"
            class="ma-3 text-decoration-underline"
            @click="showRemoveMemberPrompt = true"
          >
            Delete Member
          </v-btn>
        </span>
        <v-btn
          class="ma-3"
          color="#373941"
          @click="saveChanges"
          rounded="lg"
          :loading="loading"
        >
          Save Changes
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>

  <DialogPromptNew
    v-model="showRemoveMemberPrompt"
    @agree="deleteMember"
    :prompt-title="`Are you sure to delete ${sliceContent(name || '', 50)}?`"
    prompt-text="Once you delete it, you can't get it back"
    disagree-button-text="Nevermind"
    agree-button-text="Delete it"
    :loading="processingRemoveMember"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  adminResponse: Array<any>;
}>();

const {
  adminRolesOptions,
  updateAdminTeamMember,
  deleteTeamMember,
  deleteAdminTeamMember,
  getVenueDetails,
} = useTeamMembers();
const { setSnackbar } = useLocal();
const { sliceContent } = useUtils();
const { isAdmin } = useAccess();

const dialog = defineModel("dialog", { required: false });
const details = defineModel<TTeamMember | null>("details", { required: true });
const emit = defineEmits(["refresh-data"]);

const showRemoveMemberPrompt = ref(false);
const processingRemoveMember = ref(false);
const loading = ref(false);
const venueSelection = ref();
const selectedVenues = ref<string[]>([]);
const selectedRole = ref<number | null>(null);
const profilePic = ref<string | null>(null);
const name = ref<string | null>(null);
const email = ref<string | null>(null);
const phoneNum = ref<string | null>(null);

const saveChanges = async () => {
  loading.value = true;

  try {
    const memberId = details.value?._id;
    const assigned_roles = selectedRole.value;
    const venues = selectedVenues.value;

    if (!memberId || !assigned_roles) return;

    const res = await updateAdminTeamMember({
      memberId,
      assigned_roles,
      venues,
    });

    if (res) {
      setSnackbar({
        color: "success",
        text: "Information has been updated!",
        modal: true,
      });
      dialog.value = false;
      emit("refresh-data");
    }
  } catch (error) {
    console.error("Error updating team member:", error);
    setSnackbar({
      color: "error",
      text: "An error occurred while updating information.",
      modal: true,
    });
  } finally {
    loading.value = false;
  }
};

const deleteMember = async () => {
  processingRemoveMember.value = true;
  try {
    const memberId = details.value?._id;
    await deleteAdminTeamMember(memberId as string);
    setSnackbar({
      color: "success",
      text: "Team member has been deleted!",
      modal: true,
    });
    dialog.value = false;
    showRemoveMemberPrompt.value = false;
  } catch (error) {
    console.error("Error deleting team member:", error);
    setSnackbar({
      color: "error",
      text: "An error occurred while deleting the team member.",
      modal: true,
    });
  } finally {
    processingRemoveMember.value = false;
  }
};

watch(
  details,
  (newDetails) => {
    if (newDetails) {
      const { assigned_roles, invited_user } = newDetails;
      selectedRole.value = assigned_roles?.[0] || null;
      profilePic.value = invited_user?.profile_picture || "";
      name.value =
        invited_user?.first_name + " " + invited_user?.last_name || "";
      email.value = invited_user?.email || "";
      phoneNum.value = invited_user?.phone_number || "";
    }
  },
  { immediate: true }
);

const filteredVenues = computed(() => {
  return props.adminResponse.data.data;
});

const isSalesAdmin = computed(() => {
  return selectedRole.value === 2;
});
</script>

<style scoped>
.v-radio :deep(.v-label) {
  opacity: 1 !important;
}
</style>
