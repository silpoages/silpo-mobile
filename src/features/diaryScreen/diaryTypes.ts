import type { MoodId } from '@/components/emotions/moodLogService';

export type DiaryEntry = {
  id: string;
  date: string;
  mood: MoodId | null;
  note: string | null;
  photoUri: string | null;
  practiceTitle: string | null;
};
