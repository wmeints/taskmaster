import type { Preview } from "@storybook/nextjs-vite"

import { htmlClassName } from "../app/fonts"
import "../app/globals.css"

// Stories render outside the root layout, so apply its <html> classes (fonts, antialiasing) here.
document.documentElement.classList.add(...htmlClassName.split(" "))

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
