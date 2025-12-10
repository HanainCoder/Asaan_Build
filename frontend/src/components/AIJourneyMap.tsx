import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const steps = [
  { id: 1, label: "Generated First App" },
  { id: 2, label: "Customized Templates" },
  { id: 3, label: "Published a Deployment" },
  { id: 4, label: "Next: Build Your AI Agent" },
];

export default function AIJourneyMap() {
  return (
    <div className="
      w-full mt-10 p-8 rounded-2xl
      bg-gradient-to-br from-gray-50 to-white 
      border border-gray-200 shadow-sm relative overflow-hidden
    ">
      {/* Soft blueprint glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Your AI Journey
          </h2>

          <span className="
            text-xs bg-purple-100 text-purple-700 
            px-3 py-1 rounded-full ml-auto
          ">
            PREMIUM
          </span>
        </div>

        {/* Curved path SVG */}
        <svg
          viewBox="0 0 600 200"
          className="w-full h-32 mb-8"
        >
          <motion.path
            d="M 20 150 C 150 20, 300 20, 580 150"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0" x2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Dots */}
          {steps.map((step, idx) => (
            <motion.circle
              key={step.id}
              cx={40 + idx * 180}
              cy={idx === 1 || idx === 2 ? 70 : 150}
              r="10"
              fill="white"
              stroke="#8b5cf6"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.3, type: "spring" }}
            />
          ))}
        </svg>

        {/* Step Labels */}
        <div className="grid grid-cols-4 text-center">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.3 }}
              className="
                text-sm text-gray-700 font-medium
              "
            >
              {step.label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
