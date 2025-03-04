<template>
  <v-container class="my-10">
    <v-img class="rounded-xl" height="400"
      src="https://s3-alpha-sig.figma.com/img/cec5/cb51/db508e0ff8c01ea07f5eb6812629a163?Expires=1721001600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=eVV7sQkS5yXEsBQ2pV8IYrWGYhiaA4Uof6JnolEFvzq3E8D34ziyHdWDBlFCUYQ7v5LEQCf2TTWzBqntAA8pQa9QDAuGNo-nqsHtYW1miqZdi8mKhYNL0rKNXFRmDovZb-qKBdxpsL4gbvQgQFt4y9GWwm9jekP4-7C06ckfX5LwIOF4j5hLcCAV5j6QUaz2PVdsufV2kb1zUzdGkiUQpUsW~ZXkM8YZP0P0nvu8B2JbGDrqBi6cWfvc30n8SDeend~UhOJ7mRjz9S8peqzuME3prFn~wV506Qm9nlRWFS4wffL5ICkbZLSY2Zl~BL2cJomJvhBgx4-PWhBl3Jt3mw__"
      cover
      alt="List your venue image"
      >
      <v-row no-gutters class="fill-height third-gradient" align-content="center" justify="center">
        <v-col class="text-center text-white" cols="12" xxl="10" xl="10" lg="10">
          <v-row justify="center" class="hidden-xs w-100 text-h4 pb-5">Join Venue4use Today</v-row>
          <p style="line-height: 2" class="mx-2">
            Join Venue4use in revolutionizing the event venue rental industry.
            Whether you are an event planner, a host, or an individual looking
            for a unique space, we are here to make your venue search simple and
            efficient.
          </p>
          <p style="line-height: 2">
            For more information and to start your venue search, visit us at
            www.venue4use.com.
          </p>
          <v-btn color="black" class="mt-5">
            <NuxtLink class="text-decoration-none text-white" :to="{
              path: `/${country}/venues/management/status/all`,
            }">
              List your Venue
            </NuxtLink>
          </v-btn>
        </v-col>
      </v-row>
    </v-img>
  </v-container>
</template>

<script setup>
const { country } = useLocal();
</script>
