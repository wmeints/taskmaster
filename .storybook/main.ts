import type { StorybookConfig } from "@storybook/nextjs-vite"
import tailwindcss from "@tailwindcss/vite"

const config: StorybookConfig = {
  stories: ["../components/**/*.mdx", "../components/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  async viteFinal(config) {
    // The Next.js app compiles Tailwind through Turbopack; Storybook runs on Vite.
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    return config
  },
}

export default config
