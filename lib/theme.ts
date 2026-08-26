import appConfig from '@/config/appConfig.json'

export type AppThemeColors = typeof appConfig.colors

export const themeColors = appConfig.colors

/** CSS custom properties injected at runtime from config/appConfig.json */
export function buildThemeVariableCss(): string {
  const c = appConfig.colors

  return `:root {
    --gr-primary: ${c.primary};
    --gr-primary-hover: ${c.primary_hover};
    --gr-primary-light: ${c.primary_light};
    --gr-secondary: ${c.secondary};
    --gr-text-dark: ${c.text_dark};
    --gr-text-muted: ${c.text_muted};
    --gr-border: ${c.border};
    --gr-background: ${c.background};
    --gr-input-bg: ${c.input_bg};
    --gr-success: ${c.success};
    --gr-error: ${c.error};
    --gr-warning: ${c.warning};
    --primary: ${c.primary};
    --secondary: ${c.secondary};
    --background: ${c.background};
    --foreground: ${c.text_dark};
    --border: ${c.border};
    --muted-foreground: ${c.text_muted};
    --destructive: ${c.error};
    --input: ${c.input_bg};
  }`
}
