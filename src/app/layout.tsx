import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CurrentMealProvider } from '@/contexts/CurrentMealContext'

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <CurrentMealProvider>
            {children}
          </CurrentMealProvider>
        </div>
      </body>
    </html>
  )
}
