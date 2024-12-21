<template>
  <!-- <v-btn @click="dialog = true">Open Dialog</v-btn> -->
  <v-dialog v-model="dialog" max-width="500px">
    <v-form @submit.prevent v-model="formValid" ref="form">
      <v-card class="pa-6" rounded="lg">
        <p class="text-21px font-600 " style="line-height: 1.2;">
          {{ title }}
        </p>

        <p class="text-16px font-400 mt-4">Client email: <span class="font-500">{{ email }}</span></p>

        <p class="font-italic text-14px font-400 mt-3">
          By proceeding, you will receive another email activation link to create
          your account. Otherwise, if you want to update your email address <span class="text-decoration-underline cursor-pointer" @click="handleUpdateEmail">click here.</span>
        </p>

        <v-card-actions class="mt-4">
          <v-btn rounded="lg" size="large" @click="dialog = false">Close</v-btn>
          <v-btn type="submit" rounded="lg" size="large" @click="onSubmit"
            class="bg-secondary px-3" :loading="loading">Yes,
            Proceed</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = defineModel<boolean>({ default: false });
const form = ref()
const formValid = ref(false);

const emit = defineEmits(['approve', 'update-email'])

const props = defineProps({
  loading: {
    type: Boolean,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  email: {
      type: String,
      required: true
  }
})

const onSubmit = async () => {
  emit('approve')
}

const handleUpdateEmail = () => {
  dialog.value = false;
  emit('update-email')
}

const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validEmailRules = computed(() => [
  (v: string) => regex.test(v) || "Invalid email address" 
]);



</script>
