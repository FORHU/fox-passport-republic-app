<template>
  <LoadingSpacePage v-if="loader" />
  <!-- MAIN -->
  <v-row no-gutters v-else>
    <v-row no-gutters class="pa-0" justify="center">
      <v-col cols="12" xxl="10" xl="10" lg="10" md="10">
        <v-row no-gutters class="">
          <v-row align="center" justify="space-between" class="px-2">
            <span class="d-flex align-items-center">
              <p class="font-weight-bold hidden-sm-and-down py-7 text-42px">
                {{ specificSpace.name + " at " + specificSpace.venue.name }}
              </p>
            </span>

            <div>
              <v-btn
                class="hidden-sm-and-down"
                variant="text"
                prepend-icon="mdi-export-variant"
                @click="toggleShareButton"
              >
                Share
              </v-btn>

              <v-btn
                class="hidden-sm-and-down"
                variant="text"
                :prepend-icon="
                  specificSpace.marked_as_favorite.isFavorite
                    ? 'mdi-heart'
                    : 'mdi-heart-outline'
                "
                @click="handleFavorite()"
                :disabled="loggedIn && currentUser?.role !== 'USER'"
              >
                {{
                  specificSpace.marked_as_favorite.isFavorite ? "Liked" : "Like"
                }}
              </v-btn>
            </div>
          </v-row>
          <!-- Image gallery -->
          <v-col cols="12">
            <v-row no-gutters>
              <v-col cols="12" class="d-block d-md-none">
                <v-carousel
                  hide-delimiters
                  :show-arrows="false"
                  v-model="currentIndex"
                >
                  <template
                    v-for="(image, index) in imagesArray"
                    :key="imagesArray?._id"
                  >
                    <v-carousel-item
                      v-if="image?.contentType?.includes('image')"
                      :src="image.path || 'https://placehold.co/600x400'"
                      height="470"
                      class="cursor-pointer"
                      @click="openModal(image._id)"
                    >
                      <v-img
                        :src="image.path || 'https://placehold.co/600x400'"
                        height="470"
                        cover
                        class="cursor-pointer"
                        alt="venue space image placeholder"
                      ></v-img>
                    </v-carousel-item>
                    <v-carousel-item
                      v-else-if="image?.contentType?.includes('video')"
                      height="470"
                      @click="openModal(image._id)"
                    >
                      <v-row
                        no-gutters
                        class="h-100 w-100"
                        align="center"
                        justify="center"
                      >
                        <video
                          width="100%"
                          height="100%"
                          controls
                          style="object-fit: cover"
                        >
                          <source :src="image?.path" />
                        </video>
                        <v-row
                          class="w-full h-full"
                          no-gutters
                          style="
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                          "
                        ></v-row>
                      </v-row>
                      <template v-slot:placeholder>
                        <div
                          class="d-flex align-center justify-center fill-height"
                        >
                          <v-progress-circular
                            color="grey-lighten-4"
                            indeterminate
                          ></v-progress-circular>
                        </div>
                      </template>
                    </v-carousel-item>
                  </template>
                  <v-card
                    class="rounded-md text-white px-5 py-1"
                    style="
                      position: absolute;
                      bottom: 50px;
                      right: 25px;
                      z-index: 20;
                      background-color: rgba(0, 0, 0, 0.8);
                    "
                  >
                    {{ currentIndex + 1 }}/{{ imagesArray.length || 0 }}
                  </v-card>
                  <div
                    class="d-flex justify-space-between w-100 px-2"
                    style="
                      position: absolute;
                      top: 20px;
                      right: 0;
                      left: 0;
                      z-index: 10;
                    "
                  >
                    <v-btn
                      class="ma-2 rounded-pill"
                      icon
                      @click="handleBackClick"
                    >
                      <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <span>
                      <v-btn
                        class="ma-2 rounded-pill"
                        icon
                        @click="toggleSharingColumn"
                      >
                        <v-img
                          src="/public/share.svg"
                          height="25px"
                          width="25px"
                          style="filter: invert(1)"
                          alt="share icon"
                        ></v-img>
                      </v-btn>

                      <v-btn
                        class="ma-2 rounded-pill"
                        icon
                        @click="handleFavorite()"
                      >
                        <v-icon>
                          {{
                            specificSpace.marked_as_favorite.isFavorite
                              ? "mdi-heart"
                              : "mdi-heart-outline"
                          }}
                        </v-icon>
                      </v-btn>
                    </span>
                  </div>
                </v-carousel>

                <v-col cols="12">
                  <h1 :class="mobile ? 'text-28px font-weight-bold' : ''">
                    {{ specificSpace.name }} at {{ specificSpace.venue.name }}
                  </h1>
                </v-col>
              </v-col>

              <!-- DESKTOP -->
              <v-col cols="12" md="6" class="pt-4 d-none d-md-flex">
                <v-img
                  :src="
                    featuredImageSrc()?.path ||
                    'https://picsum.photos/500/300?image=232'
                  "
                  height="413"
                  cover
                  class="cursor-pointer"
                  alt="open modal icon"
                  @click="openModal(featuredImageSrc()?._id)"
                ></v-img>
              </v-col>

              <v-col cols="12" md="6" class="pa-2 d-none d-md-flex">
                <v-row no-gutters>
                  <template
                    v-for="(image, index) in imagesArray.slice(0, 4)"
                    :key="index"
                  >
                    <v-col cols="6" class="pa-2" @click="openModal(image?._id)">
                      <v-img
                        v-if="image?.contentType.includes('image')"
                        :src="image.path || 'https://placehold.co/600x400'"
                        height="198"
                        cover
                        class="cursor-pointer"
                        alt="open modal icon"
                      >
                        <template v-if="index === 3">
                          <v-row
                            no-gutters
                            class="fill-height pa-2"
                            :justify="mobile ? 'center' : 'end'"
                            align="end"
                          >
                            <v-btn>
                              <v-img
                                class="mr-2"
                                src="/public/dot.svg"
                                height="20px"
                                width="20px"
                                alt="dot icon"
                              />
                              see all {{ imagesArray.length || 0 }} photos
                            </v-btn>
                          </v-row>
                        </template>
                      </v-img>
                      <v-card flat v-if="image?.contentType.includes('video')">
                        <video
                          width="100%"
                          height="198"
                          controls
                          cover
                          style="object-fit: cover"
                        >
                          <source :src="image?.path" />
                        </video>
                        <v-row
                          class="w-full h-full"
                          no-gutters
                          style="
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                          "
                        ></v-row>
                      </v-card>
                    </v-col>
                  </template>
                </v-row>
              </v-col>
            </v-row>
          </v-col>

          <v-row
            no-gutters
            justify="space-between"
            :class="mobile ? 'mx-2' : ''"
          >
            <!-- LEFT COLUMN -->
            <v-col cols="12" sm="12" md="12" lg="6">
              <!-- Address and seating information -->
              <h2 :class="mobile ? 'text-22px font-weight-bold' : ''">
                {{ formatAddress(specificSpace.venue.address) }}
              </h2>
              <div class="d-flex align-center text-body-2">
                <v-rating
                  hover
                  readonly
                  :length="5"
                  :size="24"
                  :model-value="ratingAverage"
                  color="warning"
                  active-color="warning"
                />
                {{ ratingAverage }} |
                <p
                  class="mb-0 ml-2 text-body-2"
                  :class="totalRatings > 0 ? 'text-decoration-underline' : ''"
                  @click="handleShowAllReviews()"
                >
                  {{ totalRatings }}
                  {{ totalRatings > 1 ? "reviews" : "review" }}
                </p>
              </div>
              <div class="d-flex mt-3">
                <!-- Only display seating information if maxSeating is available -->
                <p
                  v-if="
                    space.capacityLayout.maxSeating !== undefined &&
                    space.capacityLayout.maxSeating !== null
                  "
                  class="mr-2"
                >
                  {{ space.capacityLayout.maxSeating }} Seating
                </p>

                <!-- Display a separator only if both seating and standing data are available -->
                <p
                  v-if="
                    space.capacityLayout.maxSeating !== undefined &&
                    space.capacityLayout.maxSeating !== null &&
                    space.capacityLayout.maxStanding !== undefined &&
                    space.capacityLayout.maxStanding !== null
                  "
                  class="mr-2"
                >
                  •
                </p>

                <!-- Only display standing information if maxStanding is available -->
                <p
                  v-if="
                    space.capacityLayout.maxStanding !== undefined &&
                    space.capacityLayout.maxStanding !== null
                  "
                >
                  {{ space.capacityLayout.maxStanding }} Standing
                </p>
              </div>
              <!-- Host information card -->
              <v-card class="mt-5 pa-5 rounded-lg" variant="outlined">
                <div class="d-flex">
                  <ProfileAvatar
                    :first_name="specificSpace.venue.user.first_name"
                    :last_name="specificSpace.venue.user.last_name"
                    size="50px"
                    class="mr-5"
                  />
                  <div class="d-flex justify-center text-center align-center">
                    <p class="font-weight-bold">
                      Hosted by {{ specificSpace.venue.user.first_name }}
                      {{ specificSpace.venue.user.last_name }}
                    </p>
                    <!-- <p>Elitehost • 1 year of hosting</p> -->
                  </div>
                </div>
              </v-card>

              <v-col cols="12" class="mt-5">
                <!-- Venue Recommendations -->
                <v-row class="mb-4" align="start">
                  <v-col cols="auto" class="mr-2">
                    <IconEliteHost />
                  </v-col>
                  <v-col>
                    <p class="mb-1 font-weight-bold">Elite Venue</p>
                    <p class="mt-0">
                      This venue is highly recommended based on ratings,
                      reviews, and response rate.
                    </p>
                  </v-col>
                </v-row>

                <v-row class="mb-4" align="start">
                  <v-col cols="auto" class="mr-2">
                    <v-img
                      src="/public/svg/private.svg"
                      height="30px"
                      width="30px"
                      alt="private icon"
                    />
                  </v-col>
                  <v-col>
                    <p class="mb-1 font-weight-bold">
                      {{ privateSpaceData?.name }}
                    </p>
                    <p>
                      {{ privateSpaceData?.subtitle }}
                    </p>
                  </v-col>
                </v-row>

                <v-row align="start">
                  <v-col cols="auto" class="mr-2">
                    <v-img src="/public/mark.svg" height="30px" width="30px" />
                  </v-col>
                  <v-col>
                    <p class="mb-1 font-weight-bold">Mark is an Elitehost</p>
                    <p class="mt-0">
                      Elitehosts are experienced, highly rated host and have a
                      high response rates.
                    </p>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider class="mt-5"></v-divider>
              <ExpandableDescription :description="specificSpace.description" />
              <v-divider class="mt-5" /> 
              <v-col cols="12">
                <v-row class="">
                  <h2 class="my-5">Pricing Details</h2>
                  <SpacesDetailsPrices :specificSpace="specificSpace" />
                 
                </v-row>
                
              </v-col>

              

              <v-divider class="mt-5"></v-divider>

              <div v-if="hasOfferData">
                <h2 class="my-5">What We Offer</h2>
                <SpacesDetailsFacilities :specificSpace="specificSpace" />
                <v-divider class="mt-5"></v-divider>
              </div>

              <!-- What We Don't Allow section -->
              <h2 class="my-5">What We Don't Allow</h2>
              <SpacesDetailsFoodAndBeverages
                :space="space"
                :specificSpace="specificSpace"
              />
              <v-divider class="mt-5"></v-divider>

              <!-- Cancellation Policy section -->
              <h2 class="my-5">Cancellation Policy</h2>
              <SpacesDetailsRules :specificSpace="specificSpace" />
              
              <v-divider class="mt-5"></v-divider>


               <!-- MENU -->
               <template
                v-if="
                  specificSpace?.menu_photo &&
                  specificSpace?.menu_photo?.length > 0
                "
              >
                <h3 class="my-5 px-2">Menu</h3>
                <SpacesDetailsMenu :specificSpace="specificSpace" />
                <v-divider class="mt-5"></v-divider>
              </template>
              <!-- MENU -->

              
              <!-- Floor Plan -->
              <template
                v-if="
                  specificSpace?.floor_plan &&
                  specificSpace?.floor_plan?.length > 0
                "
              >
                <h3 class="my-5 px-2">Floor Plan</h3>
                <SpacesDetailsFloorPlan :specificSpace="specificSpace" />
                <v-divider class="mt-5"></v-divider>
              </template>

             
              <!-- Ratings -->
              <RatingDetails
                :ratingAverage="ratingAverage"
                :totalRatings="totalRatings"
                :isShowReviews="true"
                @showReviewsClicked="handleShowAllReviews"
              />
              <v-divider class="mt-5"></v-divider>
              <!-- Reviews -->
              <template v-if="userReviews.length">
                <v-col cols="12">
                  <h3 class="my-5 px-2">What they say</h3>
                  <RatingUserReviews :userReviews="userReviews" />
                  <v-btn
                    class="my-2"
                    @click="handleShowAllReviews()"
                    v-if="userReviews.length > 5"
                  >
                    Show all ({{ userReviews.length }}) reviews
                  </v-btn>
                  <v-divider class="mt-5"></v-divider>
                </v-col>
              </template>
            </v-col>

            <!-- RIGHT COLUMN -->
            <v-col
              class="right d-none d-md-block mb-n15"
              cols="12"
              sm="12"
              md="12"
              lg="5"
              :style="{ height: md ? '800px' : '1000px' }"
              v-if="!mdAndDown"
            >
              <v-form
                @submit.prevent
                ref="form"
                v-model="bookingFormValid"
                :key="`form-${step}`"
              >
                <!-- Step 1: Booking Details -->
                <template v-if="step === 1">
                  <v-card class="pa-sm-5 rounded-lg custom-card">
                    <!-- Prices and Booking Details -->
                    <div v-if="!showInquireForm">
                      <!-- <SpacesDetailsPrices :specificSpace="specificSpace" /> -->

                      <v-card class="pa-2 rounded-lg mt-5 custom-card">
                        <!-- Date and Guests -->
                        <v-row class="ma-0" no-gutters>
                          <!-- Date -->
                          <v-col
                            class="py-1 px-3"
                            style="
                              border-right: 1px solid #e0e0e0;
                              border-bottom: 1px solid #e0e0e0;
                            "
                          >
                            <span class="text-body-2 font-weight-medium"
                              >DATE</span
                            >
                            <!-- Date Picker for Desktop -->
                            <v-menu
                              v-model="dateInput"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              transition="scale-transition"
                              offset-y
                              min-width="290px"
                              class="d-none d-sm-block"
                            >
                              <template #activator="{ props }">
                                <v-text-field
                                  dense
                                  v-model="formattedDate"
                                  readonly
                                  persistent-hint
                                  v-bind="props"
                                  placeholder="Select Date"
                                  variant="plain"
                                  :rules="[requiredInput]"
                                  class="text-body-2"
                                  @update:model-value="handleChangeDate"
                                  @click="isInitialized = false"
                                >
                                </v-text-field>
                              </template>
                              <v-date-picker
                                v-model="date_calendar"
                                @input="dateInput = false"
                                show-adjacent-months
                                elevation="0"
                                no-time
                                @update:model-value="dateInput = false"
                                :min="new Date().toISOString().substring(0, 10)"
                                placeholder="Select a date"
                                :allowed-dates="getAllowedDates"
                                class="custom-border"
                              ></v-date-picker>
                            </v-menu>
                          </v-col>

                          <!-- Guests -->
                          <v-col
                            class="py-1 px-3"
                            style="border-bottom: 1px solid #e0e0e0"
                          >
                            <span class="text-body-2 font-weight-medium"
                              >Guests</span
                            >
                            <v-text-field
                              type="number"
                              min="0"
                              v-model="bookingForm.guests"
                              dense
                              persistent-hint
                              @keydown="preventNegative"
                              placeholder="Number of guests"
                              variant="plain"
                              :rules="[requiredInput]"
                              :label="
                                space.capacityLayout.maxCapacity <
                                bookingForm.guests
                                  ? `Guest (max ${space.capacityLayout.maxCapacity})`
                                  : ''
                              "
                              :color="
                                space.capacityLayout.maxCapacity <
                                bookingForm.guests
                                  ? 'orange'
                                  : ''
                              "
                              @update:model-value="handleGuestChange"
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>

                        <!-- Check In and Check Out -->
                        <v-row class="ma-0" no-gutters>
                          <!-- Check In -->
                          <v-col
                            class="py-1 px-3"
                            style="border-right: 1px solid #e0e0e0"
                          >
                          <span class="text-body-2 font-weight-medium" :class="!bookingForm.date.date ? 'opacity-20' : ''">CHECK IN</span>
                          <FormSelectCustom v-model="bookingForm.date.from" id="time-from" :items="checkAllowedTimeFrom || []"  dense persistent-hint placeholder="From" variant="plain"
                            :rules="[requiredInput]" :disabled="!bookingForm.date.date"
                             @update:model-value="handleTimeFromChange"
                            class="text-body-2" />
                          </v-col>

                          <!-- Check Out -->
                          <v-col class="py-1 px-3">
                            <span class="text-body-2 font-weight-medium" :class="!bookingForm.date.from ? 'opacity-20' : ''"
                              >CHECK OUT</span
                            >
                            <FormSelectCustom v-model="bookingForm.date.to" id="time-to" :items="checkAllowedTimeTo || []"
                                dense persistent-hint placeholder="To" variant="plain" :rules="[requiredInput]"
                                :disabled="!bookingForm.date.from" class="text-body-2"
                                @update:model-value="handleTimeToChange" />
                          </v-col>
                          <v-col cols="12" v-if="isBelowMinimumHours">
                            <v-card
                              variant="outlined"
                              color="orange"
                              class="py-2 px-7 my-1"
                            >
                              <v-row no-gutters>
                                <v-col cols="12">
                                  <v-icon
                                    icon="mdi-alert-box"
                                    class="mr-3"
                                    size="20"
                                  ></v-icon>
                                  <span class="text-black">
                                    {{ minimumHours }} hours minimum
                                  </span>
                                </v-col>
                                <v-col cols="12">
                                  <span class="text-black">
                                    The host is more likely to accept if your
                                    request meets their minimum duration.
                                  </span>
                                </v-col>
                              </v-row>
                            </v-card>
                          </v-col>

                          <v-col cols="12" v-if="existingEnquiry?.length > 0">
                            <v-card
                              variant="outlined"
                              color="primary"
                              class="py-2 px-7 my-1"
                            >
                              <v-row no-gutters>
                                <v-col cols="12">
                                  <v-row no-gutters>
                                    <v-col cols="1">
                                      <v-icon
                                        icon="mdi-check-circle"
                                        class="mr-1"
                                        size="20"
                                      ></v-icon>
                                    </v-col>
                                    <v-col class="">
                                      <span class="text-black text-14px">
                                        You have an ongoing enquiry with
                                        <span class="font-weight-bold"
                                          >{{ specificSpace.name }}.</span
                                        >
                                        <br /><span class="text-black">
                                          Contact
                                          <span class="font-weight-bold"
                                            >{{
                                              specificSpace.venue.user
                                                .first_name
                                            }}
                                            {{
                                              specificSpace.venue.user.last_name
                                            }}</span
                                          >
                                          regarding your ongoing enquiry.
                                        </span>
                                      </span>
                                    </v-col>
                                  </v-row>
                                </v-col>
                              </v-row>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-card>

                      <!-- Flexibility Checkbox -->
                      <v-row
                        class="my-1 d-flex align-center no-gutters"
                        v-if="existingEnquiry?.length === 0"
                      >
                        <v-col cols="auto" class="d-flex align-center">
                          <v-checkbox
                            v-model="bookingForm.flexible_time"
                            class="ma-0"
                            hide-details
                            label="I'm flexible on date and time"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </div>

                    <v-row v-if="showComputation" no-gutters class="w-100 mb-5">
                      <v-divider class="mb-5"></v-divider>
                      <EnquiryReviewOfferComputation
                        :space="specificSpace"
                        :computed-data="computedOffer"
                        without-borders
                        show-computation-only
                        hide-price-details-label
                        :loading="loadingComputation"
                      />
                    </v-row>

                    <!-- Button in the Footer -->
                    <v-btn
                      class="rounded-lg mt-2"
                      size="large"
                      color="primary"
                      block
                      :style="{ fontSize: '14px' }"
                      :disabled="loggedIn && currentUser?.role !== 'USER'"
                      v-if="existingEnquiry?.length > 0"
                    >
                      <NuxtLink
                        class="text-decoration-none text-white"
                        :to="{
                          name: 'country-enquiries-message-id',
                          params: { country, id: existingEnquiry[0]?._id },
                        }"
                      >
                        Go to inbox
                      </NuxtLink>
                    </v-btn>

                    <v-btn
                      class="rounded-lg"
                      size="large"
                      color="primary"
                      @click="handleNext"
                      v-if="existingEnquiry?.length === 0 && step === 1"
                      block
                      :style="{ fontSize: '14px' }"
                      :disabled="
                        (loggedIn && currentUser?.role !== 'USER') ||
                        !isSpacePublished || !isSpaceVerified
                      "
                    >
                      Inquire Now
                    </v-btn>
                    <span
                      v-if="!isSpacePublished"
                      class="text-warning text-14px d-flex justify-center mt-2"
                      >This space is not published.</span
                    >
                    <span
                      v-if="!isSpaceVerified"
                      class="text-orange-darken-2 text-14px d-flex justify-center mt-2"
                      >This space has not been fully verified.</span
                    >
                  </v-card>
                </template>

                <!-- Step 2: Message to Host -->
                <template v-if="step === 2">
                  <v-card class="pa-5 px-6 rounded-lg custom-card">
                    <!-- Back Button -->
                    <span
                      class="font-500 text-16px"
                      @click="step--"
                      style="cursor: pointer"
                    >
                      <v-icon class="mr-1">mdi-arrow-left</v-icon>
                      Back
                    </span>

                    <!-- Message Section -->
                    <p class="text-16px font-weight-bold my-5">
                      Message to {{ specificSpace.venue.user.first_name }}
                      {{ specificSpace.venue.user.last_name }}
                    </p>

                    <v-textarea
                      variant="outlined"
                      v-model="bookingForm.message"
                      placeholder="Type your message..."
                      rows="3"
                      required
                      no-resize
                      :rules="[requiredInput]"
                    ></v-textarea>

                    <!-- Catering Options -->
                    <v-row
                      no-gutters
                      class="d-flex align-center"
                      v-if="space.FoodAndBeverages.offerCatering"
                    >
                      <v-col cols="auto" class="ma-0 d-flex align-center">
                        <v-checkbox
                          v-model="bookingForm.require_catering"
                          class="ma-0"
                          hide-details
                          label="I require catering"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                    <v-row
                      no-gutters
                      class="d-flex align-center"
                      v-if="bookingForm.require_catering"
                    >
                      <v-col
                        cols="6"
                        v-for="cateringItem in bookingForm.catering_options"
                        class="d-flex flex-row align-center"
                      >
                        <v-responsive
                          height="40"
                          max-width="40"
                          class="d-flex align-center"
                        >
                          <v-checkbox
                            hide-details
                            v-model="cateringItem.value"
                          ></v-checkbox>
                        </v-responsive>
                        <span>{{ cateringItem.name }}</span>
                      </v-col>
                    </v-row>

                    <v-row
                      no-gutters
                      class="d-flex align-center"
                      v-if="space.FoodAndBeverages.allowExternalCatering"
                    >
                      <v-col cols="auto" class="ma-0 d-flex align-center">
                        <v-checkbox
                          v-model="bookingForm.own_catering"
                          class="ma-0"
                          hide-details
                          label="I want my own catering"
                        ></v-checkbox>
                      </v-col>
                    </v-row>

                    <v-btn
                      class="rounded-lg mt-5"
                      size="large"
                      color="primary"
                      @click="handleNext"
                      v-if="step === 2"
                      block
                      :style="{ fontSize: '14px' }"
                      :loading="loadingEnquiry"
                    >
                      Send Message
                    </v-btn>
                  </v-card>
                </template>
              </v-form>

              <!-- Report this listing -->
              <!-- <v-col cols="12">
              <v-row justify="center">
                <div class="d-flex align-center mt-4">
                  <v-img src="/public/report.svg" height="20px" width="20px" />
                  <NuxtLink to="/some-path" class="ml-2" style="color: #555763">
                    Report this listing
                  </NuxtLink>
                </div>
              </v-row>
            </v-col> -->
            </v-col>
          </v-row>
        </v-row>
      </v-col>

      <v-col cols="12" xxl="10" xl="10" lg="10">
        <!-- <v-row
        :class="mobile ? 'd-flex justify-center align-center text-center' : ''"
      >
        <v-col cols="12" md="auto" class="text-center">
          <h2 class="display-rating font-500 mb-1">{{ spaceRatingOverall }}</h2>
          <v-rating
            :model-value="spaceRatingOverall"
            color="amber"
            half-increments
            dense
            size="24"
            :item-padding="5"
            class="mr-2"
            readonly
          ></v-rating>
        </v-col>
      </v-row> -->

        <!-- <v-divider class="my-4" color="grey lighten-2" height="1"></v-divider> -->

        <!-- <h2 class="py-5" :class="mobile ? 'ml-4' : ''">What they say</h2> -->

        <!-- <v-row>
        <v-col v-for="n in 6" :key="n" cols="12" lg="6" sm="6" md="6">
          <CardReviewVenueCard
            avatar-src="/path/to/avatar.jpg"
            user-name="Sarah M."
            user-details="2 years on Venue4use"
            :rating="5"
            review-date="1 week ago"
            review-text="I Do in Our Eden exceeded all our expectations. The venue is breathtaking, the staff is professional yet friendly, and they helped us create a wedding that was both elegant and unforgettable. We received endless compliments on the..."
          />
        </v-col>
      </v-row>

      <v-btn
        :class="mobile ? 'ml-4' : 'custom-outlined-btn rounded-lg font-400'"
        outlined
        @click="reviewDialog = true"
      >
        Show all 328 reviews
      </v-btn> -->

        <!-- <v-divider class="my-4" color="grey lighten-2" height="1"></v-divider> -->
        <!-- <v-divider class="my-4" color="grey lighten-2" height="1"></v-divider> -->
      </v-col>
    </v-row>

    <!-- Fixed booking button at the bottom -->
    <!-- <v-row v-if="!showBookingColumn">
      <v-card
        class="pa-5 rounded-lg"
        style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000"
      >
        <v-btn
          class="custom-show d-flex d-lg-none w-100"
          color="primary"
          @click="toggleBookingColumn"
          :disabled="
            (loggedIn && currentUser?.role !== 'USER') || !isSpacePublished
          "
        >
          Book
        </v-btn>
        <span
          v-if="!isSpacePublished"
          class="d-flex d-lg-none text-warning text-14px d-flex justify-center mt-2"
          >This space is not published.</span
        >
      </v-card>
    </v-row> -->

    <v-bottom-navigation
      :model-value="true"
      v-if="isSmallScreen"
      class="pa-4 d-block d-lg-none"
      height="100%"
    >
      <v-card v-if="!isVisible" class="rounded-lg w-100" style="">
        <v-btn
          variant="flat"
          block
          color="primary"
          class="bg-primary"
          density="comfortable"
          @click.stop="toggleNavigation"
          :disabled="
            (loggedIn && currentUser?.role !== 'USER') || !isSpacePublished || !isSpaceVerified
          "
        >
          BOOK
        </v-btn>
        <span
          v-if="!isSpacePublished"
          class="d-flex text-warning text-14px d-flex justify-center mt-2"
          >This space is not published.</span
        >
        <span v-if="!isSpaceVerified" class="text-orange-darken-2 text-14px d-flex justify-center py-2">This space has not been fully verified.</span>
      </v-card>

      <v-card v-if="isVisible" class="w-100" :elevation="0" flat>
        <v-row
          class="justify-end py-3 pr-3"
          style="position: relative"
          no-gutters
        >
          <v-btn
            variant="flat"
            :size="x - small"
            @click="closeNavigation"
            icon="mdi-close"
          ></v-btn>
        </v-row>

        <v-form
          @submit.prevent
          ref="form"
          v-model="bookingFormValid"
          :key="`form-${step}`"
        >
          <!-- Step 1: Booking Details -->
          <template v-if="step === 1">
            <!-- Prices and Booking Details -->
            <div v-if="!showInquireForm" class="scrollabe-content" style="">
              <!-- Date and Guests -->
              <v-row class="ma-0" no-gutters>
                <!-- Date -->
                <v-col
                  class="py-1 px-3"
                  style="
                    border-right: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
                  "
                >
                  <span class="text-body-2 font-weight-medium">DATE</span>
                  <v-menu
                    v-model="dateInput"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                    class="included"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        dense
                        v-model="formattedDate"
                        readonly
                        persistent-hint
                        v-bind="props"
                        placeholder="Select Date"
                        variant="plain"
                        :rules="[requiredInput]"
                        class="text-body-2"
                        @update:model-value="handleChangeDate"
                        @click="isInitialized = false"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="date_calendar"
                      @input="dateInput = false"
                      show-adjacent-months
                      elevation="0"
                      no-time
                      @update:model-value="dateInput = false"
                      :min="new Date().toISOString().substring(0, 10)"
                      placeholder="Select a date"
                      :allowed-dates="getAllowedDates"
                      class="custom-border included"
                    ></v-date-picker>
                  </v-menu>
                </v-col>

                <!-- Guests -->
                <v-col
                  class="py-1 px-3"
                  style="border-bottom: 1px solid #e0e0e0"
                >
                  <span class="text-body-2 font-weight-medium">Guests</span>
                  <v-text-field
                    type="number"
                    min="0"
                    v-model="bookingForm.guests"
                    dense
                    persistent-hint
                    @keydown="preventNegative"
                    placeholder="Number of guests"
                    variant="plain"
                    :rules="[requiredInput]"
                    :label="
                      space.capacityLayout.maxCapacity < bookingForm.guests
                        ? `Guest (max ${space.capacityLayout.maxCapacity})`
                        : ''
                    "
                    :color="
                      space.capacityLayout.maxCapacity < bookingForm.guests
                        ? 'orange'
                        : ''
                    "
                    @update:model-value="handleGuestChange"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Check In and Check Out -->
              <v-row class="ma-0" no-gutters>
                <!-- Check In -->
                <v-col
                  class="py-1 px-3"
                  style="border-right: 1px solid #e0e0e0"
                >
                  <span class="text-body-2 font-weight-medium" :class="!bookingForm.date.date ? 'opacity-20' : ''">CHECK IN</span>
                  <FormSelectCustom
                    v-model="bookingForm.date.from"
                    :items="checkAllowedTimeFrom"
                    item-title="label"
                    item-value="value"
                    item-disabled="disabled"
                    dense
                    persistent-hint
                    placeholder="From"
                    variant="plain"
                    :rules="[requiredInput]"
                    :disabled="!bookingForm.date.date"
                    @update:model-value="handleTimeFromChange"
                    class="text-body-2"
                  ></FormSelectCustom>
                </v-col>

                <!-- Check Out -->
                <v-col class="py-1 px-3">
                  <span class="text-body-2 font-weight-medium" :class="!bookingForm.date.from ? 'opacity-20' : ''">CHECK OUT</span>
                  <FormSelectCustom
                    v-model="bookingForm.date.to"
                    :items="checkAllowedTimeTo"
                    item-title="label"
                    item-value="value"
                    item-disabled="disabled"
                    dense
                    persistent-hint
                    placeholder="To"
                    variant="plain"
                    :rules="[requiredInput]"
                    :disabled="!bookingForm.date.from"
                    class="text-body-2"
                    @update:model-value="handleTimeToChange"
                  ></FormSelectCustom>
                </v-col>
                <v-col cols="12" v-if="isBelowMinimumHours">
                  <v-card
                    variant="outlined"
                    color="orange"
                    class="py-2 px-7 my-1"
                  >
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-icon
                          icon="mdi-alert-box"
                          class="mr-3"
                          size="20"
                        ></v-icon>
                        <span class="text-black">
                          {{ minimumHours }} hours minimum
                        </span>
                      </v-col>
                      <v-col cols="12">
                        <span class="text-black">
                          The host is more likely to accept if your request
                          meets their minimum duration.
                        </span>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>

                <v-row
                  v-if="showComputation"
                  no-gutters
                  class="w-100 mb-5 px-3"
                >
                  <v-divider class="mb-5"></v-divider>
                  <EnquiryReviewOfferComputation
                    :space="specificSpace"
                    :computed-data="computedOffer"
                    without-borders
                    show-computation-only
                    hide-price-details-label
                    :loading="loadingComputation"
                  />
                </v-row>

                <v-col cols="12" v-if="existingEnquiry?.length > 0">
                  <v-card
                    variant="outlined"
                    color="primary"
                    class="py-2 px-7 my-1"
                  >
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-row no-gutters>
                          <v-col cols="1">
                            <v-icon
                              icon="mdi-check-circle"
                              class=""
                              size="20"
                            ></v-icon>
                          </v-col>
                          <v-col class="">
                            <span class="text-black">
                              You have an ongoing enquiry with
                              <span class="font-weight-bold"
                                >{{ specificSpace.name }}.</span
                              ><br class="d-sm-none" />
                              <span class="text-black">
                                Contact
                                <span class="font-weight-bold"
                                  >{{ specificSpace.venue.user.first_name }}
                                  {{ specificSpace.venue.user.last_name }}</span
                                >
                                regarding your ongoing enquiry.
                              </span>
                            </span>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Flexibility Checkbox -->
              <v-row
                class="my-1 d-flex align-center no-gutters"
                v-if="existingEnquiry?.length === 0"
              >
                <v-col cols="auto" class="d-flex align-center">
                  <v-checkbox
                    v-model="bookingForm.flexible_time"
                    hide-details
                    label="I'm flexible on date and time"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </div>

            <!-- Button in the Footer -->
            <v-btn
              class="mt-4 w-100 bg-primary"
              size="small"
              color="primary"
              density="compact"
              :style="{ fontSize: '14px' }"
              :disabled="loggedIn && currentUser?.role !== 'USER'"
              v-if="existingEnquiry?.length > 0"
            >
              <NuxtLink
                class="text-decoration-none text-white"
                :to="{
                  name: 'country-enquiries-message-id',
                  params: { country, id: existingEnquiry[0]?._id },
                }"
              >
                Go to inbox
              </NuxtLink>
            </v-btn>
            <v-btn
              class="bg-primary w-100"
              density="compact"
              @click="handleNext"
              v-if="existingEnquiry?.length === 0 && step === 1"
              block
              :disabled="
                (loggedIn && currentUser?.role !== 'USER') || !isSpacePublished
              "
            >
              Inquire Now
            </v-btn>

            <span
              v-if="!isSpacePublished"
              class="text-warning text-14px d-flex justify-center mt-2"
              >This space is not published.</span
            >
          </template>

          <!-- Step 2: Message to Host -->
          <template v-if="step === 2">
            <!-- Back Button -->
            <span
              class="font-500 text-16px"
              @click="step--"
              style="cursor: pointer"
            >
              <v-icon class="mr-1">mdi-arrow-left</v-icon>
              Back
            </span>

            <!-- Message Section -->
            <p class="text-16px font-weight-bold my-5">
              Message to {{ specificSpace.venue.user.first_name }}
              {{ specificSpace.venue.user.last_name }}
            </p>

            <v-textarea
              variant="outlined"
              v-model="bookingForm.message"
              placeholder="Type your message..."
              rows="3"
              required
              :rules="[requiredInput]"
              no-resize
            ></v-textarea>

            <!-- Catering Options -->
            <v-row
              no-gutters
              class="d-flex align-center"
              v-if="space.FoodAndBeverages.offerCatering"
            >
              <v-col cols="auto" class="ma-0 d-flex align-center">
                <v-checkbox
                  v-model="bookingForm.require_catering"
                  class="ma-0"
                  hide-details
                  label="I require catering"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="d-flex align-center"
              v-if="bookingForm.require_catering"
            >
              <v-col
                cols="12"
                sm="6"
                v-for="cateringItem in bookingForm.catering_options"
                class="d-flex flex-row align-center text-16px mt-1"
              >
                <v-responsive
                  height="40"
                  max-width="40"
                  class="d-flex align-center"
                >
                  <v-checkbox
                    hide-details
                    v-model="cateringItem.value"
                  ></v-checkbox>
                </v-responsive>
                <span>{{ cateringItem.name }}</span>
              </v-col>
            </v-row>

            <v-row
              no-gutters
              class="d-flex align-center"
              v-if="space.FoodAndBeverages.allowExternalCatering"
            >
              <v-col cols="auto" class="ma-0 d-flex align-center">
                <v-checkbox
                  v-model="bookingForm.own_catering"
                  class="ma-0"
                  hide-details
                  label="I want my own catering"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-btn
              density="compact"
              class="bg-primary mt-5"
              @click="handleNext"
              v-if="step === 2"
              block
              :style="{ fontSize: '14px' }"
              :loading="loadingEnquiry"
            >
              Send Message
            </v-btn>
          </template>
        </v-form>
      </v-card>
    </v-bottom-navigation>

    <!-- SHARING Column for Mobile -->
    <v-bottom-sheet
      v-model="showSharingColumn"
      @click:outside="showSharingColumn = false"
    >
      <v-card
        class="pa-6 rounded-t-lg"
        style="
          background: white;
          box-shadow: rgba(0, 0, 0, 0.45) 0px -15px 20px -10px;
        "
      >
        <v-row no-gutters justify="space-between" align="center" class="mb-4">
          <p class="text-20px font-500">Share this venue</p>
          <v-btn
            @click.stop="showSharingColumn = false"
            size="small"
            variant="flat"
            icon="mdi-close"
          ></v-btn>
        </v-row>

        <v-row no-gutters justify="space-between" align="center">
          <v-col cols="6">
            <v-img
              :src="
                featuredImageSrc()?.path ||
                'https://picsum.photos/500/300?image=232'
              "
              cover
              rounded="lg"
              height="140px"
              alt="Space Featured Image"
            ></v-img>
          </v-col>

          <v-col cols="6">
            <v-card-text class="ml-2">
              <p class="font-500 text-18px">{{ specificSpace.name }}</p>
              <p class="text-18px">{{ specificSpace.venue.name }}</p>
            </v-card-text>
          </v-col>
        </v-row>

        <div class="links">
          <v-row no-gutters class="mt-3">
            <v-col cols="6" class="pa-1">
              <v-card
                variant="outlined"
                class="pa-1 rounded-lg"
                color="grey"
                link
                @click="copyLink"
              >
                <div class="d-flex align-center">
                  <v-col>
                    <span class="ml-2 text-black">Copy Link</span>
                  </v-col>
                </div>
              </v-card>
            </v-col>

            <v-col cols="6" class="pa-1">
              <v-card
                variant="outlined"
                class="pa-1 rounded-lg"
                color="grey"
                link
                @click="sendEmail"
              >
                <div class="d-flex align-center">
                  <v-col>
                    <span class="ml-2 text-black">Email</span>
                  </v-col>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="6" class="pa-1">
              <v-card
                variant="outlined"
                class="pa-1 rounded-lg"
                color="grey"
                link
                @click="shareViaSMS"
              >
                <div class="d-flex align-center">
                  <v-col>
                    <span class="ml-2 text-black">Messages</span>
                  </v-col>
                </div>
              </v-card>
            </v-col>

            <v-col cols="6" class="pa-1">
              <v-card
                variant="outlined"
                class="pa-1 rounded-lg"
                color="grey"
                link
                @click="shareOnWhatsApp"
              >
                <div class="d-flex align-center">
                  <v-col>
                    <span class="ml-2 text-black">WhatsApp</span>
                  </v-col>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="6" class="pa-1">
              <v-card
                variant="outlined"
                class="pa-1 rounded-lg"
                color="grey"
                link
                @click="shareOnMessenger"
              >
                <div class="d-flex align-center">
                  <v-col>
                    <span class="ml-2 text-black">Messenger</span>
                  </v-col>
                </div>
              </v-card>
            </v-col>

            <v-col cols="6" class="pa-1">
              <v-card
                variant="outlined"
                class="pa-1 rounded-lg"
                color="grey"
                link
                @click="shareOnFacebook"
              >
                <div class="d-flex align-center">
                  <v-col>
                    <span class="ml-2 text-black">Facebook</span>
                  </v-col>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-bottom-sheet>

    <v-col cols="12" :class="md ? 'mt-15' : ''">
      <v-col
        cols="12"
        style="height: 700px"
        :class="md ? 'mt-16 pt-16' : 'mt-15'"
      >
        <MapGoogleMap
          :country="country"
          :coordinates="coordinates"
          :showDetails="false"
        />
      </v-col>
    </v-col>

    <v-row no-gutters :class="smAndDown ? 'mx-2' : 'mx-16 px-15'">
      <KeywordsDisplay :keywords="specificSpace.keywords" />
    </v-row>

    <DialogAddTeamMember v-model:reviewDialog="reviewDialog" />
    <DialogRequireLoggedIn
      v-model="dialogRequireLoggedIn"
      :enquire="enquire"
      :formData="{
        date_calendar: date_calendar,
        bookingFrom: bookingForm.date.from,
        bookingTo: bookingForm.date.to,
        guest: bookingForm.guests,
      }"
    />

    <v-dialog v-model="showEnquireDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Booking Enquiry</span>
        </v-card-title>
        <v-form
          @submit.prevent
          ref="form"
          v-model="bookingFormValid"
          :key="`form-${step}`"
        >
          <v-container>
            <!-- Booking Details -->
            <v-row>
              <v-col cols="12" v-if="step === 1">
                <!-- Date Picker -->
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="dateInput"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        dense
                        v-model="formattedDate"
                        readonly
                        persistent-hint
                        v-bind="props"
                        placeholder="Select Date"
                        prepend-icon="mdi-calendar-month"
                        variant="underlined"
                        :rules="[requiredInput]"
                        label="Date"
                      />
                    </template>
                    <v-date-picker
                      v-model="date_calendar"
                      @input="dateInput = false"
                      show-adjacent-months
                      elevation="24"
                      no-time
                      @update:model-value="dateInput = false"
                      :min="new Date().toISOString().substring(0, 10)"
                      :allowed-dates="getAllowedDates"
                    />
                  </v-menu>
                </v-col>

                <!-- Time Selection -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="bookingForm.date.from"
                    :items="checkAllowedTimeFrom"
                    label="From"
                    :rules="[requiredInput]"
                  />
                  <v-select
                    v-model="bookingForm.date.to"
                    :items="checkAllowedTimeTo"
                    label="To"
                    :rules="[requiredInput]"
                  />
                </v-col>

                <!-- Number of Guests -->
                <v-col cols="12">
                  <v-text-field
                    v-model="bookingForm.guests"
                    label="Number of Guests"
                    type="number"
                    :rules="[requiredInput]"
                  />
                </v-col>

                <!-- Catering Options -->
                <v-col cols="12">
                  <v-checkbox
                    v-model="bookingForm.own_catering"
                    label="Own Catering"
                  />
                  <v-checkbox
                    v-model="bookingForm.require_catering"
                    label="Require Catering"
                  />
                </v-col>

                <!-- Catering Checkbox Group -->
                <v-col cols="12">
                  <v-checkbox-group
                    v-model="bookingForm.catering_options"
                    :items="[
                      { name: 'Breakfast', value: 'Breakfast' },
                      { name: 'Dinner', value: 'Dinner' },
                      {
                        name: 'Tea & Coffee Break',
                        value: 'Tea & Coffee Break',
                      },
                      { name: 'Drinks reception', value: 'Drinks reception' },
                      { name: 'Lunch', value: 'Lunch' },
                      { name: 'Other', value: 'Other' },
                    ]"
                  />
                </v-col>

                <!-- Additional Message -->
                <v-col cols="12">
                  <v-textarea
                    v-model="bookingForm.message"
                    label="Additional Message"
                  />
                </v-col>
              </v-col>

              <!-- Message to Host -->
              <v-col cols="12" v-if="step === 2">
                <v-btn
                  variant="text"
                  @click="showInquireForm = false"
                  prepend-icon="mdi-arrow-left"
                >
                  Back
                </v-btn>
                <p class="font-weight-bold my-5">
                  Message to {{ specificSpace.venue.user.first_name }}
                  {{ specificSpace.venue.user.last_name }}
                </p>
                <v-textarea
                  variant="outlined"
                  v-model="inquireMessage"
                  placeholder="Type your message..."
                  rows="3"
                  required
                  no-resize
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <v-card-actions>
          <v-btn text @click="showEnquireDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="handleNext">
            {{ step === 1 ? "Next" : "Submit" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <FavoritesCreateFolderDialog
      :space_id="specificSpace._id"
      v-model="createFolderDialog"
      @folderCreated="folderCreated"
    />
    <FavoritesAddToFavorites
      :space_id="specificSpace._id"
      :favoriteObj="favoriteObj"
      v-model="addToFolderDialog"
      @folderCreated="folderCreated"
    />
    <RatingOverallReviews
      v-model="isShowAllReviewsDialog"
      :userReviews="userReviews"
      :ratingAverage="ratingAverage"
      :totalRatings="totalRatings"
    />
  </v-row>

  <CarouselImageViewer
    v-model:show="showImageViewer"
    v-model:images="imagesArray"
    :active-image-id="activeImageId"
    show-extra-buttons
    :is-favorite="specificSpace?.marked_as_favorite?.isFavorite"
    @share="toggleShareButton"
    @like="handleFavorite()"
  />
  <DialogShareModal
    v-model:show-share-modal="showShareModal"
    :specificSpace="specificSpace"
    :featuredImageSrc="featuredImageSrc"
    :copyLink="copyLink"
    :sendEmail="sendEmail"
    :shareViaSMS="shareViaSMS"
    :shareOnWhatsApp="shareOnWhatsApp"
    :shareOnMessenger="shareOnMessenger"
    :shareOnFacebook="shareOnFacebook"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "venue-new-layout",
});

