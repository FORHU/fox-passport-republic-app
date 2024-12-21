<template>
  <!-- <v-btn @click="dialog = true">Open Dialog</v-btn> -->
  <v-dialog v-model="dialog" max-width="500px">
    <v-form @submit.prevent v-model="formValid" ref="form">
      <v-card class="pa-6" rounded="lg">
        <p class="text-21px font-600 " style="line-height: 1.2;">
          {{ title }}
        </p>

        <p class="text-16px font-400 mt-4">Client email</p>

        <v-text-field v-model="email" variant="outlined" required placeholder="venue4use@gmail.com" rounded="lg"
          class="mt-1" :rules="validEmailRules"></v-text-field>

        <p class="font-italic text-14px font-400">
          By proceeding, you will receive an email activation link to create
          your account. Please note that this action is irreversible.
        </p>
        <v-row no-gutters class="w-100 mt-2">
          <v-col cols="12" class="d-flex flex-row align-center">
          <v-checkbox v-model="termsAccepted" required>
            <template v-slot:label>
               <span class="text-14px font-500">
                I agree with the 
                <NuxtLink
                  class="text-decoration-underline"
                  target="_blank"
                  :to="{
                    path: `/${country}/about-us/terms-and-condition`,
                    query: { key: '2' },
                  }"
                >Terms & Conditions</NuxtLink>
              </span>
            </template>
          </v-checkbox>
          </v-col>
        </v-row>
        <v-card-actions class="mt-4">
          <v-btn rounded="lg" size="large" @click="dialog = false">Close</v-btn>
          <v-btn type="submit" rounded="lg" size="large" @click="onSubmit" :disabled="!formValid ||!termsAccepted"
            class="bg-secondary px-3" :loading="loading">Yes,
            Proceed</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = defineModel<boolean>({ default: false });
const email = defineModel<string>('email',{ default: '', required: true });
const form = ref()
const formValid = ref(false);
const termsAccepted = ref(false)
const {country} = useLocal()

const emit = defineEmits(['approve'])

const props = defineProps({
  loading: {
    type: Boolean,
    required: false
  },
  title: {
    type: String,
    required: false
  }
})

const onSubmit = async () => {
  await form.value.validate();
  if(formValid.value && termsAccepted.value){
    emit('approve')
  }
}

const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validEmailRules = computed(() => [
  (v: string) => regex.test(v) || "Invalid email address" 
]);

function goToTerms() {
  
}
watch([() => termsAccepted.value, () => email], () => {
  formValid.value = termsAccepted.value && regex.test(email.value);
});

</script>
<style scoped>
.v-checkbox :deep(.v-label) {
  opacity: 1 !important;
}
</style>
