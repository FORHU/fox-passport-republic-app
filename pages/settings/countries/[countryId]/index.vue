<template>
  <v-img height="400" src="/about-us-hero.jpeg" cover alt="country page hero">
    <v-row
      no-gutters
      class="fill-height third-gradient"
      align-content="center"
      justify="center"
    >
      <v-row
        class="fill-height pa-4"
        align="end"
        justify="center"
        justify-sm-start
      >
        <v-container>
          <p class="text-white text-h3 text-center text-sm-left">
            Admin Setting
          </p>
        </v-container>
      </v-row>
    </v-row>
  </v-img>

  <!-- BODY -->
  <v-container class="my-10">
    <v-card class="pa-10" color="cyan-lighten-5">
      <!-- <p class="text-h4">{{ country.name }}</p> -->

      <p>Country Details</p>
      <p>Please remember to keep your details up to date.</p>

      <v-row no-gutters class="mt-5">
        <v-col>
          <p>Flag Icon</p>
          <!-- <v-select v-model="country.flag" clearable :items="flagOptions"></v-select> -->
        </v-col>

        <v-col>
          <p>Country Name</p>
          <!-- <v-text-field v-model="country.name"></v-text-field> -->
        </v-col>

        <v-col>
          <p>Country Code</p>
          <!-- <v-text-field v-model="country.countryCode"></v-text-field> -->
        </v-col>

        <v-col>
          <p>Currency Sign</p>
          <!-- <v-text-field v-model="country.currencySign"></v-text-field> -->
        </v-col>
      </v-row>

      <v-row no-gutters class="mt-5">
        <v-col>
          <p>Currency Code</p>
          <!-- <v-text-field v-model="country.currencyCode"></v-text-field> -->
        </v-col>

        <v-col>
          <p>Commission Rate</p>
          <!-- <v-text-field v-model="country.commissionRate"></v-text-field> -->
        </v-col>

        <v-col>
          <p>Rebate Rate</p>
          <!-- <v-text-field v-model="country.rebateRate"></v-text-field> -->
        </v-col>

        <v-col>
          <p>Default</p>
          <!-- <v-text-field v-model="country.default"></v-text-field> -->
        </v-col>
      </v-row>

      <v-row>
        <p>Country Photos</p>
      </v-row>
    </v-card>
  </v-container>
</template>
