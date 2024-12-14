import { supabase } from './supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export async function subscribeToPlan(userId: string, planName: string) {
  try {
    // Check if user already has a subscription
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw fetchError;
    }

    if (existingSubscription) {
      throw new Error('既に有効なサブスクリプションがあります');
    }

    // Create new subscription record
    const { error: subscribeError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_name: planName,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    if (subscribeError) throw subscribeError;

    return { error: null };
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    return { error };
  }
}