<template>
    <v-dialog v-model="deleteFolderDialog" max-width="430px" style="overflow-y:hidden;">
        <v-card rounded="lg" style="overflow-y:hidden;">
            <v-row class="pl-10 pr-7 pb-7 pt-10">
                <v-row>
                    <span class="font-500">{{`Are you sure to delete this ${props.folderName} folder?`  }}</span>
                </v-row>
                <v-row>
                    <span class="text-subtitle-2 font-300">{{`This folder consist of ${props.favoriteLength} venues, once you delete it you can't get it back`}}</span>
                </v-row>

                <v-row class="mt-5 mr-n10" no-gutters >
                    <v-col cols="4">

                    </v-col>
                    <v-col cols="4">
                    
                        <v-btn   @click="deleteFolderDialog=false">Nevermind</v-btn>
                   
                    </v-col>
                    <v-col cols="4">
                
                        <v-btn  color="secondary" @click="updateFolder()">Delete it</v-btn>
             
                    </v-col>

                </v-row>
            </v-row>
        </v-card>

    </v-dialog>
</template>

<script setup lang="ts">
const { deleteFavoriteFolder } = useFavorites()
const {country} = useLocal()
const props = defineProps({

    folderName:
    {
        type: String,
        required: true
    },
    favoriteLength: {
        type: Number,
        required: true
    },
    favoriteFolderId: {
        type: String,
        required: true
    }


})
const deleteFolderDialog = defineModel({ required: true });
const emit = defineEmits(['deletingFolder'])
async function updateFolder() {
   
    const favorite_folder_id = props.favoriteFolderId
    
    await deleteFavoriteFolder(favorite_folder_id as string).
        then(() => {
        emit('deletingFolder','folder has been deleted')
        })

  



}
</script>