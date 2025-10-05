"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Satellite, Leaf, Globe, ArrowRight } from "lucide-react"

interface WelcomeScreenProps {
  onEnter: () => void
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleExit()
      }
    }

    window.addEventListener("keypress", handleKeyPress)
    return () => window.removeEventListener("keypress", handleKeyPress)
  }, [])

  const handleExit = () => {
    if (isExiting) return // prevent multiple triggers
    setIsExiting(true)
    setTimeout(() => {
      onEnter()
    }, 800) // match exit animation duration
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-deep-space via-space-black to-space-blue overflow-hidden ${
        isExiting ? "animate-exit" : "animate-enter"
      }`}
    >
      <div className="absolute inset-0 opacity-50">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div
        className={`relative h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 lg:px-16 transition-all duration-800 ${
          isExiting ? "opacity-0 scale-95 translate-y-8" : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <div className="w-full lg:w-1/2 h-[300px] lg:h-[600px] relative">
          <div className="absolute inset-0 bg-gradient-radial from-nebula-purple/20 via-transparent to-transparent blur-3xl"></div>

          <div className="relative h-full rounded-2xl overflow-hidden border-2 border-nebula-cyan/30 shadow-2xl shadow-vegetation-bright/20">
            <img
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1874&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Lush green vegetation from aerial view"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-black/60 via-transparent to-space-black/30"></div>

            <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-space-blue/40 border border-nebula-cyan/30 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-vegetation-bright animate-pulse"></div>
                  <span className="text-star-white font-medium">Live Monitoring</span>
                </div>
                <span className="text-star-gray font-mono">10 African Sites</span>
              </div>
            </div>
          </div>

          <div className="absolute top-10 right-10 animate-float">
            <Satellite className="w-8 h-8 text-nebula-cyan" />
          </div>
          <div className="absolute bottom-20 left-10 animate-float-delayed">
            <Satellite className="w-6 h-6 text-vegetation-bright" />
          </div>
        </div>

        <div className="w-full lg:w-1/2 max-w-2xl space-y-6 lg:space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nebula-purple/10 border border-nebula-purple/30 backdrop-blur-sm">
              <Globe className="w-4 h-4 text-nebula-cyan" />
              <span className="text-sm font-mono text-star-gray">NASA Earth Observations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance leading-tight">
              <span className="bg-slate-200 bg-clip-text text-transparent">
                Witness the Pulse
              </span>
              <br />
              <span className="text-star-white">of Life on Earth</span>
            </h1>
          </div>

          <p className="text-lg lg:text-xl text-star-gray leading-relaxed text-pretty">
            Monitor global vegetation patterns using NASA satellite data and NDVI indices. Track seasonal changes,
            predict bloom events, and explore Africa's diverse ecosystems from the Sahel to Madagascar—all powered by
            real-time Earth observations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center lg:items-start gap-2 p-4 rounded-lg bg-space-blue/50 backdrop-blur-sm border border-nebula-purple/20">
              <Satellite className="w-6 h-6 text-nebula-cyan" />
              <div className="text-sm font-medium text-star-white">Satellite Imagery</div>
              <div className="text-xs text-star-gray text-center lg:text-left">Real-time Sentinel Hub data</div>
            </div>

            <div className="flex flex-col items-center lg:items-start gap-2 p-4 rounded-lg bg-space-blue/50 backdrop-blur-sm border border-vegetation-bright/20">
              <Leaf className="w-6 h-6 text-vegetation-bright" />
              <div className="text-sm font-medium text-star-white">NDVI Analysis</div>
              <div className="text-xs text-star-gray text-center lg:text-left">Vegetation health tracking</div>
            </div>

            <div className="flex flex-col items-center lg:items-start gap-2 p-4 rounded-lg bg-space-blue/50 backdrop-blur-sm border border-nebula-purple/20">
              <Globe className="w-6 h-6 text-nebula-purple" />
              <div className="text-sm font-medium text-star-white">Bloom Detection</div>
              <div className="text-xs text-star-gray text-center lg:text-left">Predictive analytics</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">

            <div className="text-lg text-star-gray font-mono">
              press{" "}
              <kbd className="px-2 py-1 rounded bg-space-blue border border-nebula-purple/30 text-star-white">
                Enter
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-space-black to-transparent"></div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .stars-small, .stars-medium, .stars-large {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 80%, white, transparent);
          background-size: 200% 200%;
          animation: twinkle 4s ease-in-out infinite;
        }

        .stars-medium {
          background-size: 300% 300%;
          animation-delay: 1s;
        }

        .stars-large {
          background-size: 400% 400%;
          animation-delay: 2s;
        }

        @keyframes enter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes exit {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.98);
          }
        }

        .animate-enter {
          animation: enter 0.6s ease-out forwards;
        }

        .animate-exit {
          animation: exit 0.8s ease-in forwards;
        }
      `}</style>
    </div>
  )
}
