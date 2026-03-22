import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DownloadSimple, X, DeviceMobile } from '@phosphor-icons/react'
import Logo from './Logo'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (isStandalone) return

    // Check if dismissed recently
    const dismissed = localStorage.getItem('grings-pwa-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      // Show again after 3 days
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return
    }

    // Detect iOS
    const ua = navigator.userAgent
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIOS(isiOS)

    if (isiOS) {
      // Show iOS guide after 5 seconds
      const timer = setTimeout(() => setShowBanner(true), 5000)
      return () => clearTimeout(timer)
    }

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setShowIOSGuide(false)
    localStorage.setItem('grings-pwa-dismissed', Date.now().toString())
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 z-[60] max-w-sm mx-auto"
        >
          <div className="bg-[#1A1A1A] border border-[#00E620]/20 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,230,32,0.15)]">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-gray-600 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <Logo size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm">
                  Instalar Grings Team
                </h3>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                  {isIOS
                    ? 'Adicione à tela inicial para uma experiência completa de app'
                    : 'Instale o app para acesso rápido, offline e sem barra do navegador'}
                </p>

                {isIOS ? (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => setShowIOSGuide(!showIOSGuide)}
                      className="w-full py-2.5 rounded-xl bg-[#00E620] text-black font-bold text-xs
                                 flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <DeviceMobile size={16} weight="bold" />
                      Como instalar
                    </button>
                    <AnimatePresence>
                      {showIOSGuide && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white/5 rounded-xl p-3 space-y-2 text-xs text-gray-300">
                            <p>
                              <span className="text-[#00E620] font-bold">1.</span> Toque no
                              botão{' '}
                              <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded text-white">
                                Compartilhar ↑
                              </span>{' '}
                              na barra do Safari
                            </p>
                            <p>
                              <span className="text-[#00E620] font-bold">2.</span> Role até encontrar{' '}
                              <span className="text-white font-medium">
                                "Adicionar à Tela de Início"
                              </span>
                            </p>
                            <p>
                              <span className="text-[#00E620] font-bold">3.</span> Toque em{' '}
                              <span className="text-white font-medium">"Adicionar"</span>
                            </p>
                            <p className="text-gray-500 pt-1">
                              Pronto! O Grings Team aparecerá como app na sua tela inicial.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleInstall}
                      className="flex-1 py-2.5 rounded-xl bg-[#00E620] text-black font-bold text-xs
                                 flex items-center justify-center gap-1.5 touch-manipulation
                                 shadow-[0_0_15px_rgba(0,230,32,0.3)]"
                    >
                      <DownloadSimple size={16} weight="bold" />
                      Instalar App
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-3 py-2.5 rounded-xl bg-white/5 text-gray-400 text-xs
                                 hover:text-white transition-colors touch-manipulation"
                    >
                      Agora não
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
