/**
 * Validação de variáveis de ambiente
 * Garante que todas as variáveis necessárias estão configuradas
 */

export function validateEnv() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente faltando: ${missing.join(', ')}\n` +
      'Adicione essas variáveis ao arquivo .env.local'
    );
  }
}

/**
 * Valida variáveis opcionais mas recomendadas
 */
export function validateOptionalEnv() {
  const warnings: string[] = [];

  if (!process.env.WIAPY_WEBHOOK_TOKEN) {
    warnings.push('WIAPY_WEBHOOK_TOKEN não configurada - Webhooks de pagamento não funcionarão');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY não configurada - Webhooks podem ter limitações');
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Avisos de configuração:\n', warnings.join('\n'));
  }

  return warnings;
}

