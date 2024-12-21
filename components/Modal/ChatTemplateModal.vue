<template>
  <v-dialog v-model="showDialog" max-width="600">
    <v-card height="100%" class="pa-1">
      <template v-slot:title>
        <v-row no-gutters class="text-subtitle-4 font-weight-bold text-center">
          <v-col cols="11">Message Templates</v-col>
          <v-col cols="1"
            ><v-icon @click="showDialog = false">mdi-close</v-icon></v-col
          >
        </v-row>
      </template>
      <br />
      <v-container>
        <v-row
          class="mb-4"
          no-gutters
          v-for="(item, index) in messageTemplateArr"
          :key="index"
        >
          <v-col cols="7">
            <span
              class="truncate-text"
              :style="{ width: `${mdAndUp ? '100%' : '150px'}` }"
              >{{ item?.message_title }}</span
            >
          </v-col>
          <v-col cols="3">
            <v-btn
              variant="outlined"
              style=""
              density="comfortable"
              @click="useTemplate(item)"
              >{{ smAndUp ? "Select Template" : "Select" }}</v-btn
            >
          </v-col>
          <v-col cols="2">
            <v-btn
              @click="openEditTemplateDialog(item)"
              variant="text"
              density="comfortable"
              >Edit</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
      <!-- <v-row no-gutters class="text-caption fill-height" align="center">
        <v-col cols="12" class="text-center">{{ sampleText }}</v-col>
      </v-row> -->

      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn
          variant="flat"
          color="secondary"
          density="comfortable"
          @click="openCreateTemplateDialog()"
        >
          Create New Template
        </v-btn>

        <ModalCreateUpdateTemplateModal
          @fetch-templates="fetchTemplates()"
          v-model:create="showCreateTemplateDialog"
          v-model:mode="templateMode"
          :enquiry="enquiry"
          :active-template-obj="activeTemplateObj"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

const props = defineProps({
  enquiry: {
    type: Object,
    required: true,
  },
});
const messageTemplateArr = ref([]);
const activeTemplateObj = ref({});
// const enquiryData = props.enquiry
// const showEditTemplateDialog = ref(false);
const showCreateTemplateDialog = ref(false);

const showDialog = defineModel("template", { default: false });
const inputMessage = defineModel("message", { required: true });
const inputFilesArray = defineModel("files", { required: true });
const templateMode = ref<"update" | "create">("create");

const emit = defineEmits(["agree", "disagree", "exitDialog"]);

const openEditTemplateDialog = (dataObj) => {
  if (!dataObj) return;
  activeTemplateObj.value = dataObj;
  templateMode.value = "update";
  showCreateTemplateDialog.value = true;
};
const openCreateTemplateDialog = () => {
  templateMode.value = "create";
  showCreateTemplateDialog.value = true;
};

async function fetchTemplates() {
  if (!props.enquiry.space._id) return;
  const { data } = await useAPI("/v1/message-template", {
    query: {
      space_id: props.enquiry?.space?._id,
    },
  });
  if (data.value) {
    const res = data.value;
    if (res?.data) {
      messageTemplateArr.value = res.data;
    }
  }
}

const useTemplate = (item: any) => {
  if (!item) return;
  showDialog.value = false;
  inputMessage.value = item?.message;
  inputFilesArray.value = item?.attachments;
};

watch(showDialog, async () => {
  if (showDialog.value) {
    await fetchTemplates();
  }
});
</script>
<style scoped>
.truncate-text {
  display: inline-block;
  /* Adjust width as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
