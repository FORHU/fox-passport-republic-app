// file: ~/components/PDF.vue
<script setup lang="ts">
import MEnquiry from "~/models/enquiry.model";
import { useDisplay } from "vuetify";
const { mdAndUp } = useDisplay();
const { country, getCurrencySymbol } = useLocal();
const { currentUser } = useLocalAuth();
const { id, custom_offer_id } = useRoute().params;
const { enquiry, getEnquiry, updateEnquiry } = useEnquiry();

definePageMeta({
  layout: "enquiry-chat",
});

const offer = ref();
const loading = ref(true);
const receipt_data = ref()

// chat back button conditions
const handleBackButton = () => {
  navigateTo({
    name: "country-enquiries-message-id",
    params: { country, id },
  });
};

const goToPayment = () => {
  navigateTo({
    name: "country-enquiries-message-id-view-offer-custom_offer_id-review-payment",
    params: { country, id, custom_offer_id },
  });
};

const handleExport = async () => {

  const element = document.getElementById("pdf-section");
  const options = {
    filename: `Receipt ${receipt_data.value?.receipt_no}_venue4use.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { format: "a5" },
    enableLinks: true,
    margin: 0,
    pagebreak: {
      before: ".beforeClass",
      after: ["#after1", "#after2"],
      avoid: "img",
    },
  };
  let html2pdf = window?.html2pdf as any;
  if (element) {
    await html2pdf()
      .from(element)
      .set(options)
      .toPdf()
      .get("pdf")
      // .then(function (pdf: any) {
      //   var totalPages = pdf.internal.getNumberOfPages();
      //   let i = 1;
      //   for (i = 1; i <= totalPages; i++) {
      //     pdf.setPage(i);
      //     pdf.setFontSize(10);
      //     pdf.setTextColor(100);
      //     pdf.text(
      //       "Page " + i + " of " + totalPages,
      //       pdf.internal.pageSize.getWidth() - 25,
      //       pdf.internal.pageSize.getHeight() - 8,
      //     );
      //   }
      // })
      .then(function (pdf: any) {

        // Coordinates for lower-left corner
        const marginLeft = 5;  // Margin from the left edge
        const marginBottom = 5;  // Margin from the bottom edge

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFontSize(10);
        pdf.setTextColor('#808080');
        pdf.text("Venue4use Pte Ltd", marginLeft, pageHeight - marginBottom - 10)
        pdf.text("102E Pasir Panjang Rd, #03-02 Citilink Warehouse Complex,", marginLeft, pageHeight - marginBottom - 5)
        pdf.text("Singapore 118529", marginLeft, pageHeight - marginBottom)
      })
      .save();
  }

  // if (element) {
  //   // New Promise-based usage:
  //   const res = await html2pdf().set(options).from(element).save();
  // }
};

const customerFullName = computed(() => {
  const user = enquiry.value?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const formatDate = (dateString: string) => {
  if (!dateString) return;
  const date = new Date(dateString);
  const options: any = { year: "numeric", month: "long", day: "2-digit" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate;
};

// const descriptionDetails = computed(() => {
//   const spaceName = enquiry.value?.space?.name
//   const eventDate = enquiry.value?.date?.date
//   // const parts = [customerFullName.value, eventDate, spaceName].filter(Boolean).join(', ')

//   return `Online Booking - ${customerFullName.value}, ${enquiry.value?.date?.date}, ${enquiry.value?.space?.name}`;
// });

const items = computed(() => {
  return [
    {
      description: `Online Booking - ${[customerFullName.value, enquiry.value?.date?.date, enquiry.value?.space?.name].filter(Boolean).join(", ")}`,
      quantity: Number(1).toFixed(2),
      price: Number(receipt_data.value?.price).toFixed(2),
      amount: Number(receipt_data.value?.price).toFixed(2),
    },
    // ... more items
  ];
});

const headers = [
  {
    title: "DESCRIPTION",
    align: "start",
    sortable: false,
    key: "description",
    width: "250px",
  },
  { title: "QUANTITY", align: "end", sortable: false, key: "quantity" },
  { title: "UNIT PRICE", align: "end", sortable: false, key: "price" },
  // { title: "GST", align: "end", sortable: false, key: "gst" },
  { title: "AMOUNT", align: "end", sortable: false, key: "amount" },
];

const fetchEnquiryData = async () => {
  const { data: enquiryData } = await getEnquiry(id as string);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);
  }
};

const fetchOffer = async () => {
  try {
    await useAPI("/v1/custom-offer", {
      query: {
        inbox_id: enquiry.value.inbox?._id,
        // status: 'PENDING,BOOKING_CONFIRMED'
      },
    }).then(async (res) => {
      if (res.data && res.data.value) {
        const responseData = res.data.value as any;
        if (!responseData.data || !responseData.data[0]) return;
        offer.value = responseData.data[0];
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const loadReceiptData = async () => {
  const { data } = await useAPI('/v1/receipt/generate-receipt', {
    method: 'POST',
    body: JSON.stringify({
      enquiry_id: id
    })
  })
  if (data.value && data.value?.result) {
    receipt_data.value = data.value.result;
  }

}

const currencySymbol = computed(() => {
  return getCurrencySymbol(receipt_data.value?.currency);

});

onBeforeMount(async () => {
  await fetchEnquiryData(), await fetchOffer();
  await loadReceiptData();
  loading.value = false;
});
</script>

<template>
  <v-container>
    <v-row no-gutters justify="center">
      <v-col cols="12" sm="10" md="8" xl="4">

        <v-row no-gutters class="my-3 w-100" justify="space-between" align="center">
          <v-col cols="2">
            <ButtonBack no-label @click="handleBackButton" />
          </v-col>
          <v-col align="end">
            <!-- <v-btn
          varian="flat"
          color="secondary"
          class="mr-2"
          @click="goToPayment"
        >
          Pay Now
        </v-btn> -->
            <v-btn varian="flat" prepend-icon="mdi-receipt-text" class="text-16px font-400" color="secondary"
              rounded="lg" @click="handleExport">
              Print Receipt
            </v-btn>
          </v-col>
        </v-row>
        <div id="pdf-section">

          <v-card v-if="loading" elevation="5" rounded="lg" min-height="15dvh">
            <LoadingChat :lines="15" />
          </v-card>
          <v-card v-else elevation="2" rounded="lg" class="pa-5 pa-md-10" width="100%">
            <v-row no-gutters>
              <v-row no-gutters class="">
                <v-row no-gutters class="w-100" justify="center">
                  <v-col cols="12" align="center">
                    <v-img :max-width="mdAndUp ? '120px' : '100px'" src="/public/venuelogo.svg"
                      :height="mdAndUp ? '70px' : '50px'" alt="venue4use-logo" cover></v-img>
                  </v-col>
                  <v-col cols="12" class="font-700 text-18px mt-3" align="center">Your Venue4use Receipt</v-col>
                </v-row>
                <v-row no-gutters class="my-5 my-md-7 text-14px text-charcoal w-100">
                  <v-row class="mt-5">
                    <v-col>
                      {{ formatDate(receipt_data?.receipt_date) }}
                    </v-col>
                    <v-col align="end">
                      Receipt # {{ receipt_data?.receipt_no }}
                    </v-col>
                  </v-row>
                </v-row>


                <v-row no-gutters class="my-3 text-secondary" align="center">
                  <v-row no-gutters class="w-100">
                    <v-card color="transparent" border="secondary sm" rounded="lg" elevation="0" width="100%">
                      <v-row no-gutters class="pa-5 pa-lg-7 text-secondary text-16px ">
                        <v-col cols="12" class="d-flex flex-wrap ga-2 justify-space-between">
                          <span>{{ receipt_data?.space_name }} at {{ receipt_data?.venue_name }}</span>
                          <span>{{ currencySymbol }} {{ Number(receipt_data?.grand_total).toFixed(2) }}</span>
                        </v-col>
                        <v-divider class="my-5" thickness="2"></v-divider>
                        <v-col cols="12" class="d-flex flex-wrap ga-2 justify-space-between text-18px font-700">
                          <span>Total</span>
                          <span>{{ currencySymbol }} {{ Number(receipt_data?.grand_total).toFixed(2) }}</span>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-row>

                  <v-row no-gutters class="my-5 px-3">
                    <v-col cols="12" class="d-flex justify-space-between text-16px">
                      <span class="font-500">Name</span>
                      <span>{{ receipt_data?.booker_user }}</span>
                    </v-col>
                    <v-col cols="12" class="mt-5 d-flex justify-space-between text-16px">
                      <span class="font-500">Email</span>
                      <span>{{ receipt_data?.email }}</span>
                    </v-col>
                  </v-row>

                </v-row>

                <v-row no-gutters class="my-7 d-flex text-charcoal flex-wrap  text-16px">If you
                  have
                  any questions, contact us at&nbsp;<span
                    class=""><a href="mailto:contact@venue4use.com" class="text-secondary">contact@venue4use.com</a></span>.</v-row>
              </v-row>
            </v-row>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
  <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
    integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
    crossorigin="anonymous" referrerpolicy="no-referrer"></Script>
</template>

<style scoped>
.line {
  margin: 5px 0 !important;
  height: 2px !important;
  background: repeating-linear-gradient(90deg, gray 0 5px, #0000 0 7px) !important;
  opacity: 30% !important;
  /*5px red then 2px transparent -> repeat this!*/
}
</style>
