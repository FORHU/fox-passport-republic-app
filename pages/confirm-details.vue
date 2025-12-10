<template>
  <v-container class="fill-height py-10" fluid style="background-color: #f5f5f5;">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        
        <div class="text-center mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">Confirm Your Inquiry</h2>
          <p class="text-body-1 text-medium-emphasis">Please complete your details to proceed.</p>
        </div>

        <v-card elevation="2" class="rounded-lg">
          <v-sheet color="grey-lighten-4" class="pa-5 border-b">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 text-uppercase text-grey-darken-1">
              Your Selection
            </h3>
            <v-row dense>
              <v-col cols="12" sm="4">
                <div class="text-caption text-medium-emphasis">Location</div>
                <div class="font-weight-medium">{{ route.query.location || 'Not selected' }}</div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-medium-emphasis">Date</div>
                <div class="font-weight-medium">{{ route.query.date || 'Not selected' }}</div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-medium-emphasis">Total Guests</div>
                <div class="font-weight-medium">
                  {{ route.query.total_guest }} Guests 
                  <span v-if="route.query.weddingType" class="text-caption">({{ route.query.weddingType }})</span>
                </div>
              </v-col>
            </v-row>
          </v-sheet>

          <v-form ref="form" v-model="isValid" @submit.prevent="submitInquiry" class="pa-6">
            
            <h3 class="text-h6 font-weight-bold mb-4">Contact Information</h3>

            <v-text-field
              v-model="formData.fullName"
              label="Full Name"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required]"
              class="mb-2"
              color="primary"
            ></v-text-field>

            <v-text-field
              v-model="formData.email"
              label="Active Email Address"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email"
              :rules="[rules.required, rules.email]"
              class="mb-2"
              color="primary"
            ></v-text-field>

            <v-row dense>
              <v-col cols="4" sm="4">
                <v-autocomplete
                  v-model="formData.countryCode"
                  :items="countryCodeList"
                  item-title="name"
                  item-value="code"
                  label="Code"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  color="primary"
                  placeholder="Select"
                  auto-select-first
                >
                  <template v-slot:selection="{ item }">
                    <span class="mr-1">{{ item.raw.flag }}</span> {{ item.raw.code }}
                  </template>
                  
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item.raw.code">
                      <template v-slot:prepend>
                        <span class="text-h6 mr-2">{{ item.raw.flag }}</span>
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="8" sm="8">
                <v-text-field
                  v-model="formData.phone"
                  label="PH Contact Number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.number]"
                  type="tel"
                  color="primary"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="formData.address"
              label="Complete Home Address"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-home"
              :rules="[rules.required]"
              rows="2"
              auto-grow
              class="mb-2"
              color="primary"
            ></v-textarea>

            <v-divider class="my-4"></v-divider>

            <h3 class="text-h6 font-weight-bold mb-4">Other Requests</h3>

            <v-textarea
              v-model="formData.message"
              label="Special Requests or Message (Optional)"
              variant="outlined"
              density="comfortable"
              placeholder="e.g., dietary restrictions, specific theme colors..."
              rows="3"
              auto-grow
              color="primary"
              counter
            ></v-textarea>

            <div class="d-flex justify-end mt-6">
              <v-btn
                size="large"
                variant="text"
                class="mr-2"
                @click="goBack"
              >
                Cancel
              </v-btn>
              
              <v-btn
                type="submit"
                color="primary"
                size="large"
                class="px-8 font-weight-bold"
                elevation="2"
                :disabled="!isValid"
                :loading="isLoading"
              >
                Submit Inquiry
              </v-btn>
            </div>

          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { countryCodes } from '~/data/country-codes'; // Import the list from Part 1

const route = useRoute();
const router = useRouter();

const form = ref(null);
const isValid = ref(false);
const isLoading = ref(false);
const countryCodeList = ref(countryCodes);

const formData = reactive({
  fullName: '',
  email: '',
  countryCode: '+63', // Default to Philippines
  phone: '',
  address: '',
  message: ''
});

// Validation Rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  number: (v: string) => /^\d+$/.test(v) || 'Only numbers are allowed',
};

const goBack = () => {
  router.back();
};

const submitInquiry = async () => {
  if (!isValid.value) return;

  isLoading.value = true;
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Here you would send 'formData' and 'route.query' to your backend
  console.log("Submitting:", { ...formData, bookingDetails: route.query });

  isLoading.value = false;
  
  // Show success feedback or route to success page
  alert("Inquiry Submitted Successfully!");
  // navigateTo('/success');
};
</script>