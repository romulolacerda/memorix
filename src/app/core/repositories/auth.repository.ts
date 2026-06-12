import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthRepository {
  private supabase = inject(SupabaseClientService).client;

  async signUp(credentials: SignUpWithPasswordCredentials) {
    const { data, error } = await this.supabase.auth.signUp(credentials);
    if (error) throw error;
    return data;
  }

  async signIn(credentials: SignInWithPasswordCredentials) {
    const { data, error } = await this.supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async sendPasswordResetEmail(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password'
    });
    if (error) throw error;
    return data;
  }

  async updatePassword(password: string) {
    const { data, error } = await this.supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  }
}
