
import { Template } from './types';

export const CATEGORY_COLORS: Record<string, string> = {
  Birthday: 'bg-pink-500',
  Meeting: 'bg-indigo-600',
  Wedding: 'bg-rose-500',
  Anniversary: 'bg-purple-600',
  Deadline: 'bg-red-600',
  Concert: 'bg-amber-500',
  Travel: 'bg-cyan-500',
  Workout: 'bg-emerald-500',
  Retro: 'bg-amber-800',
  Gala: 'bg-yellow-700',
  Webinar: 'bg-blue-600',
  Festival: 'bg-orange-500',
  Exhibition: 'bg-slate-800',
  Holiday: 'bg-teal-500',
  Other: 'bg-slate-400',
};

export const TEMPLATES: Template[] = [
  { name: 'Elite Gala', category: 'Gala', defaultTitle: "The Grand Charity Gala", icon: '🏆', color: 'from-yellow-600 to-amber-900' },
  { name: 'Tech Webinar', category: 'Webinar', defaultTitle: 'Global Product Launch', icon: '🌐', color: 'from-blue-600 to-indigo-800' },
  { name: 'Art Showcase', category: 'Exhibition', defaultTitle: 'Modern Art Preview', icon: '🎨', color: 'from-slate-700 to-slate-900' },
  { name: 'Summer Holiday', category: 'Holiday', defaultTitle: 'Mediterranean Escape', icon: '🌴', color: 'from-teal-400 to-cyan-600' },
  { name: 'Music Festival', category: 'Festival', defaultTitle: 'Sunwave Music Fest', icon: '🔊', color: 'from-orange-400 to-rose-600' },
  { name: 'Vintage Classic', category: 'Retro', defaultTitle: 'Jazz & Wine Night', icon: '🕰️', color: 'from-amber-700 to-yellow-900', isVintage: true },
  { name: 'Business Meet', category: 'Meeting', defaultTitle: 'Quarterly Board Review', icon: '📊', color: 'from-indigo-600 to-slate-800' },
  { name: 'Wedding Day', category: 'Wedding', defaultTitle: 'Our Sacred Vows', icon: '💍', color: 'from-rose-300 to-pink-500' },
];

export const INITIAL_EVENTS: any[] = [];
