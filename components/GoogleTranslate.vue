<template>
  <div id="google_translate_element"></div>
  <Script type="text/javascript"
    src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></Script>
</template>

<script setup>

// watchEffect(() => {
//     if (process.client){
//     new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
//   }
// })

const { country } = useRoute().params

if (process.client) {
  setTimeout(() => {
    googleTranslateElementInit();
    observeAndHideElements();
  }, 2000)
}


function googleTranslateElementInit() {
  if (typeof google !== 'undefined') {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
  } else {
    console.error('Google Translate API not loaded');
  }

  // styling
  const el = document.querySelector('#google_translate_element > .skiptranslate .goog-te-combo');
  // el.style.textAlign = 'center';
  if (el) {
    el.style.border = '1px solid #373941';
    el.style.padding = '5px'
    el.style.borderRadius = '5px';
  }



}


function hideGoogleTranslateElement() {
  if (process.client) {
    const el = document.querySelectorAll('body .goog-te-combo')
    if (el.length > 0) {
      console.log(el);
      for (let i = 0; i < el.length; i++) {
        el[i].style.display = 'none';
        document.querySelector('body').removeAttribute('style')
      }


    }
  }
}

const observeAndHideElements = () => {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        const elements = document.querySelectorAll('body > .skiptranslate');
        elements.forEach(el => {
          el.style.display = 'none';
          el.style.opacity = 0;
          document.querySelector('body').removeAttribute('style')
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};


const handleClick = () => {
  const el = document.querySelector('#google_translate_element > .skiptranslate .goog-te-combo');
  el.click();
  console.log(el);

}



</script>



<style scoped></style>