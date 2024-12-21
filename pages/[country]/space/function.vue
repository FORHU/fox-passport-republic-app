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
          <v-row no-gutters>
            <v-col cols="12">
              <v-form ref="funcForm">
                <v-text-field
                  no-gutters
                  v-model="functionName"
                  label="Function Name"
                  placeholder="Input Function Name"
                  :rules="inputRules"
                  class="mt-8"
                ></v-text-field>
                <v-text-field
                  no-gutters
                  v-model="functionType"
                  label="Function Type"
                  placeholder="Input Function Type. e.g. Photo Studio, Restaurant in a hotel"
                  :rules="inputRules"
                  class="mt-8"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="text-left">
              <h4 class="font-weight-bold">
                Which section of the venue does this function correspond to?
              </h4>
              <h4 class="font-weight-bold text-subtitle-2">
                Inform customers whether the space is exclusive or will be
                shared with other guests.
              </h4>
            </v-col>
          </v-row>

          <v-row no-gutters class="mt-5">
            <v-col cols="12" class="d-flex justify-center">
              <div
                class="function-category"
                @click="selectedFunctionCateg(1)"
                :style="
                  functionCateg == 1
                    ? 'background-color:rgba(13,64,58, 0.8);'
                    : ''
                "
              >
                <h4 class="font-weight-bold">The entire Establishment</h4>
                <img
                  src="/images/space/space-full.svg"
                  alt="Logo 2"
                  class="logo-image"
                  width="40px"
                />
              </div>
              <div
                class="function-category"
                @click="selectedFunctionCateg(2)"
                :style="
                  functionCateg == 2
                    ? 'background-color:rgba(13,64,58, 0.8);'
                    : ''
                "
              >
                <h4 class="font-weight-bold">Private Funtion within Venue</h4>
                <img
                  src="/images/space/space-priv.svg"
                  alt="Logo 2"
                  class="logo-image"
                  width="40px"
                />
              </div>
              <div
                class="function-category"
                @click="selectedFunctionCateg(3)"
                :style="
                  functionCateg == 3
                    ? 'background-color:rgba(13,64,58, 0.8);'
                    : ''
                "
              >
                <h4 class="font-weight-bold">
                  Partial privacy within the area
                </h4>
                <img
                  src="/images/space/space-partial-priv.svg"
                  alt="Logo 2"
                  class="logo-image"
                  width="40px"
                />
              </div>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-5">
            <v-col cols="12" class="d-flex justify-center">
              <div
                class="function-category"
                @click="selectedFunctionCateg(4)"
                :style="
                  functionCateg == 4
                    ? 'background-color:rgba(13,64,58, 0.8);'
                    : ''
                "
              >
                <h4 class="font-weight-bold">Shared Function</h4>
                <img
                  src="/images/space/space-shared.svg"
                  alt="Logo 2"
                  class="logo-image"
                  width="40px"
                />
              </div>
              <div
                class="function-category"
                @click="selectedFunctionCateg(5)"
                :style="
                  functionCateg == 5
                    ? 'background-color:rgba(13,64,58, 0.8);'
                    : ''
                "
              >
                <h4 class="font-weight-bold">Private outdoor Function</h4>
                <img
                  src="/images/space/space-priv-out.svg"
                  alt="Logo 2"
                  class="logo-image"
                  width="40px"
                />
              </div>
              <div
                class="function-category"
                @click="selectedFunctionCateg(6)"
                :style="
                  functionCateg == 6
                    ? 'background-color:rgba(13,64,58, 0.8);'
                    : ''
                "
              >
                <h4 class="font-weight-bold">Semi-private outdoor Function</h4>
                <img
                  src="/images/space/space-semi-priv-out.svg"
                  alt="Logo 2"
                  class="logo-image"
                  width="40px"
                />
              </div>
            </v-col>
          </v-row>

          <v-row nogutters>
            <v-col cols="12" class="text-left">
              <h4 class="font-weight-bold">Function Description</h4>
              <v-textarea
                label="Description"
                placeholder="Input description here"
                v-model="functionDescription"
                auto-grow
              ></v-textarea>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
    <VenuePagination />
  </div>
</template>

<script>
export default {
  setup() {
    //IMPORT
    const { requiredInput } = useUtils();
    const { spaceDataStore, spaceSelectedDataStore, setSelectedSpace } =
      useLocal();
    // const { country } = useLocal();

    //DATA
    let functionName = ref("");
    let functionType = ref("");
    let functionDescription = ref("");
    let functionCateg = ref("");
    let inputRules = ref([requiredInput]);
    //WATCHERS

    //COMPUTED

    //METHODS
    function selectedFunctionCateg(data) {
      functionCateg.value = data;
    }

    //CREATED

    return {
      // DATA
      functionName,
      functionType,
      inputRules,
      functionDescription,
      functionCateg,
      // FUNCTIONS
      selectedFunctionCateg,
    };
  },
};
</script>

<style scoped>
.function-category {
  background-color: rgba(13, 64, 58, 1);
  border-radius: 8px;
  width: 250px;
  height: 150px;
  padding: 10px 10px;
  text-align: left;
  margin: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}
</style>
