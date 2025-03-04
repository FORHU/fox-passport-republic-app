<template>
  <v-row no-gutters class="pa-4" justify="center">
    <v-col cols="12">
      <v-row>
        <v-col cols="12" xxl="1" xl="2" lg="2">
          <v-row no-gutters>
            <v-col cols="12">
              <v-list density="compact">
                <template v-for="typeItem in types" :key="typeItem.title">
                  <v-list-item
                    :to="{ name: typeItem.to, params: typeItem.params }"
                  >
                    <v-list-item-title> {{ typeItem.title }}</v-list-item-title>
                    <template v-slot:prepend>
                      <v-divider
                        thickness="3"
                        vertical
                        style="height: 20px"
                        class="mr-4"
                        :color="typeItem.color"
                      ></v-divider>
                    </template>

                    <template v-slot:append>
                      {{ typeItem.value }}
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" xxl="11" xl="10" lg="10">
          <v-row>
            <template v-for="n in 50" :key="n">
              <v-col cols="12">
                <v-card
                  width="100%"
                  elevation="6"
                  :to="{
                    name: 'country-user-enquiries-enquiry',
                    params: { country, enquiry: '123' },
                  }"
                >
                  <v-row no-gutters justify="start">
                    <v-card elevation="0" rounded="0">
                      <v-img
                        src="https://picsum.photos/500/300?image=232"
                        height="150"
                        width="150"
                        cover
                        alt="image type"
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
const { country } = useLocal();

const pageRoute = "country-user-enquiries-types-type";

const types = [
  {
    title: "Current",
    value: 10,
    color: "transparent",
    to: pageRoute,
    params: { country, type: "current" },
  },
  {
    title: "Past",
    value: 1,
    color: "red",
    to: pageRoute,
    params: { country, type: "past" },
  },
];
</script>
