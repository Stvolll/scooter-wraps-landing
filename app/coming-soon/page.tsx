'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Palette } from 'lucide-react'

export default function ComingSoonPage() {
  const [domain, setDomain] = useState('')
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Get domain from window location
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname)
    }

    // Countdown timer (example: launch date)
    const targetDate = new Date('2024-12-31T23:59:59').getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  const getDomainName = () => {
    if (domain.includes('txd.bike')) return 'TXD.Bike'
    if (domain.includes('decalwrap.co')) return 'DecalWrap'
    return 'Our Site'
  }

  const getDomainDescription = () => {
    if (domain.includes('txd.bike')) {
      return 'Premium vinyl wraps for scooters'
    }
    if (domain.includes('decalwrap.co')) {
      return 'Custom decal solutions'
    }
    return 'Coming soon'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-4xl w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-full">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-6xl md:text-7xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {getDomainName()}
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl text-purple-200 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Coming Soon
        </motion.p>

        <motion.p
          className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {getDomainDescription()}
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          className="grid grid-cols-4 gap-4 md:gap-8 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base text-gray-300 uppercase tracking-wider">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {[
            {
              icon: Zap,
              title: 'Fast & Reliable',
              description: 'Lightning-fast performance',
            },
            {
              icon: Palette,
              title: 'Premium Design',
              description: 'Beautiful and modern interface',
            },
            {
              icon: Sparkles,
              title: 'Innovative',
              description: 'Cutting-edge technology',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.5)' }}
            >
              <feature.icon className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Notification form */}
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Get notified when we launch
            </h3>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                // Handle notification signup
                alert('Thank you! We will notify you when we launch.')
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Notify Me
              </button>
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-12 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          © 2024 {getDomainName()}. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  )
}

