// file: ~/components/PDF.vue
<script setup lang="ts">
import MEnquiry from "~/models/enquiry.model";
import { useDisplay } from "vuetify";
const { mdAndUp } = useDisplay();
const { country } = useLocal();
const { currentUser } = useLocalAuth();
const { id, custom_offer_id } = useRoute().params;
const { enquiry, getEnquiry, updateEnquiry } = useEnquiry();

definePageMeta({
  layout: "enquiry-chat",
});

const offer = ref();
const loading = ref(true);
const invoice_data = ref()

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
    filename: `Invoice ${invoice_data.value?.invoice_no}_venue4use.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { format: "a4" },
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
      .then(function (pdf: any) {
        var totalPages = pdf.internal.getNumberOfPages();
        let i = 1;
        for (i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          pdf.text(
            "Page " + i + " of " + totalPages,
            pdf.internal.pageSize.getWidth() - 25,
            pdf.internal.pageSize.getHeight() - 8,
          );
        }
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
      price: Number(invoice_data.value?.price).toFixed(2),
      amount: Number(invoice_data.value?.price).toFixed(2),
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

const loadInvoiceData = async () => {
  const { data } = await useAPI('/v1/invoice/generate-invoice', {
    method: 'POST',
    body: JSON.stringify({
      enquiry_id: id
    })
  })
  if (data.value && data.value?.results) {
    invoice_data.value = data.value.results;
  }

}

onBeforeMount(async () => {
  await fetchEnquiryData(), await fetchOffer();
  await loadInvoiceData();
  loading.value = false;
});
</script>

<template>
  <v-container style="max-width: 1000px">
    <v-row no-gutters class="my-3" justify="space-between" align="center">
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
        <v-btn varian="flat" prepend-icon="mdi-receipt-text" class="text-16px font-400" color="primary" rounded="lg"
          @click="handleExport">
          Print Invoice
        </v-btn>
      </v-col>
    </v-row>

    <div id="pdf-section">
      <v-card v-if="loading" elevation="5" rounded="lg" min-height="15dvh">
        <LoadingChat :lines="15" />
      </v-card>
      <v-card v-else elevation="2" class="pa-5 pa-md-10" width="100%">
        <v-row>
          <v-card color="primary" elevation="2" class="pa-5" min-height="100px" width="100%">
            <v-row class="px-md-3">
              <v-col cols="4" md="3" justify="center" align="start">
                <v-row no-gutters justify="start">
                  <v-img :max-width="mdAndUp ? '150px' : '100px'" src="/images/navigation/dp3-removebg.webp"
                    :height="mdAndUp ? '70px' : '50px'" alt="venue4use-logo"></v-img>
                </v-row>
              </v-col>
              <v-spacer class="d-none d-md-block"></v-spacer>
              <v-col>
                <v-row no-gutters>
                  <v-col cols="12" class="text-h6 text-md-h4" align="end">
                    <span>Invoice</span>
                  </v-col>
                  <v-col cols="12" class="text-caption text-md-subtitle-1" align="end">
                    <span>Invoice # {{ invoice_data?.invoice_no }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
        <v-row no-gutters class="my-5 my-md-10">
          <v-col cols="12" class="text-subtitle-1 text-md-h6 mb-3">Venue4use Invoice</v-col>
          <v-row class="">
            <v-col cols="12" sm="6">
              <v-row no-gutters class="text-archived">
                <v-col cols="12" class="text-caption text-md-subtitle-2 mb-2">Name of Space and Address:</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">{{
                  offer?.space?.name
                }}</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">{{
                  offer?.venue?.address?.street
                }}</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">{{
                  offer?.venue?.address?.city
                }}</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">{{
                  offer?.venue?.address?.state
                }}</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">{{
                  offer?.venue?.address?.postal_code
                }}</v-col>
              </v-row>
            </v-col>
            <!-- <v-col cols="6" sm="4">
              <v-row no-gutters class="text-archived">
                <v-col cols="12" class="text-caption text-md-subtitle-2 mb-2">GST Number</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">M90375940N</v-col>
              </v-row>
            </v-col> -->
            <v-col cols="12" sm="6">
              <v-row no-gutters class="text-archived">
                <v-col cols="12" class="text-caption text-md-subtitle-2 mb-2">Name of Company and Address:</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">Venue4use</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">120E Pasir Panjang Road</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">Singapore</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">Singapore</v-col>
                <v-col cols="12" class="text-subtitle-2 text-md-subtitle-1">118529</v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-row>
        <div class="line"></div>

        <v-row no-gutters class="my-5 my-md-10">
          <v-col cols="12" class="text-subtitle-1 text-md-h6 mb-3">Details</v-col>
          <v-row class="text-archived">
            <v-col cols="6" sm="4">
              <v-row no-gutters>
                <v-col cols="12" class="text-caption text-md-subtitle-2">Invoice Date:</v-col>
                <v-col cols="12" class="font-weight-bold text-subtitle-2 text-md-subtitle-1">{{
                  formatDate(invoice_data?.invoice_date) }}</v-col>

                <!-- <v-col cols="12" class="text-caption text-md-subtitle-2 mt-5">VAT Number:</v-col>
                <v-col cols="12" class="font-weight-bold text-subtitle-2 text-md-subtitle-1">1234351523</v-col> -->
              </v-row>
            </v-col>
            <v-col cols="6" sm="4">
              <v-row no-gutters>
                <v-col cols="12" class="text-caption text-md-subtitle-2">Invoice Number:</v-col>
                <v-col cols="12" class="font-weight-bold text-subtitle-2 text-md-subtitle-1">{{ invoice_data?.invoice_no
                  }}</v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="4">
              <v-row no-gutters>
                <v-col cols="12" class="text-caption text-md-subtitle-2">Reference:</v-col>
                <v-col cols="12" class="font-weight-bold text-subtitle-2 text-md-subtitle-1">Venue4use Invoice - {{
                  invoice_data?.booker_user }}</v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-row>

        <v-row no-gutters class="my-5">
          <v-data-table :headers="headers" :items="items" hide-default-footer>
            <template v-slot:header="{ item }">
              {{ item.toUpperCase() }}
            </template>
            <template v-slot:bottom> </template>
          </v-data-table>
        </v-row>
        <v-row no-gutters justify="end" class="text-subtitle-2 px-3" id="after1">
          <v-col cols="10" sm="5">
            <v-row no-gutters class="mb-1">
              <v-col>Subtotal</v-col>
              <v-col cols="4" align="end">{{ Number(invoice_data?.price).toFixed(2) }}</v-col>
            </v-row>
            <!-- <v-row no-gutters>
              <v-col>Total GST</v-col>
              <v-col cols="4" align="end">{{
                Number("2.97").toFixed(2)
                }}</v-col>
            </v-row> -->
          </v-col>
          <v-row class="w-100" justify="end">
            <!-- <v-col cols="11" sm="6">
              <v-divider color="secondary"></v-divider>
            </v-col> -->
          </v-row>
          <v-col cols="10" sm="5">
            <v-row no-gutters class="mb-1">
              <v-col>Total Rebate ({{ invoice_data?.rebate }})</v-col>
              <v-col cols="4" align="end">{{ Number(offer?.user_computation?.rebate * invoice_data?.price).toFixed(2)
                }}</v-col>
            </v-row>
          </v-col>
          <v-row class="w-100" justify="end">
            <v-col cols="11" sm="6">
              <v-divider color="secondary"></v-divider>
            </v-col>
          </v-row>
          <v-col cols="10" sm="5" class="font-weight-bold">
            <v-row no-gutters class="mb-1">
              <v-col>Amount Due {{ invoice_data?.currency }}</v-col>
              <v-col cols="4" align="end">{{ Number(invoice_data?.grand_total).toFixed(2) }}</v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="d-none d-md-block pt-3"></v-row>
        <v-row no-gutters class="mt-10">
          <!-- <v-col cols="12" class="text-subtitle-1 text-md-h6 font-weight-bold">Due Date: {{ "14 May 2024" }}</v-col> -->
          <v-col cols="12" class="text-caption text-sm-subtitle-2">
            Important: Payment methods (please disregard if a booking has been
            paid online via Venue4use) - Please state the Invoice Number in the
            payment reference when paying via bank transfer. Please note that due to the company
            policy we don't accept paper cheques
          </v-col>
          <v-col cols="12" class="mt-3 text-subtitle-2 text-md-subtitle-1 font-weight-bold">Venue4use Pte Ltd</v-col>
          <v-col cols="12" class="my-2 text-caption text-sm-subtitle-2">Bank name: United Overseas Bank Limited
            (UOB)</v-col>
          <v-col cols="12" class="my-2 text-caption text-sm-subtitle-2">Account Number: 314-315-427-9</v-col>
          <!-- <v-col cols="12" class="my-2 text-caption text-sm-subtitle-2">Bank code: 7171</v-col> -->
          <!-- <v-col cols="12" class="my-2 text-caption text-sm-subtitle-2">A failure to pay an invoice within 14 days of
            the due
            date may
            result in your account being suspended and your credit history being
            affected (Venue4use may exercise a late payment fee, together with
            debt recovery cost, which is in line with 4.10.4 of our T&Cs).
          </v-col> -->
        </v-row>
      </v-card>
    </div>
  </v-container>
  <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
    integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
    crossorigin="anonymous" referrerpolicy="no-referrer"></Script>
</template>

<style scoped>
.line {
  margin: 5px 0;
  height: 2px;
  background: repeating-linear-gradient(90deg, gray 0 5px, #0000 0 7px);
  opacity: 30%;
  /*5px red then 2px transparent -> repeat this!*/
}
</style>
