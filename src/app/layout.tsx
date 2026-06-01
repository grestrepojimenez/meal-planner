import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CurrentMealProvider } from '@/contexts/CurrentMealContext'
import Navigation from '@/components/Navigation/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meal Planner - Planificador de Comidas',
  description: 'Organiza tu plan de comidas semanal de manera eficiente y saludable',
  keywords: ['meal planner', 'comidas', 'planificación', 'nutrición', 'salud'],
  authors: [{ name: 'Meal Planner Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <CurrentMealProvider>
            <Navigation />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </CurrentMealProvider>
        </div>
      </body>
    </html>
  )
}
