<template>
  <div class="text-center">
    <v-pagination
      v-model="paginationStore.currentPage"
      :length="paginationStore.totalPages"
      :total-visible="paginationStore.totalVisible"
      @update:model-value="handlePageChange"
      prev-icon="mdi-chevron-left"
      next-icon="mdi-chevron-right"
    ></v-pagination>
  </div>
</template>

<script>
import { usePaginationStore } from "~/store/pagination";
export default {
  data() {
    return {
      paginationStore: usePaginationStore(),
    };
  },
  methods: {
    handlePageChange(newPage) {
      this.paginationStore.setCurrentPage(newPage);
      this.$emit("page-changed");
    },
  },
};
</script>