import { useDisplay } from "vuetify";
import MComputedOffer from "~/models/computed-offer.model";
const { mobile, smAndDown, md, mdAndDown, lgAndDown, name, smAndUp } =
  useDisplay();
const { loggedIn, currentUser, cookieOptions } = useLocalAuth();
const { formatAddress, requiredInput } = useUtils();
const { getVenue } = useVenue();
const { areaTypeOptions } = useSpaceData();
const { computePayment } = useEnquiry();
const {
  allowedDatesChecker,
  timesFrom,
  allowedTime,
  checkTimesToFunction,
  getSpace,
} = useSpace();
const { getEnquiryList } = useEnquiry();
const { setSnackbar } = useLocal();
const { getGroupOfFavorites } = useFavorites();
const { getOverallSpaceRating } = useRatings();
const showEnquireDialog = ref(false);
const loader = ref(false);
const enquire = ref(false);
const dateInput = ref(false);
const dialogRequireLoggedIn = ref(false);
const date_calendar = ref(null);
const { venue, country } = useRoute().params;
const specificSpace = ref({});
const venueData = ref({});
const imagesArray = [];
const step = ref(1);
const bookingFormValid = ref(false);
const form = ref(null);
const coordinates = ref([]);
const bookings = ref([]);
const router = useRouter();
const showImageModal = ref(false);
const showShareModal = ref(false);
const selectedImage = ref(null);
const showBookingColumn = ref(false);
const showSharingColumn = ref(false);
const minimumHours = ref(0);
const showInquireForm = ref(false);
const currentIndex = ref(0);
const spaceRatingOverall = ref(null);
const existingEnquiry = ref([]);
const createFolderDialog = ref(false);
const addToFolderDialog = ref(false);
const reviewDialog = ref(false);
const favoriteObj = ref();
const formDataCookie = useCookie<Object>("formData");
const activeImageId = ref("");
const showImageViewer = ref(false);
const loadingEnquiry = ref(false);
const isInitialized = ref(false);
const ratingAverage = ref<number>(0);
const totalRatings = ref<number>(0);
const userReviews = ref([]);
const isShowAllReviewsDialog = ref(false);

