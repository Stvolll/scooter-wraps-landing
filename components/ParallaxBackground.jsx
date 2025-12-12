'use client'

import { useEffect, useRef } from 'react'

export default function ParallaxBackground({ rotationAngle = 0 }) {
  const bgRef = useRef(null)

  useEffect(() => {
    if (!bgRef.current) return

    // Parallax effect based on rotation
    const offsetX = Math.sin((rotationAngle * Math.PI) / 180) * 100
    const offsetY = Math.cos((rotationAngle * Math.PI) / 180) * 50

    bgRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.1)`
  }, [rotationAngle])

  return (
    <div
      ref={bgRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{
        backgroundImage: 'url(/images/background-parallax.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'transform 0.1s ease-out',
        zIndex: 0,
      }}
    />
  )
}


