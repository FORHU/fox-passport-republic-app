<template>
  <v-row no-gutters class="w-100">
    <v-col cols="10" sm="8">
      <v-row no-gutters class="mt-1 text-caption text-sm-subtitle-2 mx-2" style="opacity: 60%">{{ timeStamp }}</v-row>
      <v-row no-gutters>
        <v-card elevation="3" min-width="250px" rounded="lg" class="pa-1 pa-md-2 px-3 px-md-5"
          style="max-width: max-content; border-bottom-left-radius: 0px !important;">
          <v-row no-gutters>
            <v-col class="text-16px" style="white-space: pre-wrap">{{ formattedMessage }}</v-col>
          </v-row>

          <v-row no-gutters v-if="attachments.length > 0">
            <v-divider v-if="message !== ''" class="my-2"></v-divider>
            <v-row no-gutters class="w-100">
              <template v-for="item in attachments" :key="item._id">
                <AttachmentCard :file-data="item" color="light_gray" @click="handleCardClick(item)" />
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

    <v-spacer></v-spacer>
  </v-row>
</template>

<script setup lang="ts">
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

const computedName = computed(() => {
  return `${props.sender?.first_name} ${props.sender?.last_name}`.replace(
    / /g,
    "+",
  );
});

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
  // attachments.forEach(item => {
  //   const link = document.createElement('a');
  //   link.href = item.path;
  //   link.setAttribute('download', ''); // Ensure download attribute is set
  //   link.style.display = 'none';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // });

  for (let item of attachments) {
    window.open(item.path, "_blank");
  }
};

const formattedMessage = computed(() => {
  const message = props.message;
  if (message) {
    return maskContactNumbers(message);
  } else return "";
});
</script>

<style scoped></style>