const space = ref({
  representation: {
    name: "",
    imageSource: "",
  },
  capacityLayout: {
    standing: false,
    seating: [],
    maxStanding: 0,
    maxSeating: 0,
    maxCapacity: 0,
  },
  FoodAndBeverages: {
    allowExternalCatering: false,
    offerCatering: false,
  },
});

const isVisible = ref(false);

const toggleNavigation = () => {
  if (!useCookie("user", cookieOptions).value) {
    dialogRequireLoggedIn.value = true;
    enquire.value = false;
    return;
  }

  isVisible.value = !isVisible.value;
};

const closeNavigation = () => {
  isVisible.value = false;
};

const msg = `Here’s a venue that might be perfect for your next event: ${window.location.href}`;

const isSpacePublished = computed(() => {
  return specificSpace.value.status == "PUBLISHED";
});

const isSpaceVerified = computed(() => {
  return specificSpace.value.venue.user?.fully_verified 
});

/* Overall Average Ratings */
const fetchOverallSpaceRating = async () => {
  if (!specificSpace.value?._id) {
    console.warn("No specific space ID available");
    return;
  }

  try {
    const spaceId = specificSpace.value._id;
    const ratingData = await getOverallSpaceRating(spaceId);

    if (!ratingData || ratingData.length === 0) {
      userReviews.value = [];
      return;
    }

    const spaceData = ratingData[0];

    userReviews.value =
      spaceData.details?.map((review: any) => ({
        id: review._id,
        userId: review.user?._id || "",
        spaceId: review.space || "",
        name: `${review.user?.first_name || ""} ${review.user?.last_name || ""}`,
        createdAt: review.user?.createdAt || "",
        privateNote: review.privateNote || "",
        publicNote: review.publicNote || "",
        rating: review.rating || 0,
        updatedAt: review.updatedAt || "",
        user: review.user || null,
      })) || [];
  } catch (error) {
    console.error("Error fetching rating and reviews:", error);
  }
};

