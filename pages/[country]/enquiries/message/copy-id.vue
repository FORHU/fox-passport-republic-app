<template>
  <v-row class="pa-5 bg-primaryBG">
    <v-col cols="12">
      <v-row no-gutters class="text-secondary"
        ><v-btn
          variant="text"
          @click="
            navigateTo({ name: 'country-enquiries', params: { country } })
          "
        >
          < Back</v-btn
        ></v-row
      >
    </v-col>
    <v-col>
      <!-- ENQUIRY STATUS -->
      <v-card elevation="5" class="px-7 py-5 mb-5" rounded="lg">
        <v-row no-gutters align="center">
          <v-col>
            <v-row no-gutters class="text-primary font-weight-bold text-h6"
              >This booking is confirmed and paid</v-row
            >
            <v-row no-gutters class="text-caption"
              >Your ratings have significantly improved and you will receive
              more high quality enquiries from us.</v-row
            >
          </v-col>
          <v-col cols="3" class="text-secondary text-subtitle-2" align="end"
            ><v-icon color="secondary" class="mr-2">mdi-circle-medium</v-icon
            >Booking Confirmed</v-col
          >
        </v-row>
        <v-row>
          <v-col>
            <v-btn variant="flat" color="secondary" class="text-uppercase mr-5"
              >Create Custom Offer</v-btn
            >
            <v-btn variant="outlined" color="error" class="text-uppercase"
              >Cancel Booking</v-btn
            >
          </v-col>
        </v-row>
      </v-card>
      <!-- ENQUIRY STATUS -->

      <!-- CHAT BOX -->
      <v-card elevation="5" class="px-7 py-16" rounded="lg">
        <!-- CHAT BOX -->
        <v-row no-gutters class="d-flex flex-column ga-5">
          <EnquiryDetailsBox
            :customer-name="'Felicia'"
            :guests-count="60"
            event-type="Party"
            :space-name="'Entire Venue'"
            :venue-name="'Venue Name'"
            :date="'Saturday,  20 June 2024'"
            :time-from="'07:00'"
            :time-to="'18:00'"
            :own-catering="true"
            :time-stamp="'26/03/2024 11:36'"
          />

          <EnquirySentMessageBubble
            :message="'Hi Time and date still available for booking. you can see the full details here in tagvenue. Please check out social space profile. Thank you'"
            :time-stamp="'26/03/2024 11:36'"
          />

          <EnquiryReceivedMessageBubble
            :sender-name="'Felicia'"
            :message="'Subject: Inquiry Regarding Venue Availability on 25th May from 2 pm to 6 pm\n\nDear Harris John M.,\n\nI hope this email finds you well. My name is Zulafiq, and I am reaching out to inquire about the availability of your venue on the 25th of May from 2 pm to 6 pm.\n\nWe are planning a birthday party and your venue is our preferred choice. Could you please provide information on whether the venue is available during the specified time, and if so, any relevant details regarding booking procedures, pricing, and terms?\n\nThank you for your time and assistance. I look forward to your prompt response.'"
            :time-stamp="'26/03/2024 11:36'"
          />
          <EnquiryContactNumberBox
            :customer-name="'Felicia'"
            :contact-name="'Harris John Manrique'"
            :time-stamp="'26/03/2024 11:36'"
            :contact-number="'+65 94236187'"
          />
          <EnquiryBookingBox
            :customer-requested-to-book="true"
            :customer-name="'Felicia'"
            :guests-count="60"
            event-type="Party"
            :space-name="'Entire Venue'"
            :venue-name="'Venue Name'"
            :date="'Saturday,  20 June 2024'"
            :time-from="'07:00'"
            :time-to="'18:00'"
            :own-catering="true"
            :time-stamp="'26/03/2024 11:36'"
            :total-cost="'S$300'"
          />

          <EnquiryBookingBox
            :owner-approved-request="true"
            :owner-name="'Harris John Manrique'"
            :customer-name="'Felicia'"
            :guests-count="60"
            event-type="Party"
            :space-name="'Entire Venue'"
            :venue-name="'Venue Name'"
            :date="'Saturday,  20 June 2024'"
            :time-from="'07:00'"
            :time-to="'18:00'"
            :own-catering="true"
            :time-stamp="'26/03/2024 11:36'"
            :total-cost="'S$300'"
          />
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea
              no-resize
              v-model="inputMessage"
              :row="5"
              placeholder="Type a message"
              variant="solo"
              hide-details
            ></v-textarea>
          </v-col>
          <v-row no-gutters class="mx-2" justify="space-between">
            <v-col cols="4">
              <v-btn color="secondary">Use Template</v-btn>
              <v-btn color="secondary" class="ml-3">Attach Files</v-btn>
            </v-col>
            <v-col cols="2" align="end">
              <v-btn color="primary">Send Message</v-btn>
            </v-col>
          </v-row>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="3">
      <v-card elevation="5" class="pa-5 py-10" rounded="lg">
        <v-row no-gutters align="center">
          <v-col cols="2">
            <v-avatar size="50px">
              <v-icon icon="mdi-account-circle" size="50px"></v-icon>
            </v-avatar>
          </v-col>
          <v-col>
            <v-row
              no-gutters
              class="text-h5 font-weight-bold"
              style="line-height: 1.2"
              >Felicia</v-row
            >
            <v-row
              no-gutters
              class="text-medium-disabled text-subtitle-2"
              style="line-height: 1.2; opacity: 60%"
              >felicia123124@reply.com</v-row
            >
          </v-col>
        </v-row>
        <v-row no-gutters class="d-flex flex-column ga-5 my-7">
          <v-col cols="12" class="text-subtitle-1 font-weight-black"
            >Event Details</v-col
          >
          <v-col cols="12" class="text-subtitle-1 font-weight-black"
            >Party for 60 guests</v-col
          >
          <v-row no-gutters>
            <v-col
              cols="12"
              class="text-subtitle-1 font-weight-black"
              style="line-height: 1.2"
              >Space</v-col
            >
            <v-col
              cols="12"
              class="text-subtitle-1 font-weight-regular"
              style="line-height: 1.2"
              >{{ "Entire Venue" }} at {{ "Venue Name" }}</v-col
            >
          </v-row>
          <v-row no-gutters>
            <v-col
              cols="12"
              class="text-subtitle-1 font-weight-black"
              style="line-height: 1.2"
              >Date and Time</v-col
            >
            <v-col
              cols="12"
              class="text-subtitle-1 font-weight-regular"
              style="line-height: 1.2"
              >Thursday, 28 March 2024 at 9AM-6PM</v-col
            >
          </v-row>
          <v-row no-gutters>
            <v-col
              cols="12"
              class="text-subtitle-1 font-weight-black"
              style="line-height: 1.2"
              >Catering</v-col
            >
            <v-col
              cols="12"
              class="text-subtitle-1 font-weight-regular"
              style="line-height: 1.2"
              >I want to bring my own catering</v-col
            >
          </v-row>
        </v-row>
        <v-divider class="my-3"></v-divider>

        <v-row no-gutters>
          <v-col
            cols="12"
            class="text-subtitle-1 font-weight-black"
            style="line-height: 1.2"
            >Client Paid</v-col
          >
          <v-row
            no-gutters
            class="w-100 text-subtitle-1 font-weight-regular d-flex justify-space-between"
          >
            <span>S$66 x 5 hours</span>
            <span>S$330</span>
          </v-row>
          <v-row
            no-gutters
            justify="space-end"
            class="w-100 mt-5 text-subtitle-1 font-weight-regular"
          >
            <v-col class="font-weight-bold">Total:</v-col>
            <v-col align="end">S$330</v-col>
            <v-col cols="12" align="end" style="opacity: 40%"
              >{{ withGST ? 'GST included' : '' }}</v-col
            >
          </v-row>
        </v-row>

        <v-divider class="my-3"></v-divider>
      </v-card>
    </v-col>
  </v-row>
  <!-- <v-row no-gutters style="height: 100%; width: 1200px; margin: auto;">
    <v-col cols="8">
      <v-row>
        <v-col cols="12" class="pl-10 pt-10 pb-4">
          <v-card class="">
            <v-card-text>
              <v-row class="booking-info">
                <v-col cols="10">
                  <div class="booking-details">
                    <header class="text-primary text-h6">This booking is confirmed and paid</header>
                    <p class="text-subtitle-2">Your ratings have significantly improved and you will receive more high quality enquiries from us.</p>
                  </div>
                </v-col>
                <v-col cols="2">
                  <div class="status-indicator"><div class="status-circle"></div></div>
                  <p class="status-message">Booking Confirmed</p>
                </v-col>
              </v-row>
              <v-row class="booking-actions">
                <v-col>
                  <v-btn :to="{ name: 'country-enquiries-review-booking', params: { country, id}, id: enquiry?enquiry._id:''}" class="" color="secondary">Review booking details</v-btn>
                  <v-btn class="mx-5" color="primary">Update booking</v-btn>
                  <v-btn class="" @click="openCancelBooking()" color="error" variant="outlined">Cancel booking</v-btn>
                  <ModalArchiveEnquiry v-model="cancelBookingDialog"/>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="pl-10 pt-4 pb-10">
          <v-card class="">
            <v-card-title>Chat</v-card-title>
            <v-divider></v-divider>
            <v-card-text style="height: 600px; overflow-y: scroll; position: relative">
              <div
                v-for="(message, index) in messages"
                :key="index"
              >
                <div class="d-flex flex-column" :class="message.sender.first_name == currentUser.first_name? 'text-right align-end' : message.admin_generated? 'text-center align-center' : 'text-left align-start'">
                  <div class="d-flex" :class="message.sender.first_name == currentUser.first_name? 'justify-end': message.admin_generated? 'justify-center' :'flex-row-reverse align-center'">
                    <v-card style="width: fit-content; max-width: 80%;" :class="message.sender.first_name == currentUser.first_name? 'd-flex justify-end': message.admin_generated? 'd-flex justify-center border':''">
                      <v-card-text no-gutters  class="pa-3">
                        <p >{{ message.content }}</p>
                      </v-card-text>
                    </v-card>
                    <v-avatar v-if="!message.admin_generated" size="40px" :class="message.sender.first_name == currentUser.first_name?'ml-3':'mr-3'" class="border">
                      <v-img
                        alt="avatar"
                        src="https://avatar.amuniversal.com/user_avatars/avatars_gocomicsver3/3264000/3264845/2.jpg"
                      ></v-img>
                    </v-avatar>
                  </div>
                  <p class="text-caption d-flex mt-2 mb-5" :class="message.admin_generated? 'text-right justify-end':message.sender.first_name == currentUser.first_name?'mr-13':'ml-13'" color="grey">{{ getChatCreated(message.createdAt) }}</p>
                </div>
              </div>
              <v-btn v-if="totalItems > messageLimit" style="position: relative; left: 43%; right: 43%; width: fit-content;" variant="outlined" class="ml-2" color="secondary" @click="loadMoreMessages()">Load More</v-btn>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="d-flex align-center justify-center ma-auto">
              <v-text-field
                v-model="newMessage"
                label="Type a message"
                style="width:100%"
                hide-details
              ></v-text-field>
              <v-spacer></v-spacer>
              <v-btn variant="outlined" class="ml-2" color="primary" @click="sendMessage">Send</v-btn>
            </v-card-actions>
            <v-row no-gutters class="pl-2 pb-2">
              <v-col cols="3">
              <v-btn @click="openMessageTemplate()" density="compact" color="black">Use Template</v-btn>
              <ModalChatTemplateModal @exitDialog="exitDialog" v-model="messageTemplateDialog" />
              </v-col>
              <v-col cols="3">
              <v-btn density="compact" color="black">Attach Files</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="4" class="pl-8 py-7 pr-10">
      <v-card class="">
        <v-card-text>
          <v-row no-gutters class="mt-5">
            <v-col cols="2" class="d-flex align-center">
              <v-avatar size="40px" class="border">
                <v-img
                  alt="avatar"
                  src="https://avatar.amuniversal.com/user_avatars/avatars_gocomicsver3/3264000/3264845/2.jpg"
                ></v-img>
              </v-avatar>
            </v-col>
            <v-col cols="10">
              <p class="text-subtitle-1 font-weight-bold">{{ enquiry? enquiry.user.first_name: '' }} {{ enquiry? enquiry.user.last_name: '' }}</p>
              <p v-if="enquiry" class="text-caption d-flex align-center"><v-icon class="pr-2">mdi-email-outline</v-icon>{{ enquiry.user.email }}</p>
            </v-col>
          </v-row>
          <v-divider class="my-5"></v-divider>
          <v-row no-gutters>
            <v-col cols="12" v-if="enquiry">
              <p class="text-subtitle-1 font-weight-bold">Event Details</p>
              <p v-if="enquiry && enquiry.type != null && enquiry.guests != null" class="text-subtitle-2 font-weight-bold mt-5 mb-1">{{ enquiry.type }} for {{ enquiry.guests }} guests</p>
              <p v-if="enquiry.space" class="text-subtitle-2 font-weight-bold mt-5 mb-1">Space</p>
              <p v-if="enquiry.space && enquiry.space.name != null" class="text-subtitle-2 text-decoration-underline" style="text-transform: capitalize;">{{ enquiry.space.name }}</p>
              <p v-if="enquiry.venue && enquiry.venue.name != null" class="text-subtitle-2 text-decoration-underline">at {{ enquiry.venue.name }}</p>
              <p class="text-subtitle-2 font-weight-bold mt-5 mb-1">Date and Time</p>
              <p v-if="enquiry.date && enquiry.date.timestamp != null" class="text-subtitle-2">{{ getDateSet(enquiry.date.timestamp) }}</p>
              <p v-if="enquiry.date && enquiry.date.from != null && enquiry.date.to != null" class="text-subtitle-2"> at {{ enquiry.date.from }} - {{ enquiry.date.to }}</p>
              <p class="text-subtitle-2 font-weight-bold mt-5 mb-1">Cafeteria</p>
              <p class="text-subtitle-2">{{ enquiry.own_catering? 'I want to bring my own catering' : 'I don\'t have a catering' }}</p>
            </v-col>
          </v-row>     
          <v-divider class="my-5"></v-divider>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="text-subtitle-1 font-weight-bold">Client Paid</p>
              <v-row no-gutters v-if="enquiry">
                <v-col cols="6">
                  <p v-if="enquiry.date.from != null && enquiry.date.to != null" class="text-subtitle-2">S$66{{ getTimeSet(enquiry.date.from, enquiry.date.to) }}</p>
                  <p class="text-subtitle-2 font-weight-bold mt-5">TOTAL</p>
                </v-col>
                <v-col cols="6" v-if="enquiry">
                  <p v-if="enquiry.value != null" class="text-subtitle-2 text-right">S{{ enquiry.value.toLocaleString("en-US", {style:"currency", currency:"USD"}) }}</p>
                  <p v-if="enquiry.value != null" class="text-subtitle-2 text-right mt-5">S{{ enquiry.value.toLocaleString("en-US", {style:"currency", currency:"USD"}) }}</p>
                  <p class="text-subtitle-2 text-right mb-5">(GST Included)</p>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row> -->
</template>

<script setup>
const { country } = useLocal();
const { withGST } = useTax();
// const { currentUser } = useLocalAuth();
// const days = ref(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
// const month = ref(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])

// function getDateSet(date) {
//   let dateNow = new Date(date)
//   return `${days.value[dateNow.getDay()]}, ${dateNow.getDate()} ${month.value[dateNow.getMonth()]} ${dateNow.getFullYear()}`
// }
// function getChatCreated(date) {
//   let dateNow = new Date(date)
//   return `${dateNow.getDate()}/${dateNow.getMonth()}/${dateNow.getFullYear()} ${dateNow.getHours()}:${dateNow.getMinutes()}`
// }
// function getTimeSet(from, to) {
//   let dateNow = new Date();
//   let fromSplit = from.split(":")
//   let toSplit = to.split(":")

//   let setHourFrom = dateNow.setHours(fromSplit[0])
//   let setMinutesFrom = new Date(setHourFrom).setMinutes(fromSplit[1])

//   let setHourTo = dateNow.setHours(toSplit[0])
//   let setMinutesTo = new Date(setHourTo).setMinutes(fromSplit[1])

//   let getHourFrom = new Date(setMinutesTo).getHours() - new Date(setMinutesFrom).getHours()
//   return ` x ${getHourFrom} hours`
// }
// let cancelBookingDialog = ref(false)
// let messageTemplateDialog = ref(false)
// const chatContent = ref([])
// const chatDescription = ref([])

// const { enquiriesStore } = useEnquiriesStore()
// const { messages } = useChatStore()

// const enquiry = ref(null)
// const newMessage = ref("")

// const messageDataList = computed(() => messages.reverse())
const openCancelBooking = () => {
  cancelBookingDialog.value = true;
};
const openMessageTemplate = () => {
  messageTemplateDialog.value = true;
};
function exitDialog() {
  messageTemplateDialog.value = false;
}
</script>

<script>
import { useEnquiriesStore } from "~/store/enquiries";
import { useSessionStore } from "~/store/session";
import { useChatStore } from "~/store/chat";
import { SOCKET_EVENTS } from "~/utils/constant";

// export default {
//   data: () => ({
//     enquiry: null,
//     enquiriesStore: useEnquiriesStore(),
//     socketStore: useChatStore(),
//     sessionStore: useSessionStore(),
//     newMessage: "",
//     messageLimit: 10
//   }),
//   computed: {
//     isAuthenticated() {
//       return useSessionStore().isAuthenticated;
//     },
//     messages() {
//       return useChatStore().messages.sort(function (a, b) {
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       });
//     },
//     totalItems() {
//       return useChatStore().total_items
//     }
//   },
//   methods: {
//     getMessageClass(sender) {
//       return {
//         "sent-by-current-user": sender?._id === this.sessionStore.userData?._id,
//         "sent-by-other-user": sender?._id !== this.sessionStore.userData?._id,
//       };
//     },
//     async handleGetEnquiries() {
//       try {
//         const enquiry_id = this.$route.params.id;
//         const { data } = await this.enquiriesStore.getEnquiries(this.$axios, {
//           enquiry_id,
//         });
//         this.enquiry = data.data[0];
//         console.log("HELLO ENQ", this.enquiry);
//       } catch (error) {
//       }
//     },
//     async sendMessage() {
//       if (!this.newMessage.trim()) return;
//       this.socketStore.emitChat(SOCKET_EVENTS.SEND_MESSAGE_ROOM, {
//         room_id: this.enquiry?.inbox?.room_id,
//         message: this.newMessage,
//       });
//       this.newMessage = "";
//       await this.handleGetEnquiries();
//       this.joinRoom()
//     },
//     async joinRoom() {
//       const config2 = useRuntimeConfig().public;
//       const room_id = this.enquiry?.inbox?.room_id;
//       await this.socketStore.init(this.$axios, this.messageLimit, this.enquiry?.inbox?.room_id);
//       await this.socketStore.connect(config2);
//       await this.socketStore.emitChat(SOCKET_EVENTS.JOIN_ROOM, { room_id });
//     },
//     async loadMoreMessages() {
//       this.messageLimit += 10;

//       await this.socketStore.init(this.$axios, this.messageLimit, this.enquiry?.inbox?.room_id);
//       // this.joinRoom()
//     }
//   },
//   async mounted() {
//     await this.handleGetEnquiries();
//     await this.joinRoom();
//   },
//   created() {
//     console.log("HELLO", this.enquiry);
//     // get space list
//     // if (!this.isAuthenticated) this.$router.push("/");
//   },
// };
</script>
<style>
.sent-by-current-user {
  background-color: #c9e6c9;
}

.sent-by-other-user {
  background-color: #f0f0f0;
}
</style>
