<template>
  <v-btn id="button-attach" icon="mdi-attachment" size="medium" elevation="0" class="pa-2" :disabled="disabled"
  :loading="uploading" style="transform:  rotate(135deg);" @click="handleClick"></v-btn>
  <input
    type="file"
    :disabled="disabled"
    class="d-none"
    :id="`file-${uploaderId}`"
    @change="handleFileChange"
    multiple
  />
</template>

<script setup lang="ts">
const { setSnackbar } = useLocal();
import { useDisplay } from "vuetify";
const { xs, mdAndUp } = useDisplay();
const { uploadFile } = useVenue();

const props = defineProps({
  label: {
    type: String,
    required: false,
    default: "",
  },
  uploaderId: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const model = defineModel<TFile[]>({ default: [] });
const uploading = ref(false);

const handleClick = () => {
  document.getElementById(`file-${props.uploaderId}`)?.click();
};

const handleFileChange = async (e: any) => {
  const input = e.target as HTMLInputElement;

  if (!input.files) return;

  const filesArr = Array.from(input.files);
  const maxSize = 25000000; // 25MB

  // Check file sizes first
  for (let i = 0; i < filesArr.length; i++) {
    if (filesArr[i].size > maxSize) {
      setSnackbar({
        text: "File size too large. Please upload a file less than 25MB",
        color: "error",
        modal: true,
      });
      return;
    }
  }

  // Initialize uploading state
  uploading.value = true;

  try {
    // Upload files
    for (let i = 0; i < filesArr.length; i++) {
      const formData = new FormData();
      formData.append("file", filesArr[i]);
      formData.append("description", `attachment_file_${i}`);

      const { data } = await uploadFile(formData);

      if (data && data.value && data.value.data && data.value.data) {
        const file_data = data.value.data;
        model.value.push(file_data);
      } else {
        uploading.value = false;
        throw new Error("Failed to upload file");
      }
    }

    // Reset uploading state
    uploading.value = false;
  } catch (error) {
    console.error("Error uploading files:", error);
    // Handle error and set uploading state accordingly
    uploading.value = false;
  }
};
</script>

<style scoped></style>