watch(
  () => specificSpace.value._id,
  (newSpaceId) => {
    if (newSpaceId) {
      fetchOverallSpaceRating();
    }
  }
);

const handleShowAllReviews = () => {
  if (totalRatings.value > 0) {
    isShowAllReviewsDialog.value = true;
  }
};

const hasOfferData = computed(() => {
  const foodAndBeveragesData =
    specificSpace.value.venue?.foods_and_beverages?.find(
      (item) => item.answer === true
    );

  const facilitiesData =
    specificSpace.value.features?.filter(
      (item) => item.reference === "facilities" && item.answer === true
    ).length > 0;

  const customFacilitiesData =
    specificSpace.value.features?.find(
      (space) => space.key === "12" && space.answer
    )?.options?.length > 0;

  return facilitiesData || customFacilitiesData || foodAndBeveragesData;
});

const bookingForm = reactive({
  date: {
    date: "",
    from: null as string | null,
    to: null as string | null,
  },
  type: "",
  guests: null,
  value: 0,
  space: "",
  status: null,
  own_catering: false,
  require_catering: false,
  flexible_time: false,
  catering_options: [
    {
      name: "Breakfast",
      value: false,
    },
    {
      name: "Dinner",
      value: false,
    },
    {
      name: "Tea & Coffee Break",
      value: false,
    },
    {
      name: "Drinks reception",
      value: false,
    },
    {
      name: "Lunch",
      value: false,
    },
    {
      name: "Other",
      value: false,
    },
  ],
  message: "",
});

