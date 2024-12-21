<template>
  <v-dialog v-model="showEditTemplateDialog" max-width="600">
    <v-card min-height="400" class="pa-1">
      <template v-slot:title>
        <v-row no-gutters class="text-subtitle-4 font-weight-bold text-center">
          <v-col cols="11">Edit Templates</v-col>
          <v-col cols="1"
            ><v-icon @click="showEditTemplateDialog = close"
              >mdi-close</v-icon
            ></v-col
          >
        </v-row>
      </template>
      <br />
      <!-- <v-container>
        <v-text-field v-model="enquiry.space.name" block></v-text-field>
        <v-sheet color="#ECEFF1" width="100%" height="100%">
          <v-container>
            <v-textarea
              v-model="editData.messageTemplate"
              variant="solo"
              placeholder="Enter your message"
              height="100px"
            ></v-textarea>
            <v-row class="pt-6 pr-5 pb-5 pl-3">
              <v-btn
                variant="outlined"
                style="background-color: white"
                color="#8091AF"
                >Attach File</v-btn
              >
            </v-row>
          </v-container>
        </v-sheet>
      </v-container> -->

      <template v-slot:actions>
        <v-row class="pl-2 pr-2">
          <v-col cols="2">
            <v-btn @click="deleteTemplate()" variant="outlined" color="red"
              >DELETE</v-btn
            >
          </v-col>
          <v-col cols="5"></v-col>
          <v-col cols="2">
            <v-btn
              variant="outlined"
              @click="emit('exitEditDialog')"
              color="#8091AF"
              >Cancel</v-btn
            >
          </v-col>
          <v-col cols="3">
            <v-btn @click="saveChanges()" color="secondary" variant="flat"
              >Save Changes</v-btn
            >
          </v-col>
          <!-- <v-btn
          variant="flat"
          color="secondary"
          density="compact"
        >
          Create New Template
        </v-btn> -->
        </v-row>
      </template>
      <pre>{{ activeTemplateObj }}</pre>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  enquiry: {
    type: Object,
    required: true,
  },
  activeTemplateObj: {
    required: true,
    type: Object | null,
  },
});
let { editData, enquiry, editIndex } = toRefs(props);
const showEditTemplateDialog = defineModel("edit", { default: false });

// const emit = defineEmits([
//   "exitEditDialog",
//   "deleteTemplate",
//   "saveEditChanges",
// ]);

// const deleteTemplate = () => {
//   emit("deleteTemplate", editIndex);
//   emit("exitEditDialog");
// };
// const saveChanges = () => {
//   emit("saveEditChanges", {
//     editIndex: editIndex.value,
//     editData: editData.value,
//   });
//   emit("exitEditDialog");
// };
</script>
