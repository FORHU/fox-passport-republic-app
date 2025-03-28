<template>
  <v-footer class="footer">
    <v-container class="footer-container">
      <v-row class="footer-content ma-auto">
        <v-col cols="12" class="footer-top">
          <v-row class="footer-columns">
            <v-col cols="12" md="3" class="footer-column">
              <div class="footer-logo">
                <div class="logo-images">
                  <a href="https://x.com/venue4use" target="_blank"
                    ><v-img
                      src="/images/login/twitter.svg"
                      class="logo-image"
                      alt="Twitter Logo"
                  /></a>
                  <a href="https://www.facebook.com/venue4use" target="_blank"
                    ><v-img
                      src="/images/login/fb.svg"
                      class="logo-image"
                      alt="Facebook Logo"
                  /></a>
                  <a href="https://www.instagram.com/venue4use" target="_blank"
                    ><v-img
                      src="/images/login/instagram.svg"
                      class="logo-image"
                      alt="Instagram Logo"
                  /></a>
                  <a
                    href="https://linkedin.com/company/venue4use"
                    target="_blank"
                    ><v-img
                      src="/images/login/linked.svg"
                      class="logo-image"
                      alt="LinkedIn Logo"
                  /></a>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="3" class="footer-column">
              <div class="footer-section">
                <h3 class="footer-heading">Users</h3>
                <nav class="footer-nav">
                  <NuxtLink
                    to="/"
                    style="font-weight: 0px"
                    class="footer-link"
                    variant="text"
                    >Why Venue4use</NuxtLink
                  >
                  <NuxtLink
                    to="/login/user"
                    style="font-weight: 0px"
                    class="footer-link"
                    variant="text"
                    >User login
                  </NuxtLink>
                </nav>
              </div>
            </v-col>
            <v-col cols="12" md="3" class="footer-column">
              <div class="footer-section">
                <h3 class="footer-heading">Venues</h3>
                <nav class="footer-nav">
                  <NuxtLink
                    to="/"
                    style="font-weight: 0px"
                    class="footer-link"
                    variant="text"
                    >Why list with us
                  </NuxtLink>
                  <NuxtLink
                    to="/register/venue"
                    style="font-weight: 0px"
                    class="footer-link"
                    variant="text"
                    >List your venue</NuxtLink
                  >
                  <NuxtLink
                    to="/login/venue"
                    style="font-weight: 0px"
                    class="footer-link"
                    variant="text"
                    >Venue login
                  </NuxtLink>
                </nav>
              </div>
            </v-col>
            <v-col cols="12" md="3" class="footer-column">
              <div class="footer-section">
                <h3 class="footer-heading">Venue4use</h3>
                <nav class="footer-nav">
                  <NuxtLink
                    :to="{ name: 'country-about-us', params: { country } }"
                    style="font-weight: 0px"
                    class="footer-link"
                    variant="text"
                    >About us</NuxtLink
                  >
                  <NuxtLink
                    :to="{ name: 'country-contact-us', params: { country } }"
                    style="font-weight: 0px"
                    class="footer-link"
                    variant="text"
                    >Contact us
                  </NuxtLink>
                  <NuxtLink
                    :to="{
                      name: 'country-termsandcondition',
                      params: { country },
                    }"
                    style="font-weight: 0px"
                    class="footer-link terms-link"
                    variant="text"
                    >Terms & Privacy</NuxtLink
                  >
                  <NuxtLink
                    :to="{
                      name: 'country-contact-us',
                      params: { country },
                    }"
                    style="font-weight: 0px"
                    class="footer-link terms-link"
                    variant="text"
                    >Contact Us</NuxtLink
                  >
                </nav>
              </div>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="footer-bottom">
          <p class="copyright">&copy; 2025 Venue4use. All rights reserved.</p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
const { country } = useLocal();
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0px;
}

.footer-container {
  background-color: #0d403a;
  min-width: 100%;
  padding: 0px;
}

.footer-content {
  max-width: 970px;
  width: 100%;
  padding: 36px 15px 0;
}

.footer-columns {
  display: flex;
  gap: 20px;
}

.footer-column {
  flex: 1;
  margin-left: 0;
}

.footer-logo {
  margin-top: 20px;
  padding: 10px 2px 20px;
}

.logo-images {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.logo-image {
  width: 24px;
  aspect-ratio: 1.2;
  object-fit: contain;
  object-position: center;
}

.footer-section {
  padding-bottom: 9px;
  font-weight: 400;
}

.footer-heading {
  color: #dedfe3;
  font:
    16px DM Sans,
    sans-serif;
  margin: 0;
}

.footer-nav {
  margin-top: 44px;
  font-size: 13px;
  color: #eee;
  line-height: 235%;
}

.footer-link {
  font-family:
    DM Sans,
    sans-serif;
  text-decoration: none;
  color: inherit;
  display: block;
}

.terms-link,
.blog-link {
  font-size: 12px;
  line-height: 255%;
}

.footer-bottom {
  margin-top: 16px;
}

.copyright {
  color: #dedfe3;
  font:
    400 11px/153% DM Sans,
    sans-serif;
  margin: 0;
}
</style>
