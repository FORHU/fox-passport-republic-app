import { defineStore } from "pinia";

export const usePaginationStore = defineStore({
  id: "pagination",
  state: () => ({
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
  }),
  actions: {
    setCurrentPage(page: number) {
      console.log(page, "current page");
      this.currentPage = page;
    },
    setTotalPage(page: number) {
      console.log(page, "total page");
      this.totalPages = page;
    },
    setTotalItems(page: number) {
      console.log(page, "total items");
      this.totalItems = page;
    },
    async setDefault() {
      console.log("Setting default pagination");
      this.currentPage = 1;
      this.totalPages = 1;
      this.totalItems = 1;
    },
  },
});
