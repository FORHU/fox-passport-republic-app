<template>
  <v-row no-gutters class="fill-height" style="min-height: 80dvh">
    <v-col cols="8">
      <v-img
        src="public/images/dashboard/default-image.png"
        cover
        width="auto"
        height="100%"
        alt="Dashboard Default Image"
      >
        <v-overlay :value="true" absolute>
          <template v-slot:activator="{ on, attrs }">
            <div
              v-bind="attrs"
              v-on="on"
              style="
                background-color: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
              "
            >
              <v-row no-gutters justify="space-between" style="height: 100%">
                <v-col cols="12" class="pa-10">
                  <NuxtLink
                    to="/"
                    class="text-decoration-none text-black"
                    variant="text"
                  >
                    <img
                      src="public/images/navigation/dp3-removebg.webp"
                      alt="Venue4use brand logo"
                      style="max-width: 120px"
                    />
                  </NuxtLink>
                </v-col>
                <v-col
                  cols="12"
                  class="d-flex justify-end text-white d-flex flex-column pa-10 ml-4"
                >
                  <span style="font-size: 44px" class="font-weight-bold"
                    >Discover & Reserve Venues</span
                  >
                  <span style="font-size: 24px">
                    Seamless Venue Solution for Every Event Endeavor
                  </span>
                </v-col>
              </v-row>
            </div>
          </template>
        </v-overlay>
      </v-img>
    </v-col>
    <v-col
      class="pa-3 pa-lg-10 custom-light-bg-linear d-flex flex-column ga-5 justify-center align-center"
    >
      <slot name="content"></slot>
    </v-col>
  </v-row>
</template>
