<template>
  <v-row no-gutters class="py-8" justify="center">
    <v-col cols="12" xxl="10" xl="10" lg="10">
      <v-row>
        <v-col cols="12" xxl="1" xl="2" lg="4">
          <v-row no-gutters>
            <v-col cols="12">
              <v-card elevation="6">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-4 text-h5 font-weight-medium">
                    Availability
                  </v-col>
                  <v-col cols="12">
                    <v-divider></v-divider>
                  </v-col>
                  <v-col cols="12">
                    <v-row no-gutters class="pa-8">
                      <v-col cols="12">
                        <span class="font-weight-medium">Date</span>
                        <v-text-field type="date" hide-details></v-text-field>
                      </v-col>

                      <v-col cols="12" class="mt-4">
                        <span class="font-weight-medium">Time</span>
                        <v-text-field type="time" hide-details></v-text-field>
                      </v-col>

                      <v-col cols="12" class="mt-4">
                        <v-btn block color="primary" size="x-large">
                          Check Availability
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" xxl="11" xl="10" lg="8">
          <v-row>
            <template v-for="n in 50" :key="n">
              <v-col cols="12">
                <v-card
                  width="100%"
                  elevation="6"
                  :to="{
                    name: 'country-venues-venue',
                    params: { country, venue: '123' },
                  }"
                >
                  <v-row no-gutters justify="start">
                    <v-card elevation="0" rounded="0">
                      <v-img
                        src="https://picsum.photos/500/300?image=232"
                        height="150"
                        width="150"
                        cover
                        alt="space default image"
                      ></v-img>
                    </v-card>
                    <v-col class="pl-4">
                      <v-row no-gutters>
                        <v-col cols="9">
                          <v-row no-gutters class="py-4">
                            <v-col cols="12">
                              <v-row
                                no-gutters
                                class="fill-height"
                                align="center"
                              >
                                <v-chip
                                  color="primary"
                                  variant="flat"
                                  class="text-uppercase font-weight-medium"
                                >
                                  water activities
                                </v-chip>

                                <span>
                                  <v-divider
                                    vertical
                                    style="height: 20px"
                                    thickness="2"
                                    class="mx-4"
                                  ></v-divider>
                                </span>

                                <v-rating
                                  model-value="4"
                                  active-color="rate"
                                  size="small"
                                  readonly
                                ></v-rating>
                              </v-row>
                            </v-col>

                            <v-col cols="12" class="text-h5 font-weight-bold">
                              Westminster to Greenwich River Thames
                            </v-col>
                          </v-row>
                        </v-col>

                        <v-col cols="3"> </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </template>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const country = useCookie("country").value;
</script>
