import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Product IDs from the user's screenshot
const PLANS = {
    '692f738a0ff99e92bd4dc3e7': { duration: 30, name: 'Mensal' },
    '692f74780ff99e92bd4dd08e': { duration: 180, name: 'Semestral' },
    '692f74bd0ff99e92bd4dd59f': { duration: 365, name: 'Anual' }
};

export async function POST(req: Request) {
    try {
        // 1. Validate Token
        const authHeader = req.headers.get('authorization');
        const webhookToken = process.env.WIAPY_WEBHOOK_TOKEN;

        if (!webhookToken) {
            console.error("WIAPY_WEBHOOK_TOKEN não configurada");
            return NextResponse.json({ error: "Configuração do servidor inválida" }, { status: 500 });
        }

        if (!authHeader || authHeader !== webhookToken) {
            console.warn("Tentativa de acesso não autorizada ao webhook");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Payload
        let payload;
        try {
            payload = await req.json();
        } catch (parseError) {
            console.error("Erro ao fazer parse do payload:", parseError);
            return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
        }

        const { payment, customer, products } = payload;

        // Validação de estrutura do payload
        if (!payment || !customer || !products || !Array.isArray(products) || products.length === 0) {
            console.error("Payload incompleto:", { payment: !!payment, customer: !!customer, products: !!products });
            return NextResponse.json({ error: "Payload incompleto" }, { status: 400 });
        }

        // 3. Check Payment Status
        if (payment?.status !== 'approved') {
            console.log(`Pagamento não aprovado: ${payment?.status}`);
            return NextResponse.json({ message: "Ignored: Payment not approved" }, { status: 200 });
        }

        // 4. Identify User
        const email = customer?.email;
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            console.error("Email inválido ou ausente:", email);
            return NextResponse.json({ error: "Email inválido ou ausente" }, { status: 400 });
        }

        const supabase = await createClient();

        // Find user by email (using the auth.users table is tricky via client, 
        // usually we query the profiles table if we stored the email there, 
        // OR we use the admin client to find the user by email.
        // Since we don't have service_role key set up in the client helper easily, 
        // we might need to rely on the profile having the email or link via ID.
        // Ideally, profiles table should have email. Let's assume profiles has email or we search auth.
        // For now, let's try to find in profiles if email is stored there. 
        // If not, we might need to use Supabase Admin.
        // Let's assume the user is already registered and we can find them.

        // IMPORTANT: The standard Supabase setup doesn't expose auth.users to public.
        // We need to use the SERVICE_ROLE key to search users by email.
        // But we only have ANON key in env vars usually for the client.
        // Let's check if we can find the profile by email (if we added email to profiles).
        // If not, we might be stuck unless we add email to profiles.
        // Let's check profiles table structure first? No, let's just assume we need to add email to profiles or use service role.
        // Given the constraints, let's try to update based on email if possible.

        // Actually, the best way is to store the user_id in the "metadata" or "custom_data" of the payment if Wiapy supports it.
        // But the user didn't configure that.
        // So we match by Email.

        // We will try to find a profile with that email. 
        // Note: profiles table usually has id (uuid) and other fields. 
        // If we didn't store email in profiles, we can't find them easily without Admin.
        // Let's assume we can't find them without Admin Key.
        // BUT, for this project, let's try to use the `supabase` client with the anon key 
        // and hope the RLS allows searching profiles by email if we add an email column?
        // Or better: We instruct the user to add `WIAPY_WEBHOOK_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` to env vars.

        // For now, let's write the logic assuming we can find the user.
        // We will query `profiles` table. If email is not there, we can't update.
        // Let's add email to profiles table in a migration if needed?
        // Or we can just use `supabase.auth.admin.listUsers()` if we had the key.

        // Workaround: We will search in `profiles` assuming there is an email column (common practice).
        // If not, we will fail.

        // Let's check if profiles has email.
        // I'll assume it doesn't for now based on previous files.
        // I will try to update using the email in the `auth.users` via a direct RPC or just assume the user used the same email.

        // Let's try to use the Supabase Admin Client if available, otherwise fail gracefully.
        // Since I can't easily add Service Role Key now without user interaction, 
        // I will try to find the user by email in the `profiles` table.
        // I will add a step to add `email` to `profiles` table to make this robust.

        // Wait, I can't easily add email to profiles for existing users without a trigger.
        // Let's assume the user uses the same email.

        // Let's look at the payload again.
        // `customer.email`.

        // I will try to find the profile.
        // If I can't find it, I'll log an error.

        const productId = products[0]?.id;
        if (!productId) {
            console.error("Product ID não encontrado no payload");
            return NextResponse.json({ error: "Product ID não encontrado" }, { status: 400 });
        }

        const planInfo = PLANS[productId as keyof typeof PLANS];
        if (!planInfo) {
            console.error(`Plano não reconhecido: ${productId}`);
            return NextResponse.json({ error: `Plano não reconhecido: ${productId}` }, { status: 400 });
        }

        const daysToAdd = planInfo.duration;
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + daysToAdd);

        // We need to find the user ID.
        // Since we don't have email in profiles, we are kind of stuck unless we use Service Role.
        // I will write the code to use `supabase.from('profiles').select('id').eq('email', email)`
        // AND I will create a migration to add email to profiles and sync it.

        // Actually, let's just use the `supabase-admin` pattern if possible.
        // But for now, I'll stick to standard client and ask user to add email to profiles?
        // No, that's too complex for the user.

        // Let's try to use the `supabase` client. 
        // If the user is logged in, we have the session. But this is a webhook, no session.
        // We NEED the Service Role Key to bypass RLS and find the user by email.

        // I will add a comment in the code that `SUPABASE_SERVICE_ROLE_KEY` is needed.

        // Wait, I can create a client with the service role key if it's in env.
        // `createClient(url, serviceRoleKey)`

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        let adminSupabase = supabase;

        if (serviceRoleKey) {
            const { createClient: createAdmin } = require('@supabase/supabase-js');
            adminSupabase = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });
        }

        // Try to find user ID by email using Admin Auth
        let users;
        try {
            const { data, error: userError } = await adminSupabase.auth.admin.listUsers();
            if (userError) {
                console.error("Erro ao listar usuários:", userError);
                return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
            }
            users = data?.users;
        } catch (listError) {
            console.error("Exceção ao listar usuários:", listError);
            return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
        }

        const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            console.warn(`Usuário não encontrado para o email: ${email}`);
            return NextResponse.json({ error: "Usuário não encontrado. Certifique-se de que a conta foi criada." }, { status: 404 });
        }

        // Update Profile
        const { error: updateError } = await adminSupabase
            .from('profiles')
            .update({
                plan_tier: 'performance',
                subscription_expires_at: newExpiry.toISOString(),
                is_premium: true // Legacy support
            })
            .eq('id', user.id);

        if (updateError) {
            console.error("Erro ao atualizar perfil:", updateError);
            return NextResponse.json({ 
                error: "Falha ao atualizar perfil",
                details: updateError.message 
            }, { status: 500 });
        }

        console.log(`Perfil atualizado com sucesso para ${email} - Plano: ${planInfo.name}, Expira em: ${newExpiry.toISOString()}`);
        return NextResponse.json({ 
            success: true, 
            message: `Plano atualizado para Performance por ${daysToAdd} dias`,
            expires_at: newExpiry.toISOString()
        });

    } catch (error: any) {
        console.error("Erro no webhook:", error);
        const errorMessage = error?.message || "Erro desconhecido";
        return NextResponse.json({ 
            error: "Erro interno do servidor",
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}
