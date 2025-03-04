<template>
  <v-dialog v-model="showShareModal" max-width="500">
    <v-card class="pa-6 rounded-lg" :elevation="5" style="z-index: 99">
      <div class="d-flex justify-space-between align-center">
        <v-card-title class="headline">Share this venue</v-card-title>
        <v-btn variant="plain" @click="showShareModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="d-flex mt-2">
        <v-img
          :src="
            featuredImageSrc()?.path ||
            'https://picsum.photos/500/300?image=232'
          "
          cover
          class="rounded-lg ml-4"
          height="130"
          width="70"
          alt="Space featured Image"
        ></v-img>

        <v-card-text>
          <p class="font-500 mt-7">
            {{ specificSpace.name }}
          </p>
          <p>{{ specificSpace.venue.name }}</p>
        </v-card-text>
      </div>

      <div class="links mx-3">
        <v-row class="mt-3">
          <v-col>
            <v-card
              variant="outlined"
              class="pa-1 rounded-lg"
              color="grey"
              link
              @click="copyLink"
            >
              <div class="d-flex align-center text-left">
                <v-col cols="3">
                  <v-img
                    height="20px"
                    width="20px"
                    src="/public/copyicon.svg"
                    alt="Copy icon"
                  ></v-img>
                </v-col>
                <v-col>
                  <span class="ml-2 text-black">Copy Link</span>
                </v-col>
              </div>
            </v-card>
          </v-col>

          <v-col>
            <v-card
              variant="outlined"
              class="pa-1 rounded-lg"
              color="grey"
              link
              @click="sendEmail"
            >
              <div class="d-flex align-center text-left">
                <v-col cols="3">
                  <v-img
                    height="20px"
                    width="20px"
                    src="/public/email.svg"
                    alt="Email icon"
                  ></v-img>
                </v-col>
                <v-col>
                  <span class="ml-2 text-black">Email</span>
                </v-col>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card
              variant="outlined"
              class="pa-1 rounded-lg"
              color="grey"
              link
              @click="shareViaSMS"
            >
              <div class="d-flex align-center text-left">
                <v-col cols="3">
                  <v-img
                    height="20px"
                    width="20px"
                    src="/public/msgs.svg"
                    alt="SMS icon"
                  ></v-img>
                </v-col>
                <v-col>
                  <span class="ml-2 text-black">Messages</span>
                </v-col>
              </div>
            </v-card>
          </v-col>

          <v-col>
            <v-card
              variant="outlined"
              class="pa-1 rounded-lg"
              color="grey"
              link
              @click="shareOnWhatsApp"
            >
              <div class="d-flex align-center text-left">
                <v-col cols="3">
                  <v-img
                    height="20px"
                    width="20px"
                    src="/public/whatsapp.svg"
                    alt="WhatsApp icon"
                  ></v-img>
                </v-col>
                <v-col>
                  <span class="ml-2 text-black">WhatsApp</span>
                </v-col>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card
              variant="outlined"
              class="pa-1 rounded-lg"
              color="grey"
              link
              @click="shareOnMessenger"
            >
              <div class="d-flex align-center text-left">
                <v-col cols="3">
                  <v-img
                    height="20px"
                    width="20px"
                    src="/public/messenger.svg"
                    alt="Messenger icon"
                  ></v-img>
                </v-col>
                <v-col>
                  <span class="ml-2 text-black">Messenger</span>
                </v-col>
              </div>
            </v-card>
          </v-col>

          <v-col>
            <v-card
              variant="outlined"
              class="pa-1 rounded-lg"
              color="grey"
              link
              @click="shareOnFacebook"
            >
              <div class="d-flex align-center text-left">
                <v-col cols="3">
                  <v-img
                    height="20px"
                    width="20px"
                    src="/public/svg/fb.svg"
                    alt="Facebook icon"
                  ></v-img>
                </v-col>
                <v-col>
                  <span class="ml-2 text-black">Facebook</span>
                </v-col>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  specificSpace: {
    type: Object,
    required: true,
  },
  featuredImageSrc: {
    type: Function,
    required: true,
  },
  copyLink: {
    type: Function,
    required: true,
  },
  sendEmail: {
    type: Function,
    required: true,
  },
  shareViaSMS: {
    type: Function,
    required: true,
  },
  shareOnWhatsApp: {
    type: Function,
    required: true,
  },
  shareOnMessenger: {
    type: Function,
    required: true,
  },
  shareOnFacebook: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits();

const showShareModal = defineModel("showShareModal", { required: false });
</script>
