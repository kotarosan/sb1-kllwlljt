import { supabase } from './supabase';
import { getAuthErrorMessage } from './error-utils';
import type { User } from '@supabase/supabase-js';
import type { AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: AuthError | Error | null;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return { user: null, error: new Error('メールアドレスとパスワードは必須です') };
    }

    if (password.length < 6) {
      return { user: null, error: new Error('パスワードは6文字以上で入力してください') };
    }

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'user',
        },
      },
    });

    if (error) return { user: null, error };

    if (user) {
      return { user, error: null };
    }

    return { user: null, error: new Error('ユーザー登録に失敗しました') };
  } catch (error) {
    console.error('Error in signUp:', error);
    return { 
      user: null, 
      error: error as AuthError | Error 
    };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return { user: null, error: new Error('メールアドレスとパスワードは必須です') };
    }

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { user, error: null };
  } catch (error) {
    console.error('Error in signIn:', error);
    const errorMessage = getAuthErrorMessage(error as AuthError | Error);
    return { 
      user: null, 
      error: new Error(errorMessage)
    };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error in signOut:', error);
    return { error: error as Error };
  }
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error: error as Error };
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}