import { AuthError } from '@supabase/supabase-js';

export function getAuthErrorMessage(error: AuthError | Error): string {
  if ('status' in error) {
    switch (error.status) {
      case 400:
        return 'メールアドレスまたはパスワードが正しくありません';
      case 401:
        return '認証に失敗しました。再度ログインしてください';
      case 422:
        return 'メールアドレスの形式が正しくありません';
      case 429:
        return 'リクエストが多すぎます。しばらく時間をおいて再度お試しください';
      default:
        return 'エラーが発生しました。しばらく時間をおいて再度お試しください';
    }
  }
  return error.message || 'エラーが発生しました';
}

export function getApiErrorMessage(error: Error): string {
  if (error.message.includes('Invalid API key')) {
    return 'APIキーが無効です。システム管理者にお問い合わせください';
  }
  if (error.message.includes('JWT expired')) {
    return 'セッションの有効期限が切れました。再度ログインしてください';
  }
  return 'エラーが発生しました。しばらく時間をおいて再度お試しください';
}