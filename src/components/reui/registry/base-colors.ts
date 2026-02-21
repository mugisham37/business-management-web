import { THEMES, type Theme } from "@/registry/themes"

export const BASE_COLORS = THEMES.filter((theme: Theme) =>
  ["neutral", "stone", "zinc", "gray"].includes(theme.name)
)

export type BaseColor = (typeof BASE_COLORS)[number]
