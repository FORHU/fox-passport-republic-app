<template>
    <v-row no-gutters class="w-100" style="max-width: 1024px">
      <v-row no-gutters class="w-100">
        <!-- Form Section -->
        <v-col cols="12" md="9">
          <!-- Password Change Form -->
          <div v-if="activeSection === 'password'" class="form">
            <v-form @submit.prevent="showConfirmDialog" ref="form">
              <v-col class="d-flex flex-column">
                <span class="mb-3">Current Password</span>
                <v-text-field v-model="currentPassword" type="password" variant="outlined" required rounded="lg"
                  :rules="[requiredInput]" :error-messages="currentPasswordError" @click="currentPasswordError = ''"></v-text-field>
                <span class="mb-3">New Password</span>
                <v-text-field v-model="newPassword" type="password" variant="outlined" required rounded="lg"
                  :rules="passwordRules"></v-text-field>
                <span class="mb-3">Confirm New Password</span>
                <v-text-field v-model="confirmPassword" type="password" variant="outlined" required rounded="lg"
                  :rules="rePasswordRules"></v-text-field>

                <!-- Action Buttons -->
                <v-row no-gutters class="mt-10 justify-end">
                  <v-btn type="submit" :loading="processing" 
                    :style="{
                    backgroundColor: '#373941',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textTransform: 'uppercase',
                  }" rounded="lg" variant="flat" :disabled="!currentPassword || !newPassword || !confirmPassword">
                    Change Password
                  </v-btn>
                </v-row>
              </v-col>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-row>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Password Change</v-card-title>
        <v-card-text>Are you sure you want to change your password?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="confirmChangePassword">Yes</v-btn>
          <v-btn color="blue darken-1" @click="cancelChangePassword">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>


<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

const { currentUser, updateUserPassword } = useLocalAuth();
const { setSnackbar } = useLocal();
const { minPasswordLength, requiredInput } = useUtils();
const activeSection = ref("password");
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const sectionTitle = computed(() => "Password");
const sectionDescription = computed(() => "Manage your password");
const confirmDialog = ref(false);
const profilePicture = ref(currentUser.value?.profile_picture || "");
const processing = ref(false);
const currentPasswordError = ref('')
const form = ref()
const name = computed(() => {
  if (currentUser.value) {
    return (
      `${currentUser.value.first_name || ""} ${currentUser.value.last_name || ""}`.trim() ||
      "Unknown"
    );
  }
  return "Unknown";
});

const showConfirmDialog = () => {
  if (newPassword.value !== confirmPassword.value) {
    setSnackbar({
      color: "error",
      text: "New passwords do not match.",
      modal: true,
    });
    return;
  }
  confirmDialog.value = true;
};

const confirmChangePassword = async () => {

  if(!newPassword.value || !currentPassword.value) return;
  confirmDialog.value = false;
  processing.value = true;
  try {
    const response = await updateUserPassword({
      new_password: newPassword.value,
      old_password: currentPassword.value
    });

    if (response) {
      setSnackbar({
        color: "success",
        text: "Password changed successfully.",
        modal: true,
      });
      form.value.reset();
    }
  } catch (error: any) {
    if(error?.code == '1003' || error?.message == 'Invalid Password'){
      currentPasswordError.value = 'Incorrect Password'
      processing.value = false;
      return;
    }
    
    setSnackbar({
      color: "error",
      text: "Something went wrong. Please try again.",
      modal: true,
    });
  } finally {

    processing.value = false;
  }
};

const cancelChangePassword = () => {
  confirmDialog.value = false;
};


let passwordRules = [
  (v: string) => !!v || "Password field cannot be empty. Please enter your password",
  (v: string) => minPasswordLength(v),
];

let rePasswordRules = [
  (v: string) => !!v || "Password field cannot be empty. Please enter your password",
  (v: string) => minPasswordLength(v),
  (v: string) =>
    v == newPassword.value ||
    "Passwords do not match. Please enter matching passwords in both fields.",
];
</script>


<style scoped>
.profile-picture {
  border-radius: 50%;
}

.user-info {
  font-size: 1.5rem;
}

.user {
  font-size: 1.25rem;
}

.text-grey-darken-4 {
  color: #333;
}

.v-list-item--active {
  background-color: #f5f5f5 !important;
}

.v-btn {
  text-transform: uppercase;
}

.v-select {
  background: white;
}
</style>
