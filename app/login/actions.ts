'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validação básica
    if (!email || !email.includes('@')) {
        return redirect('/login?error=' + encodeURIComponent('Email inválido'))
    }

    if (!password || password.length < 6) {
        return redirect('/login?error=' + encodeURIComponent('Senha deve ter pelo menos 6 caracteres'))
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
    })

    if (error) {
        console.error("Erro Login Supabase:", error);

        if (error.message.includes("Email not confirmed")) {
            return redirect('/login?error=Email não confirmado. Verifique sua caixa de entrada (e spam) ou desative a confirmação no Supabase.')
        }

        return redirect('/login?error=' + encodeURIComponent(error.message))
    }


    revalidatePath('/', 'layout')
    redirect('/generate')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    // Validação de dados
    if (!email || !email.includes('@')) {
        return redirect('/login?error=' + encodeURIComponent('Email inválido'))
    }

    if (!password || password.length < 6) {
        return redirect('/login?error=' + encodeURIComponent('Senha deve ter pelo menos 6 caracteres'))
    }

    if (!name || name.trim().length < 2) {
        return redirect('/login?error=' + encodeURIComponent('Nome deve ter pelo menos 2 caracteres'))
    }

    const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
            data: {
                name: name.trim(),
            }
        },
    })

    if (error) {
        console.error("Erro no Supabase:", error);
        return redirect('/login?error=' + encodeURIComponent(error.message))
    }



    if (data.user) {
        const trimmedName = name.trim();
        if (trimmedName) {
            // Tenta atualizar o perfil, mas não bloqueia se falhar (ex: coluna não existe)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ 
                    id: data.user.id, 
                    name: trimmedName,
                    plan_tier: 'free',
                    is_premium: false
                }, { onConflict: 'id' });

            if (profileError) {
                console.error("Erro ao atualizar perfil:", profileError);
                // Não bloqueia o cadastro se falhar ao criar perfil
            }
        }
    }

    revalidatePath('/', 'layout')
    return redirect('/login?message=Verifique seu email para confirmar o cadastro.')
}
