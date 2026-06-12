import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { SessionService } from '../services/session.service';
import { Deck } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DeckRepository {
  private supabase = inject(SupabaseClientService).client;
  private session = inject(SessionService);
  
  async getDecks(): Promise<Deck[]> {
    const { data, error } = await this.supabase
      .from('decks')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
  
  async getDeckById(id: string): Promise<Deck | null> {
    const { data, error } = await this.supabase
      .from('decks')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async createDeck(deck: Partial<Deck>): Promise<Deck> {
    const user_id = this.session.currentUser()?.id;
    if (!user_id) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('decks')
      .insert({ ...deck, user_id })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async updateDeck(id: string, updates: Partial<Deck>): Promise<Deck> {
    const { data, error } = await this.supabase
      .from('decks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async deleteDeck(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('decks')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
  
  async getDecksWithStats(): Promise<(Deck & { totalCards: number, cardsToReview: number })[]> {
    const decks = await this.getDecks();
    const result = [];
    
    const now = new Date().toISOString();
    
    for (const deck of decks) {
      // Get total cards
      const { count: totalCards } = await this.supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('deck_id', deck.id);
        
      // Get due cards
      const { count: cardsToReview } = await this.supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('deck_id', deck.id)
        .lte('next_review_date', now);
        
      result.push({
        ...deck,
        totalCards: totalCards || 0,
        cardsToReview: cardsToReview || 0
      });
    }
    
    return result;
  }
}
