<template>
  <v-row no-gutters class="pa-6">
    <v-data-table :headers="header" v-model="selectedItem" :items="getItemList">
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.user.first_name }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.guests }}</td>
          <td>
            <div class="d-flex flex-column">
              <span>{{ getDateFormat(item.date.timestamp) }}</span>
              <span>{{ item.date.from }} - {{ item.date.to }}</span>
            </div>
          </td>
          <td>
            <div class="d-flex flex-column">
              <span>{{ item.venue.type }}</span>
              <span>{{ item.venue.space }}</span>
            </div>
          </td>
          <td>${{ item.value }}</td>
          <td>
            <v-chip :color="statusColor(item.status)" variant="text">
              {{ item.status.replace("_", " ") }}
            </v-chip>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-row>
</template>

<script setup>
const { country } = useLocal();

const selectedItem = ref("");

const header = ref([
  {
    title: "Name",
    align: "left",
    key: "user",
    sortable: false,
  },
  {
    title: "Type",
    sortable: false,
    key: "type",
  },
  {
    title: "Guest",
    sortable: false,
    key: "guests",
  },
  {
    title: "Date",
    sortable: false,
    key: "date",
  },
  {
    title: "Space",
    sortable: false,
    key: "venue",
  },
  {
    title: "Price",
    sortable: false,
    key: "value",
  },
  {
    title: "Status",
    sortable: false,
    key: "status",
  },
]);

