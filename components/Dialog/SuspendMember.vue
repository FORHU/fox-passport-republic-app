<template>
  <v-dialog v-model="openSuspendDialog" :height="suspendConditional ? '230px' : '400px'" max-width="500">
    <v-card rounded="lg" height="100%" width="100%" style="overflow-y:hidden;">
      <v-row class="px-10 pt-7" style="max-height:75px;">
        <v-col cols="11">
          <v-row v-if="suspendConditional" justify="center" style="max-height:20px;" class="text-h6">{{
            props.suspendData.suspension_time != 'UNTIL_UNSUSPENDED' && props.suspendData.suspension_time != "REMOVE_SUSPENSION"? `Suspended until
            ${formatTimestamp(props.suspendData.suspension_time)}` : 'SUSPENDED' }} </v-row>
          <v-row v-else justify="center" style="max-height:20px;" class="text-h6">Suspend Member</v-row>
        </v-col>
        <v-col cols="1">
          <v-row class="pt-1" style="max-height:20px;" @click.stop="openSuspendDialog = false"
            role="button"><v-icon>mdi-close</v-icon></v-row>
        </v-col>
      </v-row>
      <v-divider class="my-1 mt-2" />
      <v-row class="px-10 pt-4 " :style="suspendConditional ? 'max-height:130px;' : 'max-height:200px;'">
        <v-col cols="2" justify="center" class="d-flex align-center justify-center">
          <ProfileAvatar :first_name="getFirstName()" :last_name="getLastName()"
            :img-src="props.suspendData.profile_picture" size="58px" class="mt-n10" />
        </v-col>
        <v-col cols="10">
          <v-row no-gutters class="w-100">{{ props.suspendData.name }}</v-row>
          <v-row no-gutters class="w-100">{{ props.suspendData.email }}</v-row>
          <v-row no-gutters class="w-100">{{ props.suspendData.contact }}</v-row>
        </v-col>
      </v-row>
      <v-divider class="mb-2" />
      <v-row role="button" justify="center" v-if="suspendConditional"
        class="px-10 pt-4 w-100 text-decoration-underline font-500">
        <span @click="unSuspendMember()">Unsuspend member</span>
      </v-row>
      <v-row v-else class="px-10 pt-2 w-100">
        <v-list width="100%">
          <v-list-item v-for="(item, index) in suspenseSelection" :key="index" :title="item.text"
            @click.stop="suspendSelect(item.value)" width="100%" class="my-n2"></v-list-item>
        </v-list>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  suspendData: {
    type: Object,
    default: false,
  },
})
const { setSnackbar } = useLocal()
const somethingWentWrongMessage = ref({
  modal: true,
  color: 'error',
  text: 'Something went wrong. Please try again later.'
})
const { suspendFunctionTeamMembers } = useTeamMembers()
const isSuspended = ref(null);
const openSuspendDialog = defineModel();
const suspenseSelection = ref([{ text: "For 1 hour", value: '1' }, { text: "For 6 hours", value: '6' }, { text: "For 12 hours", value: '12' }, { text: "For 24 hours", value: '24' }, { text: "Until I unsuspend it", value: 'UNTIL_UNSUSPENDED' }])
const emit = defineEmits(['suspending', 'unsuspending'])

async function suspendSelect(val) {
  const organization_member_id = props.suspendData._id
  const suspensionCondition = val
  try {
    const res = await suspendFunctionTeamMembers(organization_member_id as string, suspensionCondition as string)
    if (res) {
      emit("suspending")
      openSuspendDialog.value = false
    }
  }
  catch (err) {
    setSnackbar(somethingWentWrongMessage.value)
  } finally {

  }

}

function getFirstName() {
  const nameParts = props.suspendData.name.trim().split(' ');
  if (nameParts.length < 2) {
    return { firstName: '', lastName: '' };
  }
  const firstName = nameParts[0];
  return firstName
}
function getLastName() {
  const nameParts = props.suspendData.name.trim().split(' ');
  if (nameParts.length < 2) {
    return { firstName: '', lastName: '' };
  }
  const lastName = nameParts[nameParts.length - 1];
  return lastName;
}
onMounted(() => {
  isSuspended.value = props.suspendData.suspension_time
  // console.log(isSuspended.value)
  // console.log(props.suspendData.suspension_time)
})

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  // Get month, day, hours, and minutes
  const month = date.getMonth() + 1; // Months are 0-indexed
  const day = date.getDate();
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Convert hours to 12-hour format and determine AM/PM
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight

  // Pad minutes with leading zero if needed
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  // Return the formatted string
  return `${month}/${day}, ${hours}:${formattedMinutes}${ampm}`;
}
async function unSuspendMember() {
  const organization_member_id = props.suspendData._id
  const suspensionCondition = "REMOVE_SUSPENSION"
  try {
    const res = await suspendFunctionTeamMembers(organization_member_id as string, suspensionCondition as string)
    if (res) {
      emit("suspending")
      openSuspendDialog.value = false
    }
  }
  catch (err) {
    setSnackbar(somethingWentWrongMessage.value)
  } finally {

  }

}
const suspendConditional = computed(() => {
    if (props.suspendData.suspension_time && props.suspendData.suspension_time != "REMOVE_SUSPENSION") {
        return true
    }
    else  return false
})
</script>