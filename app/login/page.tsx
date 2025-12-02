import { LoginForm } from './LoginForm'
import { ChefHat, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string; error: string }>
}) {
    const { message, error } = await searchParams;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero/salad.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-brand-yellow transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Home
                    </Link>
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                            <ChefHat className="w-8 h-8 text-brand-black" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Bem-vindo ao FitChef
                    </h2>
                    <p className="mt-2 text-gray-400">
                        Entre ou crie sua conta para salvar receitas
                    </p>
                </div>

                <LoginForm message={message} error={error} />
            </div>
        </div>
    )
}
