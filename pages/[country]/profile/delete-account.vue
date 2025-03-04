<template>
    <!-- Wrapper with max-width -->
    <v-row no-gutters class="w-100" style="max-width: 1024px">

      <v-row no-gutters class="w-100">
        <v-col cols="12" md="9">
          <!-- Delete Account Section -->
          <div class="form pa-4">
            <h3 class="mb-4">Delete Account</h3>
            <v-card
              class="pa-4"
              variant="outlined"
              rounded="lg"
              color="grey-lighten-1"
            >
              <v-card-text class="text-base_color">
                <p class="font-weight-bold">
                  Would you like to delete your Venue4use account:
                  <span class="text-indigo-accent-4">{{ name }}</span
                  >?
                </p>
                <p v-if="!isUser">
                  This account contains
                  <span class="text-decoration-underline font-500">
                    {{
                      totalCount > 0
                        ? totalCount + " listings and drafts"
                        : "no listings"
                    }} </span
                  >. Deleting your account will remove all of your content and
                  data associated with your Venue4use profile.
                </p>
                <p>
                  <br />
                  Be advised, account deletion is final. There will be no way to
                  restore your account.
                </p>
              </v-card-text>
            </v-card>
            <v-row class="mt-4" justify="end">
              <v-col class="d-flex" cols="auto">
                <v-btn
                  variant="outlined"
                  color="grey-lighten-1"
                  @click="showDeleteConfirmationDialog = true"
                  rounded="lg"
                >
                  <span class="text-base_color">Delete Account</span>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-row>

    <!-- Delete Account Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirmationDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Account Deletion</v-card-title>
        <v-card-text>
          <p>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="confirmDeleteAccount"
            >Yes, Delete</v-btn
          >
          <v-btn color="blue darken-1" @click="cancelDeleteAccount"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

const { currentUser, deleteAccount, logout } = useLocalAuth();
const { getVenueCount } = useVenue();
const { setSnackbar } = useLocal();
const showDeleteConfirmationDialog = ref(false);
const profilePicture = ref(currentUser.value?.profile_picture || "");
const totalCount = ref(0);
const isUser = computed(() => currentUser.value?.role === "USER");
const sectionTitle = computed(() => "Delete Account");
const sectionDescription = computed(() => "Delete your Venue4use account");

const name = computed(() => {
  if (currentUser.value) {
    return (
      `${currentUser.value.first_name || ""} ${currentUser.value.last_name || ""}`.trim() ||
      "Unknown"
    );
  }
  return "Unknown";
});

const cancelDeleteAccount = () => {
  showDeleteConfirmationDialog.value = false;
};

const confirmDeleteAccount = async () => {
  try {
    await deleteAccount();
    await logout();
    setSnackbar({
      color: "success",
      text: "Account Successfully Deleted!",
      modal: true,
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    setSnackbar({
      color: "error",
      text: "Failed to delete account. Please try again.",
      modal: true,
    });
  } finally {
    showDeleteConfirmationDialog.value = false;
  }
};

onMounted(async () => {
  try {
    const { data: response } = await getVenueCount();
    const res = response.value as any;
    totalCount.value = res.data.TOTAL.count;
  } catch (error) {
    console.error("Error fetching venue count:", error);
  }
});
</script>

<style scoped>
.v-btn {
  text-transform: uppercase;
}
</style>