let startY = 0;
let isSwiping = false;

const closeBookingColumn = () => {
  showBookingColumn.value = false;
  document.body.classList.remove("no-scroll");
};

const privateSpaceData = computed(() => {
  return areaTypeOptions.find(
    (option) => option.key === "PRIVATE_SPACE_WITHIN_THE_VENUE"
  );
});

const openBookingColumn = () => {
  showBookingColumn.value = true;
  document.body.classList.add("no-scroll");
};

// Handle touch start
const onBookingTouchStart = (event) => {
  startY = event.touches[0].clientY;
  isSwiping = true; // Begin tracking swipe
};

// Handle touch move
const onBookingTouchMove = (event) => {
  if (!isSwiping) return; // Exit if not swiping

  const currentY = event.touches[0].clientY;
  const diffY = currentY - startY;

  // Define swipe thresholds
  const swipeThreshold = 50;

  // Swiping down
  if (diffY > swipeThreshold) {
    if (showBookingColumn.value) {
      closeBookingColumn();
    }
  }
  // Swiping up
  else if (diffY < -swipeThreshold) {
    if (!showBookingColumn.value) {
      openBookingColumn();
    }
  }
};

// Handle touch end
const onBookingTouchEnd = () => {
  isSwiping = false; // Reset swipe tracking on touch end
};

