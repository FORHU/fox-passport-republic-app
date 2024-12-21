import type { RouterOptions, RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {      
        if (savedPosition) {
          return savedPosition;
        }
      
        return new Promise((resolve) => {
            nextTick(() => {
              const content = document.querySelector('body');
      
              if (content) {
                setTimeout(() => {
                    content.scrollTop = 0; // Scroll to the top
                }, 200)
              }
      
              resolve({ top: 0 }); // Resolve the promise with the new position
            });
          });
        }
    
  }