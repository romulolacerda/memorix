import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { SessionService } from '../services/session.service';
import { StudyLog } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StudyLogRepository {
  private supabase = inject(SupabaseClientService).client;
  private session = inject(SessionService);
  
  async logStudy(flashcardId: string, deckId: string, grade: number): Promise<StudyLog> {
    const user_id = this.session.currentUser()?.id;
    if (!user_id) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('study_logs')
      .insert({
          user_id: user_id,
          flashcard_id: flashcardId,
          deck_id: deckId,
          grade: grade
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async getLogsForToday(): Promise<StudyLog[]> {
    // We consider "today" as from midnight in the user's local timezone.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await this.supabase
      .from('study_logs')
      .select('*')
      .gte('reviewed_at', today.toISOString());
      
    if (error) throw error;
    return data || [];
  }
  
  async getLogsLast7Days(): Promise<StudyLog[]> {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    
    const { data, error } = await this.supabase
      .from('study_logs')
      .select('*')
      .gte('reviewed_at', d.toISOString());
      
    if (error) throw error;
    return data || [];
  }
  
  async getStreak(): Promise<number> {
    // To calculate the streak, we need all distinct dates of study.
    // For MVP, we can fetch all logs ordered by reviewed_at DESC, or just a distinct date query.
    // Since Supabase RPC (stored procedures) is better for distinct, we can do a simplified logic:
    // fetch all logs (this will get slow for heavy users, but works for MVP) or fetch max 1 per day.
    
    // Better MVP approach: Fetch all logs but only select 'reviewed_at', then process in JS.
    const { data, error } = await this.supabase
      .from('study_logs')
      .select('reviewed_at')
      .order('reviewed_at', { ascending: false });
      
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    
    const uniqueDates = new Set<string>();
    for (const log of data) {
        // Convert ISO string to YYYY-MM-DD local timezone equivalent
        const date = new Date(log.reviewed_at);
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        uniqueDates.add(dateString);
    }
    
    const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if studied today
    const todayStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    
    let yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
    
    if (sortedDates[0] === todayStr) {
        streak = 1;
        let checkDate = yesterday;
        for (let i = 1; i < sortedDates.length; i++) {
            const expectedStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
            if (sortedDates[i] === expectedStr) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    } else if (sortedDates[0] === yesterdayStr) {
        // Did not study today, but streak is active from yesterday
        streak = 1;
        let checkDate = new Date(yesterday);
        checkDate.setDate(checkDate.getDate() - 1);
        for (let i = 1; i < sortedDates.length; i++) {
            const expectedStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
            if (sortedDates[i] === expectedStr) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }
    
    return streak;
  }
}