const items = ref([
  {
    _id: "6630857515621a349d99fe80",
    date: {
      timestamp: "2024-04-01T12:00:00Z",
      from: "14:00",
      to: "18:00",
    },
    type: "Wedding",
    guests: 100,
    value: 5000,
    user: {
      _id: "6625bfa5c5750ababacfa38e",
      first_name: "Kevin",
      last_name: "Kosme",
      profile_picture: "",
    },
    venue: {
      type: "All Space",
      space: "Social Area",
    },
    status: "NEW",
    createdAt: "2024-04-30T05:45:25.099Z",
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    inbox: {
      _id: "6630857515621a349d99fe7e",
      room_id: "ebe57134fa640398f5be90662c326eba",
      sender: "6625bfa5c5750ababacfa38e",
      receiver: null,
      createdAt: "2024-04-30T05:45:25.048Z",
      updatedAt: null,
      deletedAt: null,
    },
    latest_message: "2024-04-30T05:45:25.081Z",
  },
  {
    _id: "6630857515621a349d99fe80",
    date: {
      timestamp: "2024-04-01T12:00:00Z",
      from: "14:00",
      to: "18:00",
    },
    type: "Wedding",
    guests: 100,
    value: 5000,
    user: {
      _id: "6625bfa5c5750ababacfa38e",
      first_name: "Kevin",
      last_name: "Kosme",
      profile_picture: "",
    },
    venue: {
      type: "All Space",
      space: "Social Area",
    },
    status: "IN_PROGRESS",
    createdAt: "2024-04-30T05:45:25.099Z",
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    inbox: {
      _id: "6630857515621a349d99fe7e",
      room_id: "ebe57134fa640398f5be90662c326eba",
      sender: "6625bfa5c5750ababacfa38e",
      receiver: null,
      createdAt: "2024-04-30T05:45:25.048Z",
      updatedAt: null,
      deletedAt: null,
    },
    latest_message: "2024-04-30T05:45:25.081Z",
  },
  {
    _id: "6630857515621a349d99fe80",
    date: {
      timestamp: "2024-04-01T12:00:00Z",
      from: "14:00",
      to: "18:00",
    },
    type: "Wedding",
    guests: 100,
    value: 5000,
    user: {
      _id: "6625bfa5c5750ababacfa38e",
      first_name: "Kevin",
      last_name: "Kosme",
      profile_picture: "",
    },
    venue: {
      type: "All Space",
      space: "Social Area",
    },
    status: "BOOKING_CONFIRMED",
    createdAt: "2024-04-30T05:45:25.099Z",
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    inbox: {
      _id: "6630857515621a349d99fe7e",
      room_id: "ebe57134fa640398f5be90662c326eba",
      sender: "6625bfa5c5750ababacfa38e",
      receiver: null,
      createdAt: "2024-04-30T05:45:25.048Z",
      updatedAt: null,
      deletedAt: null,
    },
    latest_message: "2024-04-30T05:45:25.081Z",
  },
  {
    _id: "6630857515621a349d99fe80",
    date: {
      timestamp: "2024-04-01T12:00:00Z",
      from: "14:00",
      to: "18:00",
    },
    type: "Wedding",
    guests: 100,
    value: 5000,
    user: {
      _id: "6625bfa5c5750ababacfa38e",
      first_name: "Kevin",
      last_name: "Kosme",
      profile_picture: "",
    },
    venue: {
      type: "All Space",
      space: "Social Area",
    },
    status: "CUSTOM_OFFER_SENT",
    createdAt: "2024-04-30T05:45:25.099Z",
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    inbox: {
      _id: "6630857515621a349d99fe7e",
      room_id: "ebe57134fa640398f5be90662c326eba",
      sender: "6625bfa5c5750ababacfa38e",
      receiver: null,
      createdAt: "2024-04-30T05:45:25.048Z",
      updatedAt: null,
      deletedAt: null,
    },
    latest_message: "2024-04-30T05:45:25.081Z",
  },
  {
    _id: "6630857515621a349d99fe80",
    date: {
      timestamp: "2024-04-01T12:00:00Z",
      from: "14:00",
      to: "18:00",
    },
    type: "Wedding",
    guests: 100,
    value: 5000,
    user: {
      _id: "6625bfa5c5750ababacfa38e",
      first_name: "Kevin",
      last_name: "Kosme",
      profile_picture: "",
    },
    venue: {
      type: "All Space",
      space: "Social Area",
    },
    status: "HAPPENED",
    createdAt: "2024-04-30T05:45:25.099Z",
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    inbox: {
      _id: "6630857515621a349d99fe7e",
      room_id: "ebe57134fa640398f5be90662c326eba",
      sender: "6625bfa5c5750ababacfa38e",
      receiver: null,
      createdAt: "2024-04-30T05:45:25.048Z",
      updatedAt: null,
      deletedAt: null,
    },
    latest_message: "2024-04-30T05:45:25.081Z",
  },
  {
    _id: "6630857515621a349d99fe80",
    date: {
      timestamp: "2024-04-01T12:00:00Z",
      from: "14:00",
      to: "18:00",
    },
    type: "Wedding",
    guests: 100,
    value: 5000,
    user: {
      _id: "6625bfa5c5750ababacfa38e",
      first_name: "Kevin",
      last_name: "Kosme",
      profile_picture: "",
    },
    venue: {
      type: "All Space",
      space: "Social Area",
    },
    status: "COMMISION_DUE",
    createdAt: "2024-04-30T05:45:25.099Z",
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    inbox: {
      _id: "6630857515621a349d99fe7e",
      room_id: "ebe57134fa640398f5be90662c326eba",
      sender: "6625bfa5c5750ababacfa38e",
      receiver: null,
      createdAt: "2024-04-30T05:45:25.048Z",
      updatedAt: null,
      deletedAt: null,
    },
    latest_message: "2024-04-30T05:45:25.081Z",
  },
  {
    _id: "6630857515621a349d99fe80",
    date: {
      timestamp: "2024-04-01T12:00:00Z",
      from: "14:00",
      to: "18:00",
    },
    type: "Wedding",
    guests: 100,
    value: 5000,
    user: {
      _id: "6625bfa5c5750ababacfa38e",
      first_name: "Kevin",
      last_name: "Kosme",
      profile_picture: "",
    },
    venue: {
      type: "All Space",
      space: "Social Area",
    },
    status: "ARCHIEVE",
    createdAt: "2024-04-30T05:45:25.099Z",
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    inbox: {
      _id: "6630857515621a349d99fe7e",
      room_id: "ebe57134fa640398f5be90662c326eba",
      sender: "6625bfa5c5750ababacfa38e",
      receiver: null,
      createdAt: "2024-04-30T05:45:25.048Z",
      updatedAt: null,
      deletedAt: null,
    },
    latest_message: "2024-04-30T05:45:25.081Z",
  },
]);

// COMPUTED
const getItemList = computed(() =>
  items.value.filter((data) => data.status == "IN_PROGRESS"),
);

// METHODS
function getDateFormat(dateData) {
  let getDate = new Date(dateData);
  return `${getDate.getDay()}/${getDate.getMonth()}/${getDate.getFullYear()}`;
}
function statusColor(status) {
  // NEW, IN_PROGRESS, BOOKING_CONFIRMED, CUSTOM_OFFER_SENT, HAPPENED, COMMISION_DUE, ARCHIEVE
  if (status == "NEW") return "blue";
  if (status == "IN_PROGRESS") return "yellow";
  if (status == "BOOKING_CONFIRMED") return "error";
  if (status == "CUSTOM_OFFER_SENT") return "primary";
  if (status == "HAPPENED") return "grey";
  if (status == "COMMISION_DUE") return "purple";
  if (status == "ARCHIEVE") return "orange";
  return "grey";
}
</script>
