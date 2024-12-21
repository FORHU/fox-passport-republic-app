<template>
    <v-dialog v-model="renameFolderDialog"  max-width="500">
        <v-card class="fill-height fill-width" style="overflow:hidden;">
            <v-row class="py-6">
                <v-col cols="11">
                    <v-row justify="center" class="font-weight-bold">
                        Rename favorites folder
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-row >
                        <v-icon @click="renameFolderDialog=false" size="small">mdi-close</v-icon>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider/>
            <v-row class="font-weight-bold px-10 pt-10 pb-2">
                    Name
            </v-row>
            <v-row class="px-10 pb-8">
                <v-text-field v-model="folderNameNew" 
                 :rules="validationRules"
                 :error-messages="errorMessages"
                 :counter="50">
                    <template v-slot:counter="{counter}">
                        {{ `${counter} characters` }}
                    </template>
                </v-text-field>
            </v-row>
            <v-divider class="py-5"/>
            <v-row class="px-10 pb-5">
                <v-col cols="1">
                    <v-row>
                    <span @click="folderNameNew=''">Clear</span>
                    </v-row>
                </v-col>
                <v-col cols="11">
                    <v-row justify="end">
                        <v-btn color="secondary" @click="updateFolder()">Save</v-btn>
                    </v-row>
                </v-col>

            </v-row>
        </v-card>

    </v-dialog>
</template>



<script setup lang="ts">
const renameFolderDialog = defineModel({ required: true });

const {renameFavoriteFolder} = useFavorites()

const props = defineProps({

    folderName: {
        type: String,
        required:true
    },
    favoriteFolderId: {
         type: String,
        required:true
    }

})
const folderNameNew = ref(props.folderName)
const errorMessages = ref([]);


const validationRules = computed(() => [
  value => !!value || 'This field is required',
  value => value !== props.folderName || 'The folder names must not match'
]);
const emit = defineEmits(["folderRenamed"]);
async function updateFolder() {
     errorMessages.value = [];
     const validationResult = validationRules.value.map(rule => rule(folderNameNew.value));
        const isValid = validationResult.every(result => result === true);
        // Check if any validation failed
       
  if (!isValid) {
    // Set error messages
    errorMessages.value = validationResult.filter(result => result !== true);
    return; // Stop the function if validation fails
  }
  
    if (folderNameNew.value == props.folderName) { 
        return
    }
    let folder_name = folderNameNew.value
    let favorite_folder_id = props.favoriteFolderId
    console.log(favorite_folder_id)
    
    await renameFavoriteFolder(favorite_folder_id as string, folder_name as string)
        .then(() => {
            emit('folderRenamed', folderNameNew.value)
            renameFolderDialog.value = false
        
    })
}
</script>