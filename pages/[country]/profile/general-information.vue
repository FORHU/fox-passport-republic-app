<template>
  <!-- Wrapper with max-width -->
  <v-row no-gutters class="w-100" style="max-width: 1024px">
    <!-- Account Information -->
    <v-row no-gutters class="w-100">
      <!-- Sub-navigation for Mobile -->
      <!-- <v-col cols="12" class="d-flex d-md-none  mb-3">
          <v-select
            v-model="activeSection"
            :items="navItems"
            item-title="title"
            item-value="value"
            dense
            outlined
            class="w-100 mx-3"
            rounded="lg"
          />
        </v-col> -->

      <!-- General Info Section -->
      <v-col cols="12">
        <div class="form">
          <v-row class="align-center py-3">
            <v-col class="d-flex align-items-center" cols="auto">
              <div class="d-flex align-items-center">
                <ProfileAvatar :img-src="profilePicture" :first_name="currentUser?.first_name"
                  :last_name="currentUser?.last_name" size="60" />
                <div class="ml-3">
                  <input type="file" accept="image/*" ref="fileInput" style="display: none"
                    @change="handleFileChange" />
                  <v-list-item class="hidden-xs d-flex align-items-center mt-2" @click="selectFile" ripple
                    variant="tonal" rounded="lg" :disabled="!editMode || loading">
                    <v-list-item-content class="grey--text text--darken-2 font-weight-bold">
                      Upload Profile
                      <v-progress-circular v-if="loading" indeterminate color="primary" :size="24"
                        class="ml-2"></v-progress-circular>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-form v-model="formValid" @submit.prevent>
            <v-container>
              <v-row>
                <v-col cols="12" md="6" class="gap-10">
                  <v-row>
                    <v-col>
                      <div class="d-flex flex-column">
                        <span class="mb-2">First Name</span>
                        <v-text-field v-model="firstName" required variant="outlined" :disabled="!editMode"
                          class="rounded-lg" outlined rounded="lg" :rules="[requiredInput]"></v-text-field>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" md="6" class="gap-10">
                  <div class="d-flex flex-column">
                    <span class="mb-2">Last Name</span>
                    <v-text-field v-model="lastName" required variant="outlined" :disabled="!editMode" rounded="lg"
                      :rules="[requiredInput]"></v-text-field>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="d-flex flex-column">
                    <span class="mb-2">Email</span>
                    <v-text-field v-model="userEmail" required variant="outlined" :disabled="true" rounded="lg"
                      :rules="[validEmail]" :error-messages="emailCustomError" readonly
                      @click="emailCustomError = ''"></v-text-field>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="d-flex flex-column">
                    <span class="mb-2">Phone Number</span>
                    <v-text-field v-model="phoneNumber" required variant="outlined" :disabled="!editMode" rounded="lg"
                      :rules="[requiredInput, requiredNumber]"></v-text-field>
                  </div>
                </v-col>
              </v-row>
              <v-row no-gutters class="mt-10 justify-end">
                <v-btn :class="{ 'bg-grey-darken-3': editMode }" variant="outlined" @click="toggleEditMode"
                  style="text-transform: uppercase" rounded="lg">
                  {{ editMode ? "CANCEL" : "Edit Profile" }}
                </v-btn>

                <!-- Save Changes Button -->
                <v-btn v-if="editMode" class="ml-2" :style="{
                  backgroundColor: '#373941',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textTransform: 'uppercase',
                }" variant="flat" @click="showSaveChangesModal" rounded="lg" :loading="saveloading"
                  :disabled="!formValid" :text="saveloading ? 'Saving..' : 'Save Changes'">
                </v-btn>
              </v-row>
            </v-container>
          </v-form>
        </div>

      </v-col>
    </v-row>
  </v-row>

  <!-- Save Changes Modal -->
  <v-dialog v-model="saveChangesModal" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Save Changes?</v-card-title>
      <v-card-text>Are you sure you want to save changes?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="saveChanges">Save</v-btn>
        <v-btn color="blue darken-1" @click="cancelSaveChanges">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
        <v-btn color="blue darken-1" @click="confirmDeleteAccount">Yes, Delete</v-btn>
        <v-btn color="blue darken-1" @click="cancelDeleteAccount">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

const {
  currentUser,
  editUser,
  updateUserPassword,
  getCurrentUser,
  deleteAccount,
  logout,
} = useLocalAuth();
const { setSnackbar } = useLocal();
const { uploadFile, getVenueCount } = useVenue();
const { validEmail, requiredInput, requiredNumber } = useUtils();
const activeSection = ref("general");
const saveChangesModal = ref(false);
const showDeleteConfirmationDialog = ref(false);
const editMode = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const firstName = ref(currentUser.value?.first_name || "");
const lastName = ref(currentUser.value?.last_name || "");
const userEmail = ref(currentUser.value?.email || "");
const phoneNumber = ref(currentUser.value?.phone_number || "");
const birthdate = ref(currentUser.value?.date_of_birth || "");
const profilePicture = ref(currentUser.value?.profile_picture || "");
const profilePictureId = ref(null);
const totalCount = ref(0);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const saveloading = ref(false);
const isUser = computed(() => currentUser.value?.role === "USER");
const isAdmin = computed(() => currentUser.value?.role === "ADMIN");
const processing = ref(false);
const manage_loading = ref(false);
const formValid = ref(false);
const emailCustomError = ref('');



const sectionTitle = computed(() => {
  switch (activeSection.value) {
    case "general":
      return "General Information";
    case "password":
      return "Password";
    case "delete":
      return "Delete Account";
    default:
    case "billing":
      return "Billing Details";
  }
});

const sectionDescription = computed(() => {
  switch (activeSection.value) {
    case "general":
      return "Update your general account information";
    case "password":
      return "Manage your password";
    case "delete":
      return "Delete your Venue4use account";
    case "billing":
      return "Manage your billing details";
    default:
      return "";
  }
});



const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

const selectFile = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = (target.files && target.files[0]) || null;
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      setSnackbar({
        color: "error",
        text: "The file size exceeds the 2MB limit. Please choose a smaller file.",
        modal: true,
      });
      return;
    }
    uploadProfilePicture(file);
  }
};


const uploadProfilePicture = async (file: File) => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await uploadFile(formData);

    if (response) {
      const res = response.data as any;
      profilePicture.value = res.value.data.path;
      profilePictureId.value = res.value.data._id;
    }
  } catch (error) {
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  } finally {
    loading.value = false;
  }
};

const showSaveChangesModal = () => {
  saveChangesModal.value = true;
};

const saveChanges = async () => {
  if (saveChangesModal.value) {
    saveloading.value = true;

    try {
      let updatedUserData: any = {
        first_name: firstName.value,
        last_name: lastName.value,
        // email: userEmail.value,
        phone_number: phoneNumber.value,
        // date_of_birth: birthdate.value,
        // profile_picture: profilePictureId.value,
      };

      if (profilePictureId.value) {
        updatedUserData.profile_picture = profilePictureId.value;
      }

      // do not add to payload if email has not been updated
      const existingEmail = currentUser.value?.email
      if (existingEmail !== userEmail.value) {
        // updatedUserData.email = userEmail.value
      }


      const { _id } = currentUser.value;
      const response = await editUser({
        _id,
        ...updatedUserData,
      });

      if (response) {
        currentUser.value.first_name = firstName.value;
        currentUser.value.last_name = lastName.value;
        currentUser.value.email = userEmail.value;
        currentUser.value.phone_number = phoneNumber.value;
        currentUser.value.date_of_birth = birthdate.value;
        currentUser.value.profile_picture = profilePicture.value;

        setSnackbar({
          color: "success",
          text: "Your information has been updated!",
          modal: true,
        });

        saveChangesModal.value = false;
        toggleEditMode();
      }

    } catch (error: any) {

      if (error.code == "USER_UPDATE_FAILED" && error.description == 'Email already existing') {
        emailCustomError.value = 'Email is already in use.'
        return;
      } else if (error.code == 'VALIDATION_ERROR_MISSING_FIELDS' && error.description == 'Email is not valid') {
        emailCustomError.value = 'Invalid email address.'
      } else {
        setSnackbar({
          color: "error",
          text: "Something went wrong. Please try again.",
          modal: true,
        });
      }
    } finally {
      saveloading.value = false;
      saveChangesModal.value = false;
      return;
    }
  }
};



const cancelSaveChanges = () => {
  saveChangesModal.value = false;
};

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

const fetchVenueCount = async () => {
  try {
    const { data: response } = await getVenueCount();

    const res = response.value as any;
    totalCount.value = res.data.TOTAL.count;
    // console.log("Data:", totalCount.value);
  } catch (error) {
    console.error("Error fetching venue count:", error);
  }
};

onMounted(() => {
  fetchVenueCount();
});
</script>

<style scoped>
.wrapper {
  padding: 2rem;
  max-height: calc(100vh - 200px);
}

.v-container {
  max-width: 1200px;
  margin: 0 auto;
}

.account-information {
  align-items: center;
}

.account-details {
  display: flex;
  flex-direction: column;
}

.v-card-subtitle {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}
</style>
