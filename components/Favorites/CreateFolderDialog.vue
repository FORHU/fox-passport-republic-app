<template>
    <v-dialog v-model="createFolderDialog"  max-width="500">
        <v-card class="fill-height fill-width" style="overflow:hidden;">
            <v-row class="py-6">
                <v-col cols="11">
                    <v-row justify="center" class="font-weight-bold">
                        Create favorites folder
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-row >
                        <v-icon class="ml-n4" @click="createFolderDialog=false" size="small">mdi-close</v-icon>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider/>
            <v-row class="font-weight-bold px-10 pt-10 pb-2">
                    Name
            </v-row>
            <v-row class="px-10 pb-8">
                <v-text-field v-model="folderName" 
                 :rules="[rules.required]"
                 :counter="50">
                    <template v-slot:counter="{counter}">
                        {{ `${counter} characters` }}
                    </template>
                </v-text-field>
            </v-row>
            <v-divider class="py-5"/>
            <v-row class="px-8 pb-5" no-gutters>
                <v-col cols="1" class="d-flex justify-center align-center">
                    <v-row no-gutters class="ml-2">
                    <!-- <span @click="folderName=''">Clear</span> -->
                    <v-btn @click="folderName=''" variant="flat">Clear</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="11">
                    <v-row justify="end" no-gutters>
                        <v-btn color="secondary" @click="createFolder()">Create</v-btn>
                    </v-row>
                </v-col>

            </v-row>
        </v-card>

    </v-dialog>
</template>

<script setup lang="ts">
const createFolderDialog = defineModel({ required: true });
const{addNewFavoriteFolder,updateFavoritesFolderName} = useFavorites()
const folderName = ref('')
const props = defineProps({
    space_id: {
        type: String,
        required: true,
    },
    changingFolder: {
        type: Boolean,
        required:false
    },
    favoriteIdValue: {
        type: String,
        required: false,
    }
})
const rules = {
  required: (value) => !!value || 'This field is required'
}
const emit = defineEmits(["createFolder",'folderCreated','folderCreatedNew']);

const createFolder = async () => {
    if(folderName.value.trim() === ''){
        return
    }
    let spaceId = props.space_id
    let folder_name = folderName.value
    if (props.changingFolder && props.changingFolder == true) {
        // await updateFavoritesFolderName()
        const spaceId = props.space_Id
        const folder_name = folderName.value
        const favoriteId = props.favoriteIdValue
        await updateFavoritesFolderName(spaceId as string, folder_name as string, favoriteId as string)
    }
    else {
        await addNewFavoriteFolder(spaceId as string, folder_name as string);
    }
    
    emit('folderCreated', "sample creation")
    emit('folderCreatedNew',"new create folder")
    createFolderDialog.value = false
   
}



</script>