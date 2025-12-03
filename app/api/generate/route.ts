import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        // Validação de variáveis de ambiente
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY não configurada");
            return NextResponse.json(
                { error: "Erro de configuração do servidor. Entre em contato com o suporte." },
                { status: 500 }
            );
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        // Validação de dados de entrada
        let body;
        try {
            body = await req.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: "Dados inválidos. Verifique o formato da requisição." },
                { status: 400 }
            );
        }

        const { ingredients, goal, time, mode = 'single' } = body;

        // Validação de campos obrigatórios
        if (!ingredients || typeof ingredients !== 'string' || ingredients.trim().length === 0) {
            return NextResponse.json(
                { error: "Ingredientes são obrigatórios." },
                { status: 400 }
            );
        }

        if (!goal || typeof goal !== 'string') {
            return NextResponse.json(
                { error: "Objetivo é obrigatório." },
                { status: 400 }
            );
        }

        if (mode !== 'single' && mode !== 'daily') {
            return NextResponse.json(
                { error: "Modo inválido. Use 'single' ou 'daily'." },
                { status: 400 }
            );
        }

        // Check Plan Tier FIRST
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_tier, is_premium, subscription_expires_at')
            .eq('id', user.id)
            .single();

        let planTier = profile?.plan_tier || 'free';

        // Check Subscription Expiry
        if (planTier !== 'free' && profile?.subscription_expires_at) {
            const expiryDate = new Date(profile.subscription_expires_at);
            const now = new Date();
            if (expiryDate < now) {
                planTier = 'free'; // Downgrade to free if expired
            }
        }



        // Fallback for legacy premium users
        if (planTier === 'free' && profile?.is_premium) {
            planTier = 'essential';
        }

        // Tier Permissions (2-Tier Model: Free vs Performance)
        // Free: Restricted options, No Daily, No Shopping List, Limit 3/day
        // Performance: All options, Daily Menu, Shopping List, UNLIMITED

        const isFree = planTier === 'free';
        // Treat 'essential' and 'master' as 'performance' for backward compatibility
        const isPerformance = planTier !== 'free';

        const canUseDaily = isPerformance;
        const canUseShoppingList = isPerformance;
        const canUseRestrictedOptions = isPerformance;
        const isUnlimited = isPerformance;

        // Check Daily Limit ONLY for Free Users
        const today = new Date().toISOString().split('T')[0];
        const { data: usage, error: usageError } = await supabase
            .from('daily_usage')
            .select('count')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

        if (!isUnlimited && usage && usage.count >= 3) {
            return NextResponse.json(
                { error: "Limite diário atingido", code: "LIMIT_REACHED" },
                { status: 403 }
            );
        }

        // Validation Logic
        if (mode === 'daily') {
            if (!canUseDaily) {
                return NextResponse.json(
                    { error: "Cardápio do Dia é exclusivo para o plano Performance.", code: "PREMIUM_REQUIRED" },
                    { status: 403 }
                );
            }
        } else {
            // Single Mode Restrictions
            if (!canUseRestrictedOptions) {
                // Free Plan Restrictions
                if (goal !== 'Low Carb') {
                    return NextResponse.json(
                        { error: "Objetivo exclusivo para assinantes", code: "PREMIUM_REQUIRED" },
                        { status: 403 }
                    );
                }
                if (!time.includes('30 min')) {
                    return NextResponse.json(
                        { error: "Tempo de preparo exclusivo para assinantes", code: "PREMIUM_REQUIRED" },
                        { status: 403 }
                    );
                }
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let prompt = "";

        if (mode === 'daily') {
            prompt = `
            Você é um chef nutricionista especialista em Culinária Fitness e Nutrição Esportiva (FitChef IA).
            
            SUA MISSÃO:
            Criar um CARDÁPIO DO DIA COMPLETO (Café, Almoço, Lanche, Jantar) fitness, prático e saboroso.
            
            PARÂMETROS:
            - Ingredientes do usuário: ${ingredients}
            - Objetivo: ${goal}
            
            REGRAS:
            1. Use APENAS os ingredientes listados, mas pode adicionar temperos básicos (sal, pimenta, azeite, ervas).
            2. O cardápio deve ser focado no objetivo: ${goal}.
            3. Seja criativo! Nada de comida sem graça.
            4. Se o usuário tiver acesso (${canUseShoppingList ? 'SIM' : 'NÃO'}), gere também uma LISTA DE COMPRAS JSON.

            FORMATO DE RESPOSTA (JSON APENAS):
            {
              "type": "daily",
              "title": "Cardápio Fit do Dia - ${goal}",
              "meals": [
                {
                  "name": "Café da Manhã",
                  "title": "Nome do Prato",
                  "calories": "X kcal",
                  "protein": "Xg",
                  "instructions": ["Passo 1", "Passo 2"]
                },
                {
                  "name": "Almoço",
                  "title": "Nome do Prato",
                  "calories": "X kcal",
                  "protein": "Xg",
                  "instructions": ["Passo 1", "Passo 2"]
                },
                {
                  "name": "Lanche",
                  "title": "Nome do Prato",
                  "calories": "X kcal",
                  "protein": "Xg",
                  "instructions": ["Passo 1", "Passo 2"]
                },
                {
                  "name": "Jantar",
                  "title": "Nome do Prato",
                  "calories": "X kcal",
                  "protein": "Xg",
                  "instructions": ["Passo 1", "Passo 2"]
                }
              ],
              "total_calories": "Total kcal",
              "total_protein": "Total g",
              "imagePrompt": "A beautiful flatlay photography of healthy fitness meals for a full day, high quality, 4k",
              ${canUseShoppingList ? '"shopping_list": {"Hortifruti": ["item 1", "item 2"], "Proteínas": ["item 1"], "Mercearia": ["item 1"]}' : ''}
            }
            `;
        } else {
            prompt = `
            Você é um chef nutricionista especialista em Culinária Fitness e Nutrição Esportiva (FitChef IA).
            
            SUA MISSÃO:
            Criar UMA ÚNICA receita fitness, prática e saborosa.
            
            PARÂMETROS:
            - Ingredientes disponíveis: ${ingredients}
            - Objetivo: ${goal}
            - Tempo de preparo desejado: ${time}
            
            REGRAS:
            1. Use APENAS os ingredientes listados, mas pode adicionar temperos básicos.
            2. Respeite estritamente o tempo de preparo: ${time}.
            3. Foco total no objetivo: ${goal}.

            FORMATO DE RESPOSTA (JSON APENAS):
            {
              "type": "single",
              "title": "Nome do prato (Ex: Empada Fit de Batata Doce)",
              "description": "Descrição focada no sabor e ganho nutricional",
              "time": "Tempo estimado (Ex: 15 min)",
              "calories": "Apenas o valor calórico (Ex: 350 kcal)",
              "protein": "Apenas a quantidade de proteína (Ex: 40g)",
              "imagePrompt": "Descrição visual em inglês para IA de imagem",
              "ingredients": ["Lista completa de ingredientes (com quantidades)"],
              "instructions": ["Passo 1 detalhado...", "Passo 2 detalhado...", "Passo 3 detalhado..."]
            }
            `;
        }

        // Geração de conteúdo com tratamento de erros
        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (aiError: any) {
            console.error("Erro na API do Gemini:", aiError);
            return NextResponse.json(
                { error: "Erro ao gerar receita. Tente novamente em alguns instantes." },
                { status: 503 }
            );
        }

        const response = await result.response;
        let text = response.text();

        // Validação de resposta vazia
        if (!text || text.trim().length === 0) {
            console.error("Resposta vazia da IA");
            return NextResponse.json(
                { error: "A IA não retornou uma resposta válida. Tente novamente." },
                { status: 500 }
            );
        }

        // Limpar markdown se houver (```json ... ```)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let recipe;
        try {
            recipe = JSON.parse(text);
        } catch (parseError) {
            console.error("Erro ao fazer parse do JSON:", text.substring(0, 200));
            return NextResponse.json(
                { error: "Erro ao processar resposta da IA. Tente novamente." },
                { status: 500 }
            );
        }

        // Validação básica da estrutura da receita
        if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
            console.error("Estrutura de receita inválida:", recipe);
            return NextResponse.json(
                { error: "A receita gerada está incompleta. Tente novamente." },
                { status: 500 }
            );
        }

        // Increment Usage Count (apenas para usuários free)
        if (!isUnlimited) {
            const { error: upsertError } = await supabase
                .from('daily_usage')
                .upsert({
                    user_id: user.id,
                    date: today,
                    count: (usage?.count || 0) + 1
                }, { onConflict: 'user_id, date' });

            if (upsertError) {
                console.error("Erro ao atualizar uso diário:", upsertError);
                // Não bloqueia a resposta, apenas loga o erro
            }
        }

        // Generate Image URL
        const imagePrompt = recipe.imagePrompt || `delicious food photography of ${recipe.title}`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}, professional food photography, 4k, high detail, appetizing, soft lighting?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
        recipe.imageUrl = imageUrl;

        // Save Recipe to History (não bloqueia se falhar)
        try {
            const { error: saveError } = await supabase
                .from('saved_recipes')
                .insert({
                    user_id: user.id,
                    title: recipe.title,
                    recipe_data: recipe
                });

            if (saveError) {
                console.error("Erro ao salvar receita no histórico:", saveError);
                // Não bloqueia a resposta, apenas loga o erro
            }
        } catch (saveException) {
            console.error("Exceção ao salvar receita:", saveException);
            // Continua mesmo se falhar ao salvar
        }

        return NextResponse.json(recipe);
    } catch (error: any) {
        console.error("Erro detalhado na API:", error);
        
        // Mensagens de erro mais amigáveis
        const errorMessage = error.message || "Erro desconhecido";
        let userMessage = "Ocorreu um erro ao gerar sua receita. Tente novamente.";
        
        if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
            userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (errorMessage.includes("timeout")) {
            userMessage = "A requisição demorou muito. Tente novamente.";
        }
        
        return NextResponse.json(
            { error: userMessage },
            { status: 500 }
        );
    }
}
