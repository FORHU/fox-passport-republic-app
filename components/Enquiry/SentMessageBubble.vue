<template>
  <v-row no-gutters class="w-100">
    <v-spacer></v-spacer>
    <v-col cols="10" sm="8">
      <v-row no-gutters class="mt-1 text-caption text-sm-subtitle-2 mx-2" justify="end" style="opacity: 60%">{{
        timeStamp }}</v-row>
      <v-row no-gutters class="w-100" justify="end">
        <v-card elevation="3" color="secondary" min-width="250px" rounded="lg" class="pa-1 pa-md-2 px-3 px-md-5"
          style="max-width: max-content; border-bottom-right-radius: 0px !important;">
          <v-row no-gutters>
            <v-col class="text-16px" style="white-space: pre-wrap">{{ formattedMessage }}</v-col>
          </v-row>
          <v-row no-gutters v-if="attachments.length > 0">
            <v-divider v-if="message !== ''" class="my-2"></v-divider>
            <v-row no-gutters class="w-100">
              <template v-for="item in attachments" :key="item._id">
                <AttachmentCard :file-data="item" @click="handleCardClick(item)" color="#4C4E56" />
              </template>
            </v-row>
            <v-row no-gutters class="text-caption mb-0 pb-0 px-2">{{ attachments?.length + " attachment(s)" }} -&nbsp;<span
                class="cursor-pointer text-primary font-weight-bold" @click="downloadAll(attachments)">{{
                  attachments.length == 1 ? "Download" : "Download all"
                }}</span></v-row>
          </v-row>
        </v-card>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { currentUser } = useLocalAuth();
const { maskContactNumbers } = useUtils();

const props = defineProps<{
  timeStamp: string;
  message: string;
  sender: {
    first_name: string;
    last_name: string;
    _id: string;
  };
  attachments: TFile[];
}>();

const emit = defineEmits(["show-image"]);

const handleCardClick = (file: TFile) => {
  if (!file || !file.contentType) return;

  if (file.contentType.includes("image")) {
    emit("show-image", file._id);
  } else {
    window.open(file.path, "_blank");
  }
};

const downloadAll = (attachments: any[]) => {
  //   attachments.forEach(item => {
  //     const link = document.createElement('a');
  //     link.href = item.path;
  //     link.setAttribute('download', ''); // Ensure download attribute is set
  //     link.style.display = 'none';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   });

  for (let item of attachments) {
    window.open(item.path, "_blank");
  }
};

// function maskContactNumbers(message: string) {
//   // Function to identify if a segment is a monetary value
//   function isMonetaryValue(str: string) {
//     // Regex for identifying monetary values with commas and optional decimals
//     return /^(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?$/.test(str);
//   }

// }

function maskDigitsExceptMonetary(str: string) {
  function isMonetaryValue(str) {
    // Regex for identifying monetary values with commas and optional decimals
    return /^(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?$/.test(str);
  }

  return str
    .split(" ")
    .map((segment) => {
      // Check if the segment is a monetary value
      if (isMonetaryValue(segment)) {
        return segment;
      }
      // Mask digits in non-monetary segments
      return segment.replace(/\d/g, "*");
    })
    .join(" ");
}

const formattedMessage = computed(() => {
  const message = props.message;
  if (message) {
    return maskContactNumbers(message);
  } else return "";
});
</script>

<style scoped></style>
