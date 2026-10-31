import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { Providers } from '@/components/providers'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#05070B',
}

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return {
    metadataBase: new URL(base),
    title: 'CORTEX-AETHER · Interactive 3D Neuro-Atlas',
    description:
      'An interactive 3D neuro-atlas, neuroimaging lab and study engine for Biological & Cognitive Psychology (Weeks 1–11).',
    icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
    openGraph: {
      title: 'CORTEX-AETHER · Interactive 3D Neuro-Atlas',
      description: 'Explore the brain from lobes to synapses, simulate neuroimaging methods and study smarter.',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'CortexAether',
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
          <Providers>{children}</Providers>
          <Toaster />
          {/* IMPORTANT: Do not remove — handles chunk loading race conditions in the dev server */}
          <ChunkLoadErrorHandler />
        </ThemeProvider>
      </body>
    </html>
  )
}
