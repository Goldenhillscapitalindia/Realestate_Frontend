/** @type {import('tailwindcss').Config} */
const cssColor = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

const sharedColors = {
  background: cssColor('--background'),
  foreground: cssColor('--foreground'),
  card: cssColor('--card'),
  'card-foreground': cssColor('--card-foreground'),
  popover: cssColor('--popover'),
  'popover-foreground': cssColor('--popover-foreground'),
  primary: cssColor('--primary'),
  'primary-foreground': cssColor('--primary-foreground'),
  secondary: cssColor('--secondary'),
  'secondary-foreground': cssColor('--secondary-foreground'),
  muted: cssColor('--muted'),
  'muted-foreground': cssColor('--muted-foreground'),
  accent: cssColor('--accent'),
  'accent-foreground': cssColor('--accent-foreground'),
  destructive: cssColor('--destructive'),
  'destructive-foreground': cssColor('--destructive-foreground'),
  border: cssColor('--border'),
  input: cssColor('--input'),
  ring: cssColor('--ring'),
};

const sidebarColors = {
  'sidebar-background': cssColor('--sidebar-background'),
  'sidebar-foreground': cssColor('--sidebar-foreground'),
  'sidebar-primary': cssColor('--sidebar-primary'),
  'sidebar-primary-foreground': cssColor('--sidebar-primary-foreground'),
  'sidebar-accent': cssColor('--sidebar-accent'),
  'sidebar-accent-foreground': cssColor('--sidebar-accent-foreground'),
  'sidebar-border': cssColor('--sidebar-border'),
  'sidebar-ring': cssColor('--sidebar-ring'),
};

const vertexColors = {
  'vertex-navy': cssColor('--vertex-navy'),
  'vertex-navy-light': cssColor('--vertex-navy-light'),
  'vertex-emerald': cssColor('--vertex-emerald'),
  'vertex-emerald-light': cssColor('--vertex-emerald-light'),
  'vertex-emerald-glow': cssColor('--vertex-emerald-glow'),
  'vertex-soft-bg': cssColor('--vertex-soft-bg'),
  'vertex-soft-bg-alt': cssColor('--vertex-soft-bg-alt'),
  'vertex-glass': cssColor('--vertex-glass'),
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ...sharedColors,
        ...sidebarColors,
        ...vertexColors,
      },
    },
  },
  plugins: [],
};
