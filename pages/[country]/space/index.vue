<template>
  <div>
    <VenueHeader />
    <v-row no-gutters>
      <v-col cols="12" class="my-4">
        <h2>Venue Functions</h2>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12">
        <div
          class="text-center border-thin pa-5 rounded-lg ma-auto"
          style="width: 1100px"
        >
          <div class="d-flex flex-wrap">
            <v-card
              @click="addSpaceFunction()"
              width="240px"
              class="prevent-select ma-2 rounded-lg"
              style="box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.25)"
            >
              <div style="position: relative; cursor: pointer">
                <v-img
                  style="filter: blur(1px)"
                  height="180px"
                  src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
                  cover
                  alt="Space default Card Image"
                ></v-img>
                <p class="plus-icon">+</p>
              </div>

              <v-card-title>Add another space</v-card-title>

              <v-card-actions> </v-card-actions>
            </v-card>
            <v-card
              width="240px"
              class="ma-2 rounded-lg"
              style="box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.25)"
              v-for="(item, index) in historyList"
              :key="index"
            >
              <v-img
                height="180px"
                :src="item.space_photo[0].path"
                cover
                :alt="'History List - ' + index"
              ></v-img>

              <v-card-title class="text-left"
                >New Funciton {{ item._id }}</v-card-title
              >

              <v-card-actions class="d-flex flex-column">
                <v-btn
                  color="primary"
                  style="background-color:"
                  elevation="1"
                  variant="flat"
                  class="btn-primary ma-auto mb-1"
                  block
                  @click="setSpace(item._id)"
                >
                  Finish Function Profile
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn
                  color="error"
                  style="background-color:"
                  elevation="1"
                  variant="flat"
                  class="btn-primary ma-auto"
                  block
                  @click="removeSpaceFunction(index)"
                >
                  Delete Function Profile
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
          <v-pagination
            v-if="historyList.length > 0"
            class="pagination mb-2"
            v-model="page"
            :length="pages"
            @input="updatePage"
          ></v-pagination>
        </div>
        <!-- </div> -->
      </v-col>
    </v-row>
    <VenuePagination />
  </div>
</template>

<script>
export default {
  setup() {
    //IMPORT
    const { spaceDataStore, setSpaceData, addNewSpaceData, setSelectedSpace } =
      useLocal();
    const { country } = useLocal();

    //DATA
    let page = ref(1);
    let pageSize = ref(7);
    let listCount = ref(0);
    let historyList = ref([]);
    let count = ref(0);
    let spaceArray = ref([]);

    //WATCHERS
    watch(page, (to) => updatePage(to));
    watch(historyList, (to) => {
      if (to.length == 0) {
        updatePage(page.value > 1 ? --page.value : page.value);
        initPage();
      }
    });

    //COMPUTED
    const pages = computed(() => {
      if (pageSize.value == null || listCount.value == null) return 0;
      return Math.ceil(listCount.value / pageSize.value);
    });
    const spaceData = computed(() => spaceDataStore.value);

    //METHODS
    //TEMPORARY WHILE WAITING FOR VENUE
    async function getVenueSpace() {
      try {
        let response = await fetch(
          "https://venue-4-use-api-567zw.ondigitalocean.app/api/v1/space?mark_as_favorite=true",
          {
            headers: {
              "scoped-auth": "SECRETS123",
            },
          },
        );

        const result = await response.json();
        console.log(result.data);
        // spaceDataStore.value = result.data.data
        await setSpaceData(result.data);
      } catch (error) {
        console.log(error);
      }
    }

    function addSpaceFunction() {
      let dateNow = new Date();
      let newValue = {
        _id: ++count.value,
        name: "New Function",
        space_photo: [
          {
            _id: "",
            filename: "",
            contentType: "image/png",
            size: 0,
            path: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
            description: "test",
            uploadedBy: "",
            createdAt: dateNow,
            updatedAt: null,
          },
        ],
        venue_photo: [],
        capacity_layout: [],
        guest_capacity: [],
        floor_plan: [],
        features: [],
        keywords: [],
        createdAt: dateNow,
        updatedAt: "",
        deletedAt: "",
        deletedBy: "",
        venue: "",
        marked_as_favorite: "",
      };
      spaceArray.value.push(newValue);
      addNewSpaceData(newValue);

      initPage();
      updatePage(page.value);
    }

    function setSpace(id) {
      setSelectedSpace(id);
      navigateTo({ name: "country-space-function", params: { country } });
    }

    function removeSpaceFunction(index) {
      spaceArray.value.splice(index, 1);
      initPage();
      updatePage(page.value);
    }

    function initPage() {
      listCount.value = spaceArray.value.length;
      if (listCount.value < pageSize.value) {
        historyList.value = spaceArray.value;
      } else {
        historyList.value = spaceArray.value.slice(0, pageSize.value);
      }
    }
    function updatePage(pageIndex) {
      let _start = (pageIndex - 1) * pageSize.value;
      let _end = pageIndex * pageSize.value;
      historyList.value = spaceArray.value.slice(_start, _end);
      page.value = pageIndex;
    }

    //CREATED
    getVenueSpace();
    initPage();
    updatePage(page.value);
    return {
      // DATA
      count,
      spaceArray,
      page,
      pageSize,
      listCount,
      historyList,

      // FUNCTIONS
      addSpaceFunction,
      removeSpaceFunction,
      initPage,
      updatePage,
      spaceData,
      setSpace,

      pages,
      getVenueSpace,
    };
  },
};
</script>

<style>
.plus-icon {
  position: absolute;
  font-size: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #38854f;
  transition: ease 0.3s;
}
.card-adding-room {
  transition: ease 0.3s;
  cursor: pointer;
}
.card-adding-room:hover .plus-icon {
  color: #16e654;
}
.card-adding-room:hover {
  opacity: 0.9;
}
</style>
