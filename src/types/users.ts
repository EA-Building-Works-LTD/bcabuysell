export type FixedUser = 'Ehsaan' | 'Amar' | 'Shamas' | 'Kamar' | 'Kas';

export const FIXED_USERS: FixedUser[] = ['Ehsaan', 'Amar', 'Shamas', 'Kamar', 'Kas'];

// Premium color palette with excellent contrast ratios
export const USER_COLORS: Record<FixedUser, string> = {
  'Ehsaan': 'bg-primary',
  'Amar': 'bg-success',
  'Shamas': 'bg-purple-600',
  'Kamar': 'bg-warning',
  'Kas': 'bg-pink-600'
};

// Enhanced color schemes for components
export const USER_COLOR_SCHEMES: Record<FixedUser, {
  primary: string;
  background: string;
  foreground: string;
  border: string;
  accent: string;
}> = {
  'Ehsaan': {
    primary: 'hsl(var(--primary))',
    background: 'hsl(var(--primary) / 0.1)',
    foreground: 'hsl(var(--primary))',
    border: 'hsl(var(--primary) / 0.2)',
    accent: 'hsl(var(--primary) / 0.05)'
  },
  'Amar': {
    primary: 'hsl(var(--success))',
    background: 'hsl(var(--success) / 0.1)',
    foreground: 'hsl(var(--success))',
    border: 'hsl(var(--success) / 0.2)',
    accent: 'hsl(var(--success) / 0.05)'
  },
  'Shamas': {
    primary: 'hsl(271 81% 56%)',
    background: 'hsl(271 81% 56% / 0.1)',
    foreground: 'hsl(271 81% 56%)',
    border: 'hsl(271 81% 56% / 0.2)',
    accent: 'hsl(271 81% 56% / 0.05)'
  },
  'Kamar': {
    primary: 'hsl(var(--warning))',
    background: 'hsl(var(--warning) / 0.1)',
    foreground: 'hsl(var(--warning))',
    border: 'hsl(var(--warning) / 0.2)',
    accent: 'hsl(var(--warning) / 0.05)'
  },
  'Kas': {
    primary: 'hsl(330 81% 56%)',
    background: 'hsl(330 81% 56% / 0.1)',
    foreground: 'hsl(330 81% 56%)',
    border: 'hsl(330 81% 56% / 0.2)',
    accent: 'hsl(330 81% 56% / 0.05)'
  }
}; 