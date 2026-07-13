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
    
    const user_id = this.session.currentUser()?.id;
    if (!user_id) return decks.map(d => ({ ...d, totalCards: 0, cardsToReview: 0 }));

    // Busca apenas deck_id e next_review_date em uma única query
    const { data: flashcards, error } = await this.supabase
      .from('flashcards')
      .select('deck_id, next_review_date')
      .eq('user_id', user_id);
      
    if (error) {
      console.error('Error fetching flashcards stats', error);
      return decks.map(d => ({ ...d, totalCards: 0, cardsToReview: 0 }));
    }

    const now = new Date().toISOString();
    const statsMap = new Map<string, { totalCards: number, cardsToReview: number }>();
    
    for (const card of (flashcards || [])) {
      const stats = statsMap.get(card.deck_id) || { totalCards: 0, cardsToReview: 0 };
      stats.totalCards++;
      if (card.next_review_date <= now) {
        stats.cardsToReview++;
      }
      statsMap.set(card.deck_id, stats);
    }
    
    return decks.map(deck => {
      const stats = statsMap.get(deck.id) || { totalCards: 0, cardsToReview: 0 };
      return {
        ...deck,
        totalCards: stats.totalCards,
        cardsToReview: stats.cardsToReview
      };
    });
  }
}
