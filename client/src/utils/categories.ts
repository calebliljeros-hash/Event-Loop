export const CATEGORIES = [
  'Social',
  'Conference',
  'Music',
  'Sports',
  'Workshop',
  'Networking',
  'Food & Drink',
  'Arts',
  'Other',
] as const;

const BADGE_COLORS: Record<string, string> = {
  Social: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Conference: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Music: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Sports: 'bg-emerald-600/20 text-green-300 border-green-500/30',
  Workshop: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Networking: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Food & Drink': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Arts: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export function getCategoryBadge(category: string): string {
  return BADGE_COLORS[category] || BADGE_COLORS.Other;
}
