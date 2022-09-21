import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerAttributifyJsx,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1.5 rounded inline-block bg-teal-6 text-white cursor-pointer hover:bg-teal-7 disabled:cursor-default disabled:bg-gray-6 disabled:opacity-50'],
    ['icon-btn', 'text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-6 !outline-none'],
    ['number-btn', 'bg-teal-5 p-1 w-6 h-6 flex items-center justify-center rounded text-teal-9 font-extrabold'],
    ['rounded-btn', 'inline-flex justify-center items-center p-3 rounded-full bg-neutral-1 dark:bg-neutral-6 text-black dark:text-white cursor-pointer transition-colors hover:bg-teal-6 dark:hover:bg-teal-9 hover:text-white'],
    ['dashed-link', 'border-neutral-6 border-b border-dotted hover:text-teal-6 dark:hover:text-teal-2'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  safelist: ['bg-teal-4', 'dark:bg-teal-4', 'bg-teal-1', 'dark:bg-#333', 'animate-bounce-in'],
  transformers: [
    transformerAttributifyJsx(),
  ],
})
