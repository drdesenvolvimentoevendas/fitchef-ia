import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FitChef IA',
        short_name: 'FitChef',
        description: 'Seu nutricionista de bolso com IA',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FFB300',
        icons: [
            {
                src: '/icon.png', // We'll need to make sure this exists or use a placeholder
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
