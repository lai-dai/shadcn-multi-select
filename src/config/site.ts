import { env } from "~/env"

export const siteConfig = {
  name: "Mutil-Select",
  url: env.NEXT_PUBLIC_WEBSITE_URL,
  ogImage: "https://ui.shadcn.com/og.jpg",
  description:
    "MultiSelect component that you can copy and paste into your apps. Accessible. Customizable. Open Source. Generated by create-t3-app",
  links: {
    x: "https://x.com/laidai9966",
    site: "https://laidai.xyz",
    github: "https://github.com/lai-dai/shadcn-multi-select",
    buyMeACoffee: "https://buymeacoffee.com/laidai"
  },
} as const

export type SiteConfig = typeof siteConfig

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}
