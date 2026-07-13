import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { SessionService } from '../services/session.service';
import { Flashcard } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FlashcardRepository {
  private supabase = inject(SupabaseClientService).client;
  private session = inject(SessionService);
  
  async getFlashcardsByDeck(deckId: string): Promise<Flashcard[]> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .limit(200);
      
    if (error) throw error;
    return data || [];
  }
  
  async getFlashcardById(id: string): Promise<Flashcard> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async getAllFlashcards(): Promise<Flashcard[]> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('*');
      
    if (error) throw error;
    return data || [];
  }

  async getFlashcardsForStats(): Promise<Partial<Flashcard>[]> {
    const user_id = this.session.currentUser()?.id;
    if (!user_id) return [];

    const { data, error } = await this.supabase
      .from('flashcards')
      .select('interval, next_review_date, ease_factor')
      .eq('user_id', user_id);
      
    if (error) throw error;
    return data || [];
  }
  
  async getDueFlashcards(): Promise<Flashcard[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('*')
      .lte('next_review_date', now)
      .limit(200);
      
    if (error) throw error;
    return data || [];
  }
  
  async createFlashcard(card: Partial<Flashcard>): Promise<Flashcard> {
    const user_id = this.session.currentUser()?.id;
    if (!user_id) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('flashcards')
      .insert({ ...card, user_id })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async deleteFlashcard(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}
