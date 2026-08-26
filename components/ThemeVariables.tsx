import { buildThemeVariableCss } from '@/lib/theme'

export default function ThemeVariables() {
  return <style>{buildThemeVariableCss()}</style>
}
