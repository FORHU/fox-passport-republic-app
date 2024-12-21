<template>
  <v-card
    @click="handleClick"
    flat
    :height="height"
    :width="width"
    rounded="lg"
    :ripple="!uploading && !disabled"
    :class="`${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`"
    class="border-custom"
  >
    <v-row no-gutters class="fill-height" align-content="center">
      <v-col cols="12" align="center" class="mb-2">
        <v-icon
          icon="mdi-image-plus-outline"
          :size="parseInt(height.toString()) / 5"
          color="secondary"
        ></v-icon>
      </v-col>
      <v-col
        cols="12"
        class="text-secondary text-16px font-400 text-center"
        style="line-height: 1"
        >{{ label }}</v-col
      >
    </v-row>
  </v-card>
  <input
    type="file"
    :disabled="disabled"
    class="d-none"
    :id="`file-${uploaderId}`"
    accept=".png, .jpg, .jpeg, .gif, .bmp, .svg, .webp ,.mp4, .mov"
    @change="handleFileChange"
    :multiple="!singleFileOnly"
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
  height: {
    type: [String, Number],
    required: false,
    default: '100%',
  },
  width: {
    type: [String, Number],
    required: false,
    default: '100%',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  singleFileOnly: {
    type: Boolean,
    required: false,
    default: false,
  }
});

const model = defineModel<TFile[]>({ default: [] });
const uploading = defineModel("uploading", { default: false });

const emit = defineEmits(["done-uploading"]);

// const photoArr = ref([]);

const handleClick = () => {
  document.getElementById(`file-${props.uploaderId}`)?.click();
};

const handleFileChange = async (e: any) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    const filesArr = Array.from(input.files);
    let uploadValid = true;

    for (let i = 0; i < filesArr.length; i++) {
      const file = filesArr[i];
      if (file.type.startsWith('image/') && file.size > 25000000) {
        setSnackbar({
          text: "File size is too large. The maximum size for photos is 25MB.",
          color: "error",
          modal: true,
        });
        uploadValid = false;
        break;
      } else if (file.type.startsWith('video/') && file.size > 50000000) {
        setSnackbar({
          text: "File size is too large. The maximum size for videos is 50MB.",
          color: "error",
          modal: true,
        });
        uploadValid = false;
        break;
      }
    }

    if (!uploadValid) return;

    const uploadedFile = filesArr.filter((file) => {
      const acceptedTypes = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/bmp",
        "image/svg+xml",
        "image/webp",
        "video/mp4",
        "video/quicktime",
      ];
      return acceptedTypes.includes(file.type);
    });

    if (uploadedFile.length !== filesArr.length) {
      setSnackbar({
        color: "red",
        text: "Please upload image/video file only!",
        modal: true,
      });
      return;
    } else {
      // Initialize uploading state
      uploading.value = true;

      try {
        // Upload files
        for (let i = 0; i < filesArr.length; i++) {
          const formData = new FormData();
          formData.append("file", filesArr[i]);
          formData.append("description", `${props.uploaderId}`);

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
        emit("done-uploading");
      } catch (error) {
        console.error("Error uploading files:", error);
        // Handle error and set uploading state accordingly
        uploading.value = false;
      }
    }
  }
};
</script>

<style scoped>
.border-custom {
  border: 2px dashed #DEDFE3;
}
</style>
