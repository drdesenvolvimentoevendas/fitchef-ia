'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {

    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string



    const { data, error } = await supabase.auth.signInWithPassword({
        email,
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



    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
            data: {
                name: formData.get('name') as string,
            }
        },
    })

    if (error) {
        console.error("Erro no Supabase:", error);
        return redirect('/login?error=' + encodeURIComponent(error.message))
    }



    if (data.user) {
        const name = formData.get('name') as string;
        if (name) {
            // Tenta atualizar o perfil, mas não bloqueia se falhar (ex: coluna não existe)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ id: data.user.id, name }, { onConflict: 'id' });

            if (profileError) {
                console.error("Erro ao atualizar perfil:", profileError);
            }
        }
    }

    revalidatePath('/', 'layout')
    return redirect('/login?message=Verifique seu email para confirmar o cadastro.')
}
