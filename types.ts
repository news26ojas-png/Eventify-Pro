
export type Category = 
  | 'Birthday' 
  | 'Meeting' 
  | 'Wedding' 
  | 'Anniversary' 
  | 'Deadline' 
  | 'Concert' 
  | 'Travel' 
  | 'Workout' 
  | 'Retro' 
  | 'Gala' 
  | 'Webinar' 
  | 'Festival' 
  | 'Exhibition' 
  | 'Holiday'
  | 'Other';

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: Category;
  customCategoryName?: string;
  description: string;
  reminders: string[];
  isCompleted: boolean;
  color: string;
  voiceReminderAudio?: string; // This will now store either AI generated or user uploaded base64 audio
  isAlarmEnabled: boolean;
}

export interface Template {
  name: string;
  category: Category;
  defaultTitle: string;
  icon: string;
  color: string;
  isVintage?: boolean;
}
