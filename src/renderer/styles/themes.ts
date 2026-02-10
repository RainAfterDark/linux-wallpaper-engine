export const THEME_OPTIONS = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Steam', value: 'steam' },
    { label: 'System', value: 'system' },
  { label: 'Hard Light', value: 'light-alt' },
] as const
export type ThemeOption = typeof THEME_OPTIONS[number]['value']
