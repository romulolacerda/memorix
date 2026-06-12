export interface Deck {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  user_id?: string;
  deck_id: string;
  front: string;
  back: string;
  
  // SM-2 fields
  interval: number;
  repetition: number;
  ease_factor: number;
  next_review_date: string;
  
  created_at: string;
}

export interface StudyLog {
  id: string;
  user_id?: string;
  flashcard_id: string;
  deck_id: string;
  grade: number;
  reviewed_at: string;
}