// Toggle the booking column
const toggleBookingColumn = () => {
  showBookingColumn.value = !showBookingColumn.value;
};

// Toggle the sharing column
const toggleSharingColumn = () => {
  showSharingColumn.value = !showSharingColumn.value;
};

const openModal = (imageId) => {
  console.log("working");

  if (!imageId) return;
  activeImageId.value = imageId;
  showImageViewer.value = true;
};

const getSpaceDetails = () => {
  const representation = areaTypeOptions.filter(
    (type) => type.key === specificSpace.value.representation
  );
  const standingLayout = specificSpace.value.capacity_layout.filter(
    (layout) => layout.question === "Standing"
  )[0];
  const seatingLayout = specificSpace.value.capacity_layout
    .filter(
      (layout) => layout.question !== "Standing" && layout.answer === true
    )
    .reduce(
      (max, current) =>
        current.max_capacity > max.max_capacity ? current : max,
      specificSpace.value.capacity_layout[0]
    );

  const maxCapacityLayout = specificSpace.value.capacity_layout
    .filter((layout) => layout.answer === true)
    .reduce(
      (max, current) =>
        current.max_capacity > max.max_capacity ? current : max,
      specificSpace.value.capacity_layout[0]
    );

  space.value.capacityLayout.standing = standingLayout.answer;
  space.value.capacityLayout.maxStanding = standingLayout.max_capacity;
  space.value.capacityLayout.maxSeating = seatingLayout.max_capacity;
  space.value.capacityLayout.maxCapacity = maxCapacityLayout.max_capacity;
  space.value.representation.name = representation[0].name;
  space.value.representation.imageSource = representation[0].imagePath;
  space.value.FoodAndBeverages.offerCatering =
    specificSpace.value.venue?.foods_and_beverages?.filter(
      (food) => food.question === "The venue offers in-house catering services"
    )[0]?.answer || "";
  space.value.FoodAndBeverages.allowExternalCatering =
    specificSpace.value.venue.foods_and_beverages?.filter(
      (food) =>
        food.question ===
        "The venue exclusively collaborates with an approved roster of external caterers"
    )[0]?.answer || "";
};

