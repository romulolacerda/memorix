import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private supabase = inject(SupabaseClientService).client;

  currentUser = signal<User | null>(null);
  session = signal<Session | null>(null);
  isInitializing = signal<boolean>(true);

  isLoggedIn = computed(() => !!this.session());
  userName = computed(() => {
    const fullName = this.currentUser()?.user_metadata?.['name'] || '';
    return fullName.split(' ')[0] || 'Estudante';
  });

  constructor() {
    this.initSession();
  }

  private async initSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    this.session.set(session);
    this.currentUser.set(session?.user ?? null);
    this.isInitializing.set(false);

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });
  }
}
