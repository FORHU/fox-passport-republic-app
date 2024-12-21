<template>
  <!-- <v-btn @click="dialog = true">Open Dialog</v-btn> -->
  <v-dialog v-model="dialog" max-width="600px">
    <v-form @submit.prevent v-model="formValid" ref="form" class="w-100">
      <v-card class="pa-6 w-100 d-flex justify-center" rounded="lg" height="250">
        <p class="text-21px font-600 text-center">
          Verify your email
        </p>

        <p class="text-14px font-400 text-center" style="line-height: 1.2;">
          Please enter the verification code sent to your email <span class="font-500">{{ email }}</span>.
        </p>

        <v-row v-if="!otpVerified" no-gutters class="w-100" justify="center">
          <v-otp-input v-model.number="otpInput" length="6" @finish="handleOTPCheck" :loading="validatingOTP"
            :error="otpError" @keydown="handleKeydown"
            :base-color="otpVerified ? 'green' : ''" ></v-otp-input>

        </v-row>
        <v-row no-gutters justify="center">
          <p v-if="otpErrorDescription" class="text-14px font-400 text-center text-error">{{ otpErrorDescription }}</p>
        </v-row>

        <v-row no-gutters justify="center" class="mt-3">
          <p v-if="otpVerified" class="text-18px font-400 text-center text-success">{{ 'Email successfully verified!' }}
          </p>
        </v-row>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">

const { validateOTP } = useVerify();
const { currentUser } = useLocalAuth();

const dialog = defineModel<boolean>({ default: false });
const email = defineModel<string>('email', { default: '', required: true });
const form = ref()
const formValid = ref(false);
const otpInput = ref<number>()
const otpError = ref(false)
const otpErrorDescription = ref('')
const otpVerified = ref(false)
const validatingOTP = ref(false);

const emit = defineEmits(['verified'])

const props = defineProps({
  loading: {
    type: Boolean,
    required: false
  }
})

const handleOTPCheck = async () => {
  if (!otpInput.value) return;
  try {
    validatingOTP.value = true;
    const res: any = await validateOTP(otpInput.value)
    if (res) {
      otpVerified.value = res?.data?.success == 'success'
      if (otpVerified.value) {
        currentUser.value.status = 'ACTIVE'
        setTimeout(() => {
          dialog.value = false
        }, 2000)
      }
    }
  } catch (error: any) {
    console.log(error.code);

    otpError.value = true;
    if (error.code == 'ERROR_VALIDATE_OTP') {
      otpErrorDescription.value = error?.description
    }
  } finally {
    validatingOTP.value = false;
  }
}

const handleKeydown = () => {
  otpError.value = false; 
  otpErrorDescription.value = ''
}

</script>
