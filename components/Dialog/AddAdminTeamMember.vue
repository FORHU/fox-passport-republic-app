<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card rounded="lg">
      <v-row no-gutters justify="space-between" align="center" class="mx-2">
        <p class="text-16px font-500 text-center flex-grow-1 pa-5">
          Invite a new Admin Team Member
        </p>
        <v-btn flat icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>

      <v-divider></v-divider>

      <v-card-text>
        <p class="text-16px font-400 mb-3">
          Your new team member will get an email with a link to accept the
          invitation.
        </p>
        <p class="text-16px font-500 mb-2">Email</p>
        <v-form ref="form" v-model="valid">
          <v-text-field rounded="lg" v-model="email" placeholder="Email - Watch out for typos" :rules="[validEmail]"
            prepend-inner-icon="mdi-email-outline"></v-text-field>

          <v-divider></v-divider>



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

      <v-row no-gutters justify="end">
        <v-btn class="ma-3" color="#373941" @click="sendInvitation" rounded="lg" :loading="loading" :disabled="!valid">
          Send Invite
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>

  <!-- Confirmation Dialog -->
  <v-dialog v-model="confirmationDialog" max-width="600">
    <v-card rounded="lg">
      <v-card-text>
        <p class="text-20px font-600 my-3">Email Invitation Sent</p>
        <p class="text-16px">
          Guide your new team member to their inbox to accept the invitation,
          establish their password, and activate their account.
        </p>
      </v-card-text>
      <v-row no-gutters justify="end">
        <v-btn class="ma-3" color="#373941" @click="closeConfirmationDialog" rounded="lg">
          Got It
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { inviteAdminTeamMember, adminRolesOptions, getVenueDetails } = useTeamMembers();
const { setSnackbar } = useLocal();
const { sliceContent, validEmail } = useUtils();
const dialog = defineModel("dialog", { required: false });
const confirmationDialog = ref(false);
// const dialog = defineModel("dialog", { required: false });
// const venues = ref([]);
const email = ref("");
const venueSelection = ref("all");
const selectedVenues = ref([]);
const selectedRole = ref<number | null>(null);
const admin = ref(false);
const venueOwner = ref(false);
const member = ref(false);
const loading = ref(false);
const valid = ref(false);


const closeDialog = () => {
  email.value = "";
  venueSelection.value = "all";
  selectedVenues.value = [];
  selectedRole.value = null;
  dialog.value = false;
};

const closeConfirmationDialog = () => {
  confirmationDialog.value = false;
};

const sendInvitation = async () => {
  if (email.value === "") {
    setSnackbar({
      color: "error",
      text: "Please ensure all required fields are filled out.",
      modal: true,
    });
    return;
  }


  if (selectedRole.value == null) {
    setSnackbar({
      color: "error",
      text: "Please select a role.",
      modal: true,
    });
    return;
  }
  loading.value = true;

  const invitation = {
    email: email.value,
    assigned_roles: selectedRole.value
  };

  try {
    const res = await inviteAdminTeamMember(invitation);
    if (res) {
      closeDialog();
      confirmationDialog.value = true;
    }

  } catch (err: any) {

    if (err.code == 'Existing user') {
      setSnackbar({
        color: "error",
        text: "User with this email already exists or is already a member.",
        modal: true,
      });
    } else {
      setSnackbar({
        color: "error",
        text: "Something went wrong. Please try again later.",
        modal: true,
      });
    }

  } finally {
    loading.value = false;
  }
};

// const fetchVenueData = async () => {
//   try {
//     const { data } = await getVenueDetails();
//     if (data.value && data.value?.data) {
//       venues.value = data.value?.data;
//     }
//   } catch (err) {
//     console.error("Error fetching venue list:", err);
//   }
// };

// onMounted(() => {
//   fetchVenueData();
// });
</script>

<style scoped>
.v-radio :deep(.v-label) {
  opacity: 1 !important;
}
</style>
