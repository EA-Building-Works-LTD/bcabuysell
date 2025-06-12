export type FixedUser = 'Ehsaan' | 'Amar' | 'Shamas' | 'Kamar' | 'Kas';

export const FIXED_USERS: FixedUser[] = ['Ehsaan', 'Amar', 'Shamas', 'Kamar', 'Kas'];

export const USER_COLORS: Record<FixedUser, string> = {
  'Ehsaan': 'bg-blue-500',
  'Amar': 'bg-green-500',
  'Shamas': 'bg-purple-500',
  'Kamar': 'bg-orange-500',
  'Kas': 'bg-pink-500'
}; 