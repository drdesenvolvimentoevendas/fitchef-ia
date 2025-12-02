import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const { ingredients, goal, time, mode = 'single' } = await req.json();

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

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API Key is missing in process.env");
            return NextResponse.json(
                { error: "API Key não configurada. Adicione GEMINI_API_KEY ao arquivo .env.local" },
                { status: 500 }
            );
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Limpar markdown se houver (```json ... ```)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let recipe;
        try {
            recipe = JSON.parse(text);
        } catch (e) {
            console.error("Erro ao fazer parse do JSON:", text);
            return NextResponse.json(
                { error: "Erro ao processar resposta da IA. Tente novamente." },
                { status: 500 }
            );
        }

        // Increment Usage Count
        const { error: upsertError } = await supabase
            .from('daily_usage')
            .upsert({
                user_id: user.id,
                date: today,
                count: (usage?.count || 0) + 1
            }, { onConflict: 'user_id, date' });

        if (upsertError) {
            console.error("Erro ao atualizar uso diário:", upsertError);
        }

        // Generate Image URL
        const imagePrompt = recipe.imagePrompt || `delicious food photography of ${recipe.title}`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}, professional food photography, 4k, high detail, appetizing, soft lighting?width=800&height=600&nologo=true`;
        recipe.imageUrl = imageUrl;

        // Save Recipe to History
        const { error: saveError } = await supabase
            .from('saved_recipes')
            .insert({
                user_id: user.id,
                title: recipe.title,
                recipe_data: recipe
            });

        if (saveError) {
            console.error("Erro ao salvar receita no histórico:", saveError);
        }

        return NextResponse.json(recipe);
    } catch (error: any) {
        console.error("Erro detalhado na API:", error);
        return NextResponse.json(
            { error: `Erro na geração: ${error.message || error}` },
            { status: 500 }
        );
    }
}
