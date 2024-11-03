import ElementPlus from 'unplugin-element-plus/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools:{enabled:true},

  modules: [
      '@nuxtjs/tailwindcss'
  ],

  // build
  build: {
      transpile: ['element-plus/es'],
  },

  vue: {

  },

  vite: {
      plugins: [ElementPlus({}), ],
  },

  compatibilityDate: '2024-10-25',
})

  