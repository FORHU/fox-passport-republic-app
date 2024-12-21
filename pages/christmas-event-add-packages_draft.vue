<template>
  <v-form class="bg-primaryBG py-5" cols="8">
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
        width="1325px"
        height="1100px"
        class="mt-4"
        style="border-radius: 10px"
      >
        <div class="mt-6 ml-6">
          <span class="text-h4 mt-4" style="font-family: DM Sans"
            >Add packages and prices</span
          >
          <br />
          <span
            style="font-family: DM Sans; font: 14px"
            class="text-medium-emphasis text-subtitle-2"
            >Packages can be sample menus, wedding service, a party package
            including refreshments, etc. (maximum 10 packages).</span
          >
          <!-----------Will Insert here the list of Packages----->
          <v-card
            class="bg-primaryBG py-5"
            width="1276px"
            height="420px"
            variant="text"
          >
            <v-card-text>
              <v-row class="mt-n9">
                <v-col cols="8">
                  <span class="font-weight-bold">Package name:</span>
                </v-col>
                <v-col cols="4">
                  <span class="font-weight-bold">Price:</span>
                </v-col>
              </v-row>
              <v-divider />
              <v-row class="mt-2">
                <v-col cols="12">
                  <span class="font-weight-bold">Minimum Spend:</span>
                </v-col>
              </v-row>
              <v-row class="mt-n1">
                <v-col cols="8">
                  <v-text-field
                    label="Package name"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-text-field density="compact">
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-currency-usd</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-autocomplete density="compact"></v-autocomplete>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <span class="font-weight-bold">Description:</span>
                </v-col>
              </v-row>
              <v-textarea
                height="155px"
                label="Description of the package menu.."
              ></v-textarea>
              <v-row>
                <v-col cols="10">
                  <v-btn color="#424242" density="compact">Cancel</v-btn>
                </v-col>
                <v-col cols="2">
                  <v-btn class="ml-3" color="#8091AF" density="compact"
                    >Save Package</v-btn
                  >
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <v-btn class="ml-4 mb-3 mt-3" color="#8091AF" density="compact"
            >+ Add a Package</v-btn
          >

          <v-card width="800.28px" height="200px" variant="text">
            <span
              class="font-weight-medium text-h6"
              style="'font-family: DM Sans;"
            >
              Do you charge an additional hire fee or require a minimum spend?
            </span>
            <br />
            <span class="font-italic" style="font-size: 14px"
              >Leave blank if you don't charge any</span
            >
            <v-row class="mt-3 ml-3 mb-n6">
              <v-col cols="3">
                <span>Hire Fee:</span>
              </v-col>
              <v-col cols="4" class="ml-n12">
                <v-text-field
                  density="compact"
                  class="short-text-field"
                  style="width: 100px"
                >
                  <template v-slot:prepend-inner>
                    <v-icon>mdi-currency-usd</v-icon>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
            <v-row class="ml-3 mt-n6">
              <v-col cols="3">
                <span>Minimum Spend:</span>
              </v-col>
              <v-col cols="4" class="ml-n12">
                <v-text-field
                  density="compact"
                  class="short-text-field"
                  style="width: 100px"
                >
                  <template v-slot:prepend-inner>
                    <v-icon>mdi-currency-usd</v-icon>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-card>
          <br />
          <br />
          <v-card
            style="position: relative"
            variant="text"
            width="900px"
            height="260px"
          >
            <span
              class="font-weight-medium text-h6"
              style="'font-family: DM Sans;"
            >
              Description of the event
            </span>
            <br />
            <span
              class="text-medium-emphasis text-subtitle-2"
              style="font-size: 14px"
              >Write here what is special about your event offer which is not
              already included in the description of the space profile.</span
            >
            <br />
            <v-textarea
              width="1255px"
              label="Description of the package, menu.."
            >
            </v-textarea>
            <v-btn class="card-footer">Save</v-btn>
          </v-card>
        </div>
      </v-card>
    </v-container>
  </v-form>
</template>

<script setup></script>

<style scoped>
.short-text-field .v-text-field__slot input {
  padding-top: 8px;
  padding-bottom: 8px;
}
/* .v-label {
    font-size:14px;
} */

.card-footer {
  position: absolute;
  bottom: 1px;
  right: 10px;
}
</style>