async function loadVenueData(): Promise<{ data: any; error: any }> {
  try {
    const params = { space_id: venue };
    const queryString = new URLSearchParams(params).toString();
    const id = queryString.replace("space_id=", "");

    const { data, error } = await getSpace(id);

    if (data) {
      const spaceData = data?.value?.data.data[0];
      if (!spaceData) throw new Error("No space data found");

      specificSpace.value = spaceData;
      ratingAverage.value = spaceData.rating?.averageRating ?? 0;
      totalRatings.value = spaceData.rating?.totalReviews ?? 0;
      bookingForm.space = spaceData._id;

      const allPhotos = [...spaceData.space_photo];
      const sortedImages = allPhotos.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      imagesArray.push(...sortedImages);

      const coordinatesData = spaceData.venue?.address?.coordinates;
      if (coordinatesData) {
        coordinates.value.push({
          lat: parseFloat(coordinatesData.latitude),
          lng: parseFloat(coordinatesData.longitude),
        });
      }
      getSpaceDetails();
    }
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching venue data:", error);
    return { data: null, error };
  }
}

const handleBackClick = () => {
  const previousRoute = router.options.history.state.back as string;

  if (!previousRoute || previousRoute.match(/login|signup/) || !loggedIn.value) {
    router.push("/");
  } else {
    router.go(-1);
  }
};

// const isExpanded = ref(false);

// const toggleDescription = () => {
//   isExpanded.value = !isExpanded.value;
// };

// const truncateDescription = (text) => {
//   const words = text.split(" ");
//   if (text.length <= 200) {
//     return text;
//   }

//   if (words.length <= 100) {
//     return text.slice(0, 200) + "...";
//   }
//   return words.slice(0, 20).join(" ") + " ...";
// };

const getInquiry = async () => {
  try {
    let params = {
      status:
        "IN_PROGRESS,CUSTOM_OFFER_SENT,DECLINED,PAYMENT_FAILED,PAYMENT_IN_PROGRESS,OFFER_ACCEPTED,BOOKING_REQUESTED,BOOKING_REQUEST_DECLINED,BOOKING_REQUEST_WITHDRAWN,NEW",
      page: 1,
      limit: 1000,
      toggle_current: true,
      space_id: specificSpace.value._id,
    };

    const { data } = await getEnquiryList(params);

    const enquiryList = data.value.data.data;
    existingEnquiry.value = enquiryList.filter(
      (enquiry) =>
        enquiry.date.date === bookingForm.date.date &&
        enquiry.date.from === bookingForm.date.from &&
        enquiry.date.to === bookingForm.date.to
    );
  } catch (error) {
    console.log(error);
  }
};

const loadBookings = async () => {
  try {
    const queryObj = {
      space_id: specificSpace.value._id,
      limit: 1000,
      status: "CONFIRMED",
    };

    const { data, error } = await useAPI(`v1/bookings`, {
      method: "GET",
      query: queryObj,
    });
    bookings.value = data.value.data.data;
  } catch (error) {
    console.log(error);
  }
};

