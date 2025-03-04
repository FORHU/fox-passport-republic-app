<template>
  <template v-if="enquiries.length > 0">
    <v-row>
      <v-col
        align="center"
        justify="center"
        v-for="(enquiry, index) in enquiries"
        :key="index"
        cols="12"
        sm="12"
        md="4"
        lg="4"
      >
        <v-card
          class="mx-auto enquiry-card"
          max-width="344"
          @click="selectEnquiry(enquiry._id)"
        >
          <!-- Todo: Add dynamic image based on enquiry image -->
          <v-img
            height="150px"
            src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
            alt="Grid View Image"
            cover
          ></v-img>

          <div
            class="d-flex align-center flex justify-center items-center text-center"
          >
            <v-avatar size="30">
              <img
                :src="enquiry.user.profile_picture"
                alt="Profile Picture"
                class="circular-image"
              />
            </v-avatar>

            <v-card-title class="ml-3">
              {{ enquiry.user.first_name }} {{ enquiry.user.last_name }}
            </v-card-title>
          </div>

          <v-card-subtitle>
            <v-list dense>
              <v-list-item>
                <div class="text-left">Type: {{ enquiry.type }}</div>
              </v-list-item>
              <v-list-item>
                <div class="text-left">Guest: {{ enquiry.guests }}</div>
              </v-list-item>
              <v-list-item>
                <div class="text-left">
                  Date:
                  {{
                    formatDate(
                      enquiry.date.timestamp,
                      enquiry.date.from,
                      enquiry.date.to,
                    )
                  }}
                </div>
              </v-list-item>
              <v-list-item>
                <div class="text-left">
                  Space: Entire Venue at {{ enquiry.space.name }}
                </div>
              </v-list-item>
              <v-list-item>
                <div class="text-left">
                  Price: {{ formatCurrency(enquiry.value) }}
                </div>
              </v-list-item>
              <v-list-item>
                <div class="text-left">
                  Status: {{ ENQUIRY_STATUSES[enquiry.status] }}
                </div>
              </v-list-item>
            </v-list>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12" md="12" lg="12">
        <PaginationComponent
          @page-changed="handlePageChange"
          v-if="!isLoading"
        />
      </v-col>
    </v-row>
  </template>

  <template v-else>
    <v-row>
      <v-col cols="12" md="9">
        <div class="text-center">
          <p>No data found</p>
        </div>
      </v-col>
    </v-row>
  </template>
</template>

<script>
import { usePaginationStore } from "~/store/pagination";
import { formatDate, formatCurrency } from "~/utils";
import { ENQUIRY_STATUSES } from "~/utils/constant";
import PaginationComponent from "~/components/common/Pagination.vue";

definePageMeta({
  layout: "user",
});

export default {
  props: {
    enquiries: {
      type: Array,
      required: true,
    },
    handleGetEnquiries: {
      type: Function,
      required: true,
    },
  },
  components: {
    PaginationComponent,
  },
  data: () => ({
    paginateStore: usePaginationStore(),
  }),
  methods: {
    async handlePageChange() {
      await this.handleGetEnquiries();
    },
    selectEnquiry(enquiry_id) {
      this.$router.push(`/enquiries/${enquiry_id}`);
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
  },
  async mounted() {
    await this.paginateStore.setDefault();
    await this.handleGetEnquiries();
  },
};
</script>

<style scoped>
.circular-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.enquiry-card:hover {
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
