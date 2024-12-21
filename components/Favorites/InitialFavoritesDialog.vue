<template>
    <v-dialog max-width="500" v-model="favoritesDialog">
        <!-- <FavoritesCreateFolderDialog v-model="createFolderDialog"/> -->
        <!-- <FavoritesAddToFavorites v-model="addToFavoritesDialog"/> -->
    </v-dialog>
</template>

<script setup lang="ts">
const favoritesDialog = defineModel({ required: true });
const createFolderDialog = ref(false)
const addToFavoritesDialog = ref(false)
const {getGroupOfFavorites} = useFavorites()


onMounted(async() => {
  const { data }: { data: any } = await getGroupOfFavorites()
  console.log(data.value.results.length, 'data')
  if (data.value.results.length == 0) {
    createFolderDialog.value = true
  }
  if (data.value.results.length > 0) {
    addToFavoritesDialog.value = true
  }
});

</script>