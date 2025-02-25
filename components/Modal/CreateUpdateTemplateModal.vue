<template>
  <v-dialog v-model="showCreateTemplateDialog" max-width="600">
    <v-card min-height="" class="pa-1">
      <template v-slot:title>
        <v-row no-gutters class="text-subtitle-4 font-weight-bold text-center">
          <v-col cols="11"
            >{{
              templateMode == "create" ? "Create New" : "Edit"
            }}
            Template</v-col
          >
          <v-col cols="1"
            ><v-icon @click="handleCancel">mdi-close</v-icon></v-col
          >
        </v-row>
      </template>
      <br />
      <v-container>
        <v-text-field v-model="templateName" block></v-text-field>
        <v-sheet color="#ECEFF1" width="100%" height="100%">
          <v-container>
            <v-row no-gutters>
              <v-textarea
                v-model="textArea"
                variant="solo"
                placeholder="Enter your message"
                height="200px"
                no-resize
              ></v-textarea>
            </v-row>
            <!-- UPLOAD FILES CONTAINER -->
            <v-row no-gutters>
              <v-card
                v-if="filesArray.length > 0"
                elevation="3"
                class="w-100 pa-2"
                min-height="50"
              >
                <template v-for="item in filesArray">
                  <AttachmentChip
                    :file-data="item"
                    @click=""
                    @remove-attachment="handleRemoveAttachment(item._id)"
                  />
                </template>
              </v-card>
            </v-row>
            <!-- UPLOAD FILES CONTAINER -->
            <v-row no-gutters class="pt-5">
              <FileUploader
                v-model="filesArray"
                label="Attach Files"
                uploader-id="message-template"
              />
            </v-row>
          </v-container>
        </v-sheet>
      </v-container>

      <template v-slot:actions>
        <v-row no-gutters>
          <v-col cols="12" align="end">
            <v-btn variant="outlined" @click="handleCancel" color="secondary"
              >Cancel</v-btn
            >
            <v-btn
              color="secondary"
              @click="emitEvent()"
              variant="flat"
              class="ml-2"
              :loading="creating"
              >Save Changes</v-btn
            >
          </v-col>
        </v-row>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import FileUploader from "../Button/FileUploader.vue";

const { country, setSnackbar } = useLocal();

const props = defineProps({
  enquiry: {
    type: Object,
    required: true,
  },
  activeTemplateObj: {
    type: Object,
    required: true,
  },
});

const creating = ref(false);
const textArea = ref("");
const templateName = ref("");
const showCreateTemplateDialog = defineModel("create", { default: false });
const templateMode = defineModel<"create" | "update">("mode", {
  default: "create",
});
const filesArray = ref<TFile[]>([]);

const emit = defineEmits(["fetch-templates", "sendData"]);
const emitEvent = async () => {
  if (textArea.value == "" || templateName.value == "") {
    setSnackbar({
      modal: true,
      color: "error",
      text: "Please complete the fields.",
    });
    return;
  }
  let attachmentsPayload: string[] = [];
  if (filesArray.value.length > 0) {
    attachmentsPayload = filesArray.value.map((x) => x._id);
  }
  if (templateMode.value == "create") {
    try {
      creating.value = true;
      const { data } = await useAPI("/v1/message-template", {
        method: "POST",
        body: JSON.stringify({
          space_id: props.enquiry?.space?._id,
          message_title: templateName.value,
          message: textArea.value,
          attachments: attachmentsPayload,
        }),
      });
    } catch (err) {
      console.log(err);
      setSnackbar({
        modal: true,
        color: "error",
        text: "Something went wrong. Please try again later",
      });
    }
  } else if (templateMode.value == "update" && props.activeTemplateObj._id) {
    try {
      creating.value = true;
      const { data } = await useAPI(
        `/v1/message-template/${props.activeTemplateObj._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            message_title: templateName.value,
            message: textArea.value,
            attachments: attachmentsPayload,
          }),
        },
      );
    } catch (err) {
      console.log(err);
      setSnackbar({
        modal: true,
        color: "error",
        text: "Something went wrong. Please try again later",
      });
    }
  }
  emit("fetch-templates");
  creating.value = false;
  textArea.value = "";
  templateName.value = "";
  showCreateTemplateDialog.value = false;
};
// watch(showCreateTemplateDialog.value, (newValue) => {
//   console.log(newValue);
//   if (newValue == false) {
//     console.log(newValue);
//     textArea.value = "";
//   }
// });

const handleCancel = () => {
  showCreateTemplateDialog.value = false;
  templateName.value = "";
  textArea.value = "";
  filesArray.value = [];
};

const handleRemoveAttachment = (file_id: string) => {
  filesArray.value = filesArray.value.filter((x) => x._id !== file_id);
};

watchEffect(() => {
  if (templateMode.value == "update" && props.activeTemplateObj) {
    textArea.value = props.activeTemplateObj.message;
    templateName.value = props.activeTemplateObj.message_title;
    filesArray.value = props.activeTemplateObj.attachments;
  }
});

onMounted(async () => {
  textArea.value = "";
});
</script>