const formattedDate = computed(() => {
  if (!date_calendar.value) return "";
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

watch(date_calendar, async (newVal) => {
  bookingForm.date.date = formattedDate.value;
  loadBookings();
});

const checkAllowedTimeFrom = computed(() => {
  return allowedTime(
    specificSpace.value.pricing,
    date_calendar.value,
    bookings.value
  );
});

const checkAllowedTimeTo = computed(() => {
  return checkTimesToFunction(
    specificSpace.value.pricing,
    date_calendar.value,
    bookingForm.date.from,
    bookings.value
  );
});

watch(
  () => bookingForm.date,
  async (newVal) => {
    if (!loggedIn.value) {
      return;
    }

    if (newVal.date !== "" && newVal.from !== null && newVal.to !== null) {
      try {
        await getInquiry();
      } catch (error) {
        console.error("Error during inquiryFunction:", error);
      }
    }
  },
  { deep: true }
);

const isBelowMinimumHours = computed(() => {
  const getTimeKey = (timeValue) => {
    return timesFrom.find((t) => t.value == timeValue)?.key;
  };

  const startTimeKey = getTimeKey(bookingForm?.date?.from);
  const endTimeKey =
    bookingForm?.date?.to == "06:00" ? 49 : getTimeKey(bookingForm?.date?.to);

  const hours = (endTimeKey - startTimeKey) * 0.5;

  const minHours =
    specificSpace.value?.pricing?.hire_fee?.minimum_booking_hours;

  if (minHours) {
    if (typeof minHours == "string") {
      let pattern = /\d+/;
      // Extract numerical values
      let num = parseInt(minHours.match(pattern)[0]);
      minimumHours.value = num;
      return hours < num;
    } else if (typeof minHours == "number") {
      minimumHours.value = minHours;
      return hours < minHours;
    }
  } else return false;
});

function getAllowedDates(val) {
  return allowedDatesChecker(specificSpace.value.pricing, val);
}

const featuredImageSrc = () => {
  const imageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".svg",
    ".webp",
  ];

  // Sort images by createdAt date in ascending order
  const sortedImages = specificSpace.value.space_photo
    .filter((image) => {
      const extension = image.filename
        .substring(image.filename.lastIndexOf("."))
        .toLowerCase();
      return imageExtensions.includes(extension);
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Find the first image that matches the extension criteria
  const imageObj = sortedImages.find((image) => {
    const extension = image.filename
      .substring(image.filename.lastIndexOf("."))
      .toLowerCase();
    return imageExtensions.includes(extension);
  });

  return imageObj ? imageObj : null;
};

function openInGoogleMaps(val) {
  const latitude = parseFloat(val.latitude);
  const longitude = parseFloat(val.longitude);
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  window.open(url, "_blank");
}

const loadFavoriteObj = async () => {
  if (!loggedIn.value) return;
  const { data } = await getGroupOfFavorites();
  favoriteObj.value = data.value.results;
};

const favoriteObjCount = computed(() => {
  return favoriteObj.value.filter(
    (item) => item._id.folder_name !== "Recently Viewed"
  ).length;
});

const handleFavorite = async () => {
  if (!loggedIn.value) {
    dialogRequireLoggedIn.value = true;
    enquire.value = true;
    return;
  }
  if (!specificSpace.value.marked_as_favorite.isFavorite) {
    if (!favoriteObjCount.value) {
      return (createFolderDialog.value = true);
    } else {
      return (addToFolderDialog.value = true);
    }
  } else {
    await useAPI(`/v1/favorite/${specificSpace.value.marked_as_favorite._id}`, {
      method: "PATCH",
      body: JSON.stringify({
        marked_as_favorite: false,
      }),
    });
    setSnackbar({
      color: "success",
      text: "Removed from your favorites list",
      modal: true,
    });
  }
  await loadVenueData();
};
async function folderCreated() {
  await loadVenueData();
  await loadFavoriteObj();
  if (createFolderDialog.value == true) {
    return createFolderDialog.value == false;
  }
  if (addToFolderDialog.value == true) {
    return addToFolderDialog.value == flase;
  }
}

const handleNextMobile = () => {
  if (!loggedIn.value) {
    dialogRequireLoggedIn.value = true;
    form.value.resetValidation();
    enquire.value = false;
  } else {
    showEnquireDialog.value = true;
  }
};

const handleNext = async () => {
  if (!loggedIn.value) {
    dialogRequireLoggedIn.value = true;
    enquire.value = false;
    return;
  }
  bookingForm.type =
    (bookingForm.type
      ? bookingForm.type
      : specificSpace.value.keywords[0]?.keyword) || "Other";
  const {
    space,
    date,
    guests,
    own_catering,
    type,
    message,
    flexible_time,
    require_catering,
    catering_options,
  } = bookingForm;
  form.value.validate();
  if (bookingFormValid.value) {
    if (step.value == 2) {
      loadingEnquiry.value = true;
      await useAPI(`/v1/enquiries`, {
        method: "POST",
        body: JSON.stringify({
          space,
          date,
          guests,
          own_catering,
          type,
          message,
          flexible_time,
          require_catering,
          catering_options,
        }),
      })
        .then((res) => {
          if (res.data) {
            const enquiry_id = res.data.value.data.insertedId;
            if (!enquiry_id) {
              setSnackbar({
                color: "error",
                text: "Something went wrong. Please try again later.",
                modal: true,
              });
              return;
            }
            navigateTo({
              name: "country-enquiries-message-id",
              params: { country, id: enquiry_id },
            });
          }
        })
        .catch((err) => {
          console.log(err);
          setSnackbar({
            color: "error",
            text: "Something went wrong. Please try again later.",
            modal: true,
          });
          loadingEnquiry.value = false;
        });
    }
    form.value.resetValidation();
    if (step.value == 1) {
      step.value = 2;
    }
  }
};

onMounted(() => {
  const savedFormData = useCookie("formData");
  const redirect = useCookie("redirect_booking");
  if (savedFormData.value && redirect.value) {
    isInitialized.value = true;
    const formatedDate = new Date(savedFormData.value.date_calendar);
    date_calendar.value = formatedDate;
    bookingForm.guests = savedFormData.value.guest;
    bookingForm.date.from = savedFormData.value.bookingFrom;
    bookingForm.date.to = savedFormData.value.bookingTo;
    setTimeout(() => {
      //bookingForm.date.from = savedFormData.value.bookingFrom
      //bookingForm.date.to = savedFormData.value.bookingTo
      savedFormData.value = null;
      redirect.value = null;
    }, 1500);

    // bookingForm.type = useCookie("event_type").value;
    return;
  }
  bookingForm.type = useCookie("event_type").value;
  const eventDate = useCookie("eventDate").value;
  if (eventDate) {
    // cooment out for now, until the backend fix the issue
    date_calendar.value = new Date(eventDate);
    //date_calendar.value = null;
  }
  bookingForm.guests = useCookie("guestNumber").value || 1;
  // bookingForm.date.from = useCookie("timeFrom").value;
  // bookingForm.date.from = null;
  // bookingForm.date.to = useCookie("timeTo").value;
  // bookingForm.date.to = null;
});

onBeforeMount(async () => {
  loader.value = true;
  await loadVenueData();
  await loadBookings();
  await loadFavoriteObj();
  loader.value = false;
});

const toggleShareButton = () => {
  if (smAndDown.value) {
    showSharingColumn.value = !showSharingColumn.value;
  } else {
    showShareModal.value = !showShareModal.value;
  }
};

watch(date_calendar, (oldValue, newwVal) => {
  if (isInitialized.value) return;
  if (oldValue) {
    bookingForm.date.from = null;
    bookingForm.date.to = null;
    showComputation.value = false;
    computePricing();
  }
});

watchEffect(() => {
  if (smAndDown.value && showShareModal.value) {
    showSharingColumn.value = true;
    showShareModal.value = false;
  } else if (!smAndDown.value && showSharingColumn.value) {
    showSharingColumn.value = false;
    showShareModal.value = true;
  }
});

const onClickOutsideShareModal = () => {
  showShareModal.value = false;
};

// const isItTrue = computed(() => {
//   switch (name.value) {
//     case "xs":
//       return 220;
//     case "sm":
//       return 400;
//     case "md":
//       return 500;
//     case "lg":
//       return 600;
//     case "xl":
//       return 800;
//     case "xxl":
//       return 1200;
//   }
// });

const isSmallScreen = computed(() => {
  return name.value === "xs" || name.value === "sm" || name.value === "md";
});

const copyLink = () => {
  navigator.clipboard
    .writeText(window.location.href)
    .then(() =>
      setSnackbar({
        color: "success",
        text: "Link copied to clipboard!",
        modal: true,
      })
    )
    .catch((err) => console.error("Failed to copy: ", err));
};

const sendEmail = () => {
  window.open(
    `mailto:?subject=${encodeURIComponent("Discover This Amazing Venue!")}&body=${encodeURIComponent(msg)}`
  );
};

const shareOnWhatsApp = () => {
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
};

const shareOnMessenger = () => {
  window.open(
    `https://www.messenger.com/t/?text=${encodeURIComponent("Hey! I found this great venue that you should check out: " + window.location.href)}`,
    "_blank"
  );
};

const shareViaSMS = () => {
  window.open(
    `sms:?body=${encodeURIComponent("Check out this amazing venue: " + window.location.href)}`,
    "_blank"
  );
};

const shareOnFacebook = () => {
  const url = encodeURIComponent(window.location.href);
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  window.open(facebookShareUrl, "_blank");
};

function include() {
  return [document.querySelector(".included")];
}
function preventNegative(event) {
  if (event.key === "-" || event.key === "e") {
    event.preventDefault();
  }
}

const handleTimeFromChange = async () => {
  // clear checkout time if selected check-in time is past the preselected checkout
  const checkInTimeVal = bookingForm?.date?.from;
  const checkOutTimeVal = bookingForm?.date?.to;
  if (checkOutTimeVal && checkInTimeVal) {
    const checkInKey = timesFrom.find((x) => x.value == checkInTimeVal)?.key;
    const checkoutKey = timesFrom.find((x) => x.value == checkOutTimeVal)?.key;

    if (checkInKey && checkoutKey && checkInKey >= checkoutKey) {
      let newCheckoutKey = checkInKey + 1;
      const newCheckoutKeyObj = timesFrom.find((x) => x.key == newCheckoutKey);
      if (
        newCheckoutKeyObj &&
        newCheckoutKeyObj?.value &&
        newCheckoutKeyObj?.props?.disabled == false
      ) {
        bookingForm.date.to = newCheckoutKeyObj?.value || null;
      } else {
        bookingForm.date.to = null;
        showComputation.value = false;
      }
    }
  }

  nextTick(async () => {
    await computePricing();
  });
};
const handleTimeToChange = async () => {
  nextTick(async () => {
    await computePricing();
  });
};

let timeoutId: ReturnType<typeof setTimeout>;

const handleGuestChange = async () => {
  nextTick(async () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await computePricing();
    }, 300); // Adjust the delay as needed (1000ms = 1s)
  });
};

const computedOffer = ref<TComputedOffer>(new MComputedOffer({}));
const showComputation = ref(false);
const loadingComputation = ref(false);

// // watchEffect to hide computation if input is not complete
// watchEffect(() => {
//   if (!bookingForm?.date?.date || !bookingForm?.guests || !bookingForm?.date?.from || !bookingForm?.date?.to){
//     showComputation.value = false;
//   }
// })

const computePricing = async () => {
  const { date, guests } = bookingForm;
  const spaceId = specificSpace.value?._id;
  if (!date.from || !date.to || !guests || !date.date || !spaceId) {
    showComputation.value = false;
    return;
  }
  showComputation.value = true;
  try {
    const payload = {
      space_id: spaceId,
      date: date.date,
      time_start: date.from,
      time_end: date.to,
      guests,
    };

    loadingComputation.value = true;
    const res = await computePayment(payload);
    if (res) {
      computedOffer.value = new MComputedOffer(res);
      loadingComputation.value = false;
    }
  } catch (err) {
    console.log(err);
  }
};
</script>

<style scoped>
.dividerCat {
  height: 12px;
}

.dividerCat {
  height: 12px;
}

.display-rating {
  font-size: 6.25em;
}

.text-caption {
  width: 100px;
}

.custom-outlined-btn {
  border-width: 1px !important;
  box-shadow: none !important;
}

.custom-padding {
  padding-top: 10px;
  padding-bottom: 10px;
}

/* .progress-bar {
  width: 200px !important;
} */

.container {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.right {
  float: right;
  position: sticky;
  top: 6rem;
  height: 100vh;
  z-index: 10;
}

.custom-card {
  border: 1px solid #e0e0e0;
  box-shadow: none;
}

.custom-border {
  box-shadow: none;
}

/* .overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.842);
  z-index: 1000;
} */

body.no-scroll {
  overflow: hidden;
}

.booking-column {
  position: fixed;
  bottom: -100%;
  left: 0;
  right: 0;
  max-height: 60vh;
  background: #fff;
  z-index: 1001;
  overflow: hidden;
  transition: bottom 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

.booking-column.open {
  bottom: 0;
  overflow-y: auto;
}

.sticky-indicator {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1002;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}

.fixed-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.review-list {
  max-height: 450px;
  overflow-y: auto;
}
</style>
