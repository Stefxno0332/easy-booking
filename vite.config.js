import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// qua c'è il primo service worker per gestire cache,offline e pwa generato da vite
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA(
      {  //service worker che si occupa delle cache per uso offline e per la pwa
        registerType: 'autoUpdate',
        workbox: {
          // Precaching automatico dei file build
          // quando l'utente visita per la prima volta l'app il sw scarica e salva questi dati in cache per maggiore velocità (salva la parte statica)
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

          // IMPORTANTE: Non intercettare le richieste FCM (firebase cloud messaging) (creava problemi con sw per le notifiche da firebase)
          navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js$/],

          // Network First per Firebase (questi dati vengono prima richiesti dal server se non ci sono prende dalla cache)
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firebase-cache',
                expiration: {
                  maxEntries: 50, // massimo numero di elementi in cache elimina l'ultimo per mantenere il numero massimo
                  maxAgeSeconds: 60 * 60 * 24 // 24 ore durata in cache
                }
              }
            },
            // Cache First per immagini che non ci sono al momento (questi dati vengono prima presi dalla cache, se non ci sono dal server)
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni durata in cache prima di essere rinnovati
                }
              }
            }
          ]
        },
        manifest: {
          name: 'SAW',
          short_name: 'SAW',
          description: 'SAW',
          theme_color: '#000000',
          icons: [ //icone generate con nano banana
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          screenshots: [ //schreenshot mostrati quando si scarica la pwa
            {
              src: '/screenshot-wide-new.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Easy Booking - Vista Desktop'
            },
            {
              src: '/screenshot-mobile-new.png',
              sizes: '640x1136',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Easy Booking - Vista Mobile'
            }
          ],
        },
      }
    )
  ],
})
