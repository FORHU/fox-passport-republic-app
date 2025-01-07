<template>
    <v-row :class="smAndDown?'pa-5 pt-10':'pa-15 pt-10'">
        <v-row class='pa-10 w-100'   no-gutters>
            <v-col cols="12" sm="12" md="6" lg="6" >
                <v-row class="pa-10">
                <v-row no-gutters class="w-100 text-h3 pt-10 h-40 font-600" justify="left"> 
                    <v-col cols="12" sm="12" md="12" lg="12">
                    <v-row :class="smAndDown?'pt-5 w-100 text-center d-flex align-center justify-center':'pt-5 w-100'">
                    Showcase Your Venue to Ready-to-Book Clients
                    </v-row>
                    </v-col>
                    <v-col ></v-col>
                </v-row>
                <v-row :class="smAndDown?'pt-5 w-100 text-center d-flex align-center justify-center':'pt-5 w-100'">
                    Easily connect with clients looking for the perfect space
                </v-row>
                <v-row :class="smAndDown?'pt-5 w-100 text-center d-flex align-center justify-center':'pt-5 w-100'">
                    <v-btn @click="goToLanding()" color="primary" variant="flat">Get Started</v-btn>
                </v-row>
                </v-row>
            </v-col>
          
            <v-col cols="2">
               
            </v-col>

            <v-col cols="12" sm="12" md="4" lg="4" v-if="!smAndDown">
                <v-row >
                    <v-col cols="6" style="position:relative;" > 
                        <v-img  class=" mr-3 mb-3 imageFirst"  width="140px" height="140px" src="/public/images/list-your-venue/studio1.png" rounded="lg"/> 
                    </v-col>
                    <v-col cols="6" >
                        <v-img  width="195px" height="195px" rounded="lg" src="/public/images/list-your-venue/cafe1.png" />
                    </v-col>
                    <v-col cols="6"  >    
                        <v-img  class="ml-auto"  width="195px" height="195px" rounded="lg" src="/public/images/list-your-venue/bars1.png" />
                    </v-col>
                     <v-col cols="6"  style="position:relative;">
                        <v-img :class="lg?'imageLast':''" width="140" height="140" src="/public/images/list-your-venue/table1.png" rounded="lg"/>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>



        <v-row class="pa-10 mt-15 ">
            <v-row class="w-100 text-h5 font-600 text-center d-flex align-center justify-center" justify="center">
                Your Venue, Their Perfect Match
            </v-row>
             <v-row class="w-100 pt-5 text-center d-flex align-center justify-center" justify="center">
                Whether it's for private parties, corporate gatherings, meetings, or creative shoots—you control the bookings that suit your space.Showcase your venue to thousands of event planners actively looking for places like yours.
            </v-row>
            <v-row class="w-100 pt-5 text-h5 font-600 text-center d-flex align-center justify-center" justify="center">
                Over 10,000 events successfully booked every year
            </v-row>
        </v-row>


        <v-row class="pa-10 mt-15 w-100">
            <v-row class="w-100 pl-10 pr-10">
                <v-col cols="12" sm="12" md="3" lg="3">
                    <v-row :class="!smAndDown?'text-h5 font-600':'text-h5 font-600 text-center d-flex'">
                        Monetize Your Space with Venue4use
                    </v-row>
                </v-col>
            </v-row>



           
                <v-row class="w-100" >
                    <v-col cols="12" sm="6" md="6" lg="6">
                        <v-row :class="!smAndDown ?'pl-8 pr-10':''" >
                            <v-col v-for="(item,index) in displayData" :key='index' cols="12">
                                <v-card variant="flat"  width='100%' height="100%" color="#F7F7F8">
                                    <v-row class="pa-5 d-flex align-center justify-center" align="center" justify="center" >
                                        <v-col cols="2">
                                            <v-row no-gutters class="pa-3 d-flex align-center justify-center" justify="center" align="center" >
                                                <v-card variant="flat" rounded="sm" height='50px' max-width="100%" class="pa-5 ">
                                                   <v-row justify="center" align="center" class=" font-400 text-h6 text-center">
                                                    {{ item.num }}
                                                   </v-row>
                                                </v-card>
                                            </v-row>
                                           
                                        </v-col>
                                        <v-col>
                                            <v-row no-gutters class="pa-5">
                                                <v-row class="font-600">
                                                   {{ item.title }}
                                                </v-row>
                                                <v-row class="pt-2">
                                                    {{item.description}}
                                                </v-row>

                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-col>

                    <v-col cols="12" sm="6" md="6" lg="6" align="center" justify="center" class="d-flex align-center justify-center">
                        <v-row align="center" justify="center" class="d-flex align-center justify-end mt-15" >
                            <v-col cols="12">
                            <v-row align="center" justify="center" class="d-flex align-center justify-center">
                                <v-card  variant="flat" :width="smAndDown?'100%':'60%'" class="d-flex align-center justify-center">
                                    <v-img min-height="650px" rounded="sm" cover src="/public/images/list-your-venue/outdoorspace1.png" />
                                </v-card>
                            </v-row>
                            </v-col>
                        </v-row>
                    </v-col>


                </v-row>



            
        </v-row>

        <v-row class="pa-n15 w-100">
            <v-sheet color="#F7F7F8" width='100%' height="100%">
                <v-row class="pa-15" no-gutters >
                <v-row class=" text-h5 font-600 w-100" justify="center">
                    Diverse Venues, Unique Spaces
                </v-row>
                <v-row class="text-center d-flex align-center justify-center pt-2 pb-5" align="center" justify="center">
                    We cater to all types of venues, from local bars and meeting rooms to industrial lofts and prestigious locations. With thousands of venues globally, we celebrate diversity and uniqueness.
                </v-row>

                <v-row no-gutters class="mt-10 w-100">
                <v-col v-for="(item,index) in diverseVenues" :key="index" cols="12" sm="12" md="4" lg="3" class="pt-5">
                    <v-row  justify="center">
                        <v-img
                        cover
                        height="200px"
                        max-width="250px"
                        rounded="lg"
                        :src="item.image"
                        />
                    </v-row>
                    <v-row class="pb-6 pt-1 font-weight-bold text-subtitle-2" justify="center">
                        {{ item.category }}
                    </v-row>
                </v-col>
                </v-row>


                 <v-row class="w-100 text-h6 pt-10" justify="center">
                    and many more
                </v-row>
            </v-row>
            </v-sheet>
        </v-row>


        <v-row class="text-h6 mt-10 pt-10 w-100" justify="center">
            FAQ's
        </v-row>



        <v-row class="text-h6 mt-10 pt-10 w-100 pa-10 mb-10">
            <v-expansion-panels flat>
                <v-expansion-panel v-for="(item,index) in faqsdata" :key="index" :text="item.answer" :title="item.question">

                </v-expansion-panel>
            </v-expansion-panels>
        </v-row>
       

    <v-row no-gutters class="py-10 px-10" align="center">
    <v-col color="12">
      <v-card class="venue-card rounded-lg overflow-hidden">
        <v-img
          src="/images/landingpage/background-cta.png"
          height="500"
          width="100%"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
          cover
        >
          <v-container class="fill-height pa-0">
            <v-row align="center" justify="center" no-gutters>
              <v-col cols="12" sm="10" md="8" lg="8" class="text-center px-6">
                <h2 class="text-h4 text-sm-h3 font-weight-bold text-white mb-4">
                  Join Venue4use today
                </h2>
               
                <NuxtLink :to="`/${country}/signup/venue`">
                  <v-btn
                    class="mt-4 mx-auto text-black"
                    style="
                      border-radius: 8px;
                      padding: 17px 34px;
                      width: 195px;
                      height: 50px;
                      background-color: white;
                      gap: 10px;
                    "
                  >
                    List Your Venue
                  </v-btn>
                </NuxtLink>
              </v-col>
            </v-row>
          </v-container>
        </v-img>
      </v-card>
    </v-col>
  </v-row>
    </v-row>


    
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify"
const { country } = useLocal()
const {smAndDown,lg} = useDisplay()
const displayData = ref([
    {
        num: '1',
        title: 'List your space for free',
        description: 'No listing fees, ever. Create a profile, add your spaces, and set your prices with ease.',
    },
    {
        num: '2',
        title: 'Control Availability, Rules, and Event Types',
        description: 'Whether on weekdays, weekends, or specific event types, you decide. Sync your calendar to manage availability seamlessly.',
    },
    {
        num: '3',
        title: 'Engage and Quote',
        description: 'Chat with customers, provide price quotes, and get notifications of new requests. Respond directly from your mailbox, our messenger, or by phone.',
    },
    {
        num: '4',
        title: 'Secure Bookings and Collect Reviews',
        description: 'Convert bookings quickly and receive positive reviews. Satisfied customers keep you at the top of search results, maximizing your exposure.',
    },
    {
        num: '5',
        title: 'A Win-Win Partnership',
        description: 'We earn only when you do. We charge a commission ranging from 10% to 15%, depending on the country and event type.',
    },
])

