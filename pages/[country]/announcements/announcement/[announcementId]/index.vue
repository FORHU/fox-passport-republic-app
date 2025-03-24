<template>
    <v-row
      no-gutters
      class="w-100"
      color="white"
      style="height: 7dvh"
      justify="center"
    >
      <v-row no-gutters justify="center" class="my-5">
        <v-col cols="12" md="10" lg="8" xl="6" sm="10">
          <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>
          <v-form @submit.prevent="onSubmit" ref="formValid" class="w-100" v-else>
            <v-app-bar
              flat
              color="white"
              class="px-5 px-md-0"
              width="100%"
              style="border-bottom: 2px solid #dedfe3"
            >
              <v-row no-gutters justify="center">
                <v-col
                  cols="12"
                  md="10"
                  lg="8"
                  xl="6"
                  class="d-flex ga-2 align-center"
                >
                  <v-col class="d-flex align-center pr-3" style="width: 100%; padding-left: 0;">
                    <span class="text-22px font-600">Edit Announcement</span>
                    <span
                      ><v-progress-linear
                        color="primary"
                        height="5"
                        rounded="lg"
                        class="mt-1"
                      ></v-progress-linear
                    ></span>
                  </v-col>
                  <span>
                      <v-btn
                        @click="$router.go(-1)"
                        variant="outlined"
                        border="secondary md"
                        size="large"
                        text="Exit"
                        rounded="lg"
                      ></v-btn>
                  </span>
                </v-col>
              </v-row>
            </v-app-bar>
            <v-main style="margin-top: 120px;">
                <v-row class="my-2">
                  <v-col cols="6">
                      <v-row no-gutters>
                          <v-col cols="12" class="d-flex flex-column">
                              <span class="font-weight-bold">Choose banner image</span>
                              <span class="text-caption">This is what would be displayed for users.</span>
                          </v-col>
                      </v-row>
                    <v-row class="mt-3" no-gutters>
                      <v-col cols="12" class="text-center mt-2">
                        <CardImageUploader
                          label="Upload banner image"
                          uploader-id="space"
                          height="235"
                          width="100%"
                          single-file-only
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="6">
                      <v-row no-gutters>
                          <v-col cols="12" class="d-flex flex-column">
                              <span class="font-weight-bold">Fill out infromation</span>
                              <span class="text-caption">Enter information about the announcement</span>
                          </v-col>
                      </v-row>
                      <v-row class="mt-3" no-gutters>
                          <v-col cols="12" class="text-center mt-2">
                              <v-textarea placeholder="Enter title here" row-height="10" rounded="lg" rows="1" auto-grow
                             class="pt-1"></v-textarea>
                          </v-col>
                          <v-col cols="12" class="text-center">
                              <v-textarea placeholder="Enter description" row-height="10" rounded="lg" rows="5" auto-grow
                             ></v-textarea>
                          </v-col>
                      </v-row>
                  </v-col>
                </v-row>
              </v-main>
              <v-app-bar no-gutters class="w-100" flat location="bottom" style="border-top: 2px solid #dedfe3">
              <v-sheet class="py-3 px-5 px-md-0" width="100%" style="
                  position: relative;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  border-top: 2px solid #dedfe3;
                ">
                <v-row no-gutters class="w-100 h-100" justify="center">
                  <v-col cols="12" md="10" lg="8" xl="6">
                    <v-row no-gutters class="w-100 h-100" align="center" justify="end">
                      <!-- Save Button -->
                      <v-col cols="auto" class="d-flex justify-center align-center ga-2">
                        <v-btn color="error" border="secondary md" rounded="lg" @click="showDeleteAnnouncementDialog = true"
                          class="py-5 px-10 bg-error text-white d-flex align-center justify-center">
                          Delete
                        </v-btn>
                        <v-btn color="primary" border="secondary md" rounded="lg" @click="showSaveModal = true"
                          class="py-5 px-10 bg-primary text-white d-flex align-center justify-center">
                          Save Changes
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-sheet>
            </v-app-bar>
          </v-form>
        </v-col>
      </v-row>
    </v-row>
    <DialogPromptNew v-model="showSaveModal" @agree="handleSave" :loading="showSaveModalLoading"
        :prompt-title="`Save changes to announcement`" disagree-button-text="CANCEL"
        agree-button-text="SAVE" />
        <DialogPromptNew v-model="showDeleteAnnouncementDialog" :promptTitle="promptTitle"
    :promptText="`Once you delete it, you can't get it back`" :disagreeButtonText="'Cancel'"
    :agreeButtonText="'Delete'" @disagree="disagreeButton" @agree="agreeButton" />
  </template>
  <script setup lang="ts">
  definePageMeta({
    layout: "bare",
    middleware: ['auth', 'admin-only']
  });
  const { country } = useLocal();
  const loader = ref(false);
  const showSaveModal = ref(false);
  const showDeleteAnnouncementDialog = ref(false);
  const showSaveModalLoading = ref(false);
  
  const onSubmit = async () => {};
  const handleSave = async () => {};
  </script>
  