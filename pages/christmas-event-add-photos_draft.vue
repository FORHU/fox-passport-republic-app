<template>
  <v-form class="bg-primaryBG py-5">
    <v-container>
      <v-row>
        <v-col cols="3">
          <v-btn
            variant="text"
            @click="returnToEditVenue()"
            prepend-icon="mdi-arrow-left"
            >Back</v-btn
          >
        </v-col>
      </v-row>
      <span
        :style="'font-family: DM Sans;font-size: 35px;font-weight: 500;line-height: 45.57px;letter-spacing: 1.25px;text-align: left;'"
      >
        Creating a Christmas Party Offer</span
      >
      <v-card
        class="mt-4"
        width="1325px"
        height="1164px"
        :style="'border-radius:10px'"
      >
        <v-container>
          <v-card
            class="bg-primaryBG py-5"
            variant="text"
            height="246px"
            width="1265px"
            :style="'border: 1px solid #919EAB05;background-color:primary;'"
          >
            <v-card-text class="mt-n5">
              <span
                :style="'font-family: DM Sans;font-size: 14px;font-weight: 700;'"
                >How it works</span
              >
              <br />
              <v-container>
                <ul>
                  <li style="font-family: DM Sans">
                    Add pictures of your space prepared for a Christmas party,
                    and any pictures which show what's special about a Christmas
                    party in your venue
                  </li>
                  <li style="font-family: DM Sans">
                    Replace the name of the space with the name of your event
                    offer to better attract clients
                  </li>
                </ul>
              </v-container>
              <span style="font-family: DM Sans"
                >If your space is listed for those keywords, customers will see
                the name and Christmas Party pictures when searching for:</span
              >
              <br />
              <div class="mt-4">
                <v-chip size="small" density="compact" class="vChip"
                  >Christmas Dinner</v-chip
                >
                <v-chip size="small" density="compact" class="vChip"
                  >Christmas Party</v-chip
                >
                <v-chip size="small" density="compact" class="vChip"
                  >Xmas Party</v-chip
                >
                <v-chip size="small" density="compact" class="vChip"
                  >Holiday Party</v-chip
                >
              </div>
              <br />
              <span class="mr-3" style="font-size: 12px">Not tagged?</span
              ><span style="font-size: 12px; color: #8091af"
                >Edit search keywords</span
              >
            </v-card-text>
          </v-card>
          <v-card width="610.95px" height="150px" variant="text">
            <v-card-title
              class="mb-n3 text-h5 font-weight-bold"
              style="font-family: DM Sans; font-weight: 500"
              >Rename your space for this event</v-card-title
            >
            <v-card-text>
              <span style="font-family: DM Sans"
                >Replace the name of the space with the name of your event
                offer.</span
              >
              <br />
              <span style="font-family: DM Sans"
                >Ex: Bridal Shower Package, St James Wedding Package, Children's
                Birthday Party</span
              >
              <br />

              <v-row class="mt-1">
                <v-col cols="6">
                  <v-text-field
                    style="width: 300px"
                    density="compact"
                    label="Room 1 Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="5">
                  <v-chip variant="text">At Social Space</v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card width="615.95px" height="200px" variant="text">
            <v-card-title
              class="mb-n3 text-h5 font-weight-bold"
              style="font-family: DM Sans; font-weight: 500"
              >Select or Upload four pictures of your event.</v-card-title
            >
            <v-card-subtitle style="font-family: DM Sans; font-weight: 500"
              >Select pictures from your pictures or upload new
              ones.</v-card-subtitle
            >
            <v-card-text>
              <v-container>
                <ul>
                  <li>
                    Use high quality image files (.jpg, .jpeg, .png) - we
                    recommend at least 1920 x 1080 pixels in size.
                  </li>
                  <li>
                    Do not reupload your existing photos as they would be shown
                    twice.
                  </li>
                  <li>Horizontal photos are preferred over vertical ones.</li>
                  <li>Select / upload at least 4 photos of your event.</li>
                </ul>
              </v-container>
            </v-card-text>
          </v-card>
          <v-card variant="text" width="1052px" height="90px">
            <v-card-text>
              <span
                style="font-family: DM Sans; font-weight: 500"
                class="text-h6 font-weight-bold"
                >Selected photos for Christmas Party</span
              >
              <br />
              <span
                >These photos will be shown before regular pictures of the space
                whenever people visit your room profile while looking for a
                christmas party. Because users like to see many pictures, we
                always show all the photos - only the order changes.</span
              >
            </v-card-text>
          </v-card>
          <br />
          <br />
          <br />
          <br />
          <v-card variant="text" width="1052px" height="90px">
            <v-card-text>
              <span
                style="font-family: DM Sans; font-weight: 500"
                class="text-h6 font-weight-bold"
                >Photos of the profile Social Space</span
              >
              <br />
              <span
                >Photos that you add here will also be shown on your regular
                profile.</span
              >
              <br />
            </v-card-text>
          </v-card>
          <v-container>
            <img
              width="320px"
              height="150px"
              src="https://picsum.photos/200/300"
              alt="Sample Image"
            />
          </v-container>
        </v-container>
      </v-card>
    </v-container>
  </v-form>
</template>

<script setup>
function returnToEditVenue() {}
</script>

<style scoped>
.vChip {
  background-color: #8091af;
  color: white;
  font-weight: lighter;
  margin-right: 2px;
}
</style>