const diverseVenues = ref([
    {
        category: 'Garden Wedding',
        image:'/images/list-your-venue/wedding1.png'
    },
     {
        category: 'Bars',
        image:'/images/list-your-venue/bars1.png'
    },
     {
        category: 'Restaurants',
        image:'/images/list-your-venue/cafe1.png'
    },
     {
        category: 'Art Studio',
        image:'/images/list-your-venue/artstudio1.png'
    },
     {
        category: 'Concert',
        image:'/images/list-your-venue/concert1.png'
    },
     {
        category: 'Boardroom',
        image:'/images/list-your-venue/meetingspaces1.png'
    },
     {
        category: 'Coffee Shop',
        image:'/images/list-your-venue/eventvenue1.png'
    },
     {
        category: 'Dance Studio',
        image:'/images/list-your-venue/warehouse1.png'
    },
    
])

const faqsdata = ref([
    {
        question: 'What is Venue4use?',
        answer: '',
    },
    {
        question: 'How long does it takes to get listed?',
        answer: '',
    },
    {
        question: 'How much commission does Venue4use charge hosts?',
        answer: '',
    },
    {
        question: 'How do Online Payments work on Venue4use?',
        answer: '',
    },
    {
        question: 'I need help creating my venue listing - who can I talk to?',
        answer: '',
    },

])
const goToLanding = () => {
  navigateTo({ name: "country", params: { country } });
};
</script>


<style scoped>
.imageLast{
    left: 4;
    position: absolute;
}

.imageFirst{
  bottom: 0;
  right:0;
  position: absolute;
}


.heart-icon-wrapper {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 40px;
}

.heart-icon-wrapper::before,
.heart-icon-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: 2px solid red;
  border-radius: 20px;
  transform: rotate(45deg);
}

.heart-icon-wrapper::before {
  left: -20px;
}

.heart-icon-wrapper::after {
  right: -20px;
}

.heart-icon-wrapper .v-icon {
  position: relative;
  top: -8px;
  font-size: 24px;
}
</style>