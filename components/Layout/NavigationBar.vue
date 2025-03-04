<template>
  <v-navigation-drawer class="mt-4">
    <div v-if="currentUser.role === 'USER'">
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/square-circle.svg"
            max-width="20"
            height="20"
            contain
          ></v-img>
          <p class="ml-2">Account Overview</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/heart.svg"
            max-width="20"
            height="20"
            contain
          ></v-img>
          <p class="ml-2">Favorites</p>
        </v-list-item-title>
      </v-list-item>
    </div>
    <div v-else>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/square-circle.svg"
            max-width="20"
            height="20"
            contain
            alt="Navigation Icon"
          ></v-img>
          <p class="ml-2">Account Overview</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/settings.svg"
            max-width="20"
            height="20"
            contain
            alt="Settings Icon"
          ></v-img>
          <p class="ml-2">Analytics Performance</p>
        </v-list-item-title>
      </v-list-item>
    </div>
    <v-divider></v-divider>
    <div v-if="currentUser.role === 'USER'">
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/globe.svg"
            max-width="20"
            height="20"
            contain
            alt="Country Icon"
          ></v-img>
          <p class="ml-2">Enquiries</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/message.svg"
            max-width="20"
            height="20"
            contain
            alt="Messages Icon"
          ></v-img>
          <p class="ml-2">Messages</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/logout.svg"
            max-width="20"
            height="20"
            contain
            alt="Logout Icon"
          ></v-img>
          <p class="ml-2">Logout</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/support.svg"
            max-width="20"
            height="20"
            contain
            alt="Support Icon"
          ></v-img>
          <p class="ml-2">Support/Help</p>
        </v-list-item-title>
      </v-list-item>
    </div>
    <div v-else>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/globe.svg"
            max-width="20"
            height="20"
            contain
            alt="Country Icon"
          ></v-img>
          <p class="ml-2">Manage My Venues</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/heart.svg"
            max-width="20"
            height="20"
            contain
            alt="Favorites Icon"
          ></v-img>
          <p class="ml-2">Favorites</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/book.svg"
            max-width="20"
            height="20"
            contain
            alt="Bookings Icon"
          ></v-img>
          <p class="ml-2">My Enquries (0)</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/boost.svg"
            max-width="20"
            height="20"
            contain
            alt="Boost Icon"
          ></v-img>
          <p class="ml-2">Boost - Ads</p>
          <v-chip class="ml-2 pl-1" color="#A7F8D2" variant="flat">
            <v-avatar>
              <v-img
                src="/images/navigation/diamond.svg"
                max-width="20"
                height="15"
                contain
                alt="Diamond Icon"
              ></v-img>
            </v-avatar>
            Upgrade
          </v-chip>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/support.svg"
            max-width="20"
            height="20"
            contain
            alt="Support Icon"
          ></v-img>
          <p class="ml-2">Support/Help</p>
        </v-list-item-title>
      </v-list-item>
    </div>
    <v-divider v-if="currentUser.role !== 'USER'"></v-divider>
    <div v-if="currentUser.role !== 'USER'">
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/event.svg"
            max-width="20"
            height="20"
            contain
            alt="Event Icon"
          ></v-img>
          <p class="ml-2">Event Tracker</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/note.svg"
            max-width="20"
            height="20"
            contain
            alt="Notes Icon"
          ></v-img>
          <p class="ml-2">Post Additional Listing</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/payment.svg"
            max-width="20"
            height="20"
            contain
            alt="Payment Icon"
          ></v-img>
          <p class="ml-2">Payments</p>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="navigationHover">
        <v-list-item-title class="d-flex justify-start">
          <v-img
            class="ml-1"
            src="/images/navigation/message.svg"
            max-width="20"
            height="20"
            contain
            alt="Messages Icon"
          ></v-img>
          <p class="ml-2">Feedback</p>
        </v-list-item-title>
      </v-list-item>
    </div>
  </v-navigation-drawer>
</template>
<script setup>
const { currentUser } = useLocalAuth();
</script>
<style scoped>
.navigationHover:hover {
  background-color: #38854f;
  opacity: 65%;
  overflow: hidden;
  max-width: 255px;
  cursor: pointer;
}
</style>
