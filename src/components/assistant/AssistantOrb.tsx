import React from 'react';
import { motion } from 'motion/react';
import assistantAvatarUrl from '../../assets/images/assistant_profile_1791766898217.jpg';

export { assistantAvatarUrl };

interface AssistantOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  isGenerating?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
  imageUrl?: string;
}

export const AssistantOrb: React.FC<AssistantOrbProps> = ({
  size = 'md',
  isSpeaking = false,
  isGenerating = false,
  className = '',
  onClick,
  title = 'Assistente Delux',
  imageUrl = assistantAvatarUrl
}) => {
  const active = isSpeaking || isGenerating;

  // Dimensions calibrated to Apple UI scales (with high-DPI crispness)
  const dimensions = {
    xs: {
      sizePx: 24,
      container: 'w-6 h-6',
      imageSize: 'w-6 h-6',
      rounded: 'rounded-full',
      glowBlur: 'blur-xs',
      specularH: 'h-[7px]',
      ringPadding: 'p-[1.5px]'
    },
    sm: {
      sizePx: 34,
      container: 'w-[34px] h-[34px]',
      imageSize: 'w-[34px] h-[34px]',
      rounded: 'rounded-full',
      glowBlur: 'blur-sm',
      specularH: 'h-[10px]',
      ringPadding: 'p-[2px]'
    },
    md: {
      sizePx: 48,
      container: 'w-12 h-12',
      imageSize: 'w-12 h-12',
      rounded: 'rounded-2xl',
      glowBlur: 'blur-md',
      specularH: 'h-[14px]',
      ringPadding: 'p-[2.5px]'
    },
    lg: {
      sizePx: 76,
      container: 'w-[76px] h-[76px]',
      imageSize: 'w-[76px] h-[76px]',
      rounded: 'rounded-3xl',
      glowBlur: 'blur-lg',
      specularH: 'h-[22px]',
      ringPadding: 'p-[3px]'
    },
    xl: {
      sizePx: 104,
      container: 'w-[104px] h-[104px]',
      imageSize: 'w-[104px] h-[104px]',
      rounded: 'rounded-[32px]',
      glowBlur: 'blur-xl',
      specularH: 'h-[30px]',
      ringPadding: 'p-[3.5px]'
    }
  }[size];

  return (
    <motion.div
      onClick={onClick}
      title={title}
      // Apple Motion physics: tactile spring scale on hover & tap
      whileHover={onClick ? { scale: 1.08, y: -1 } : { scale: 1.03 }}
      whileTap={onClick ? { scale: 0.94 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${dimensions.container} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* ========================================================
          1. APPLE ACOUSTIC RESONANCE RIPPLES (When speaking)
          Concentric radiating soundwaves like Siri / Apple Intelligence
         ======================================================== */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute inset-0 rounded-full border border-[#38BDF8]/60 bg-[#38BDF8]/15"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: [1, 2.3], opacity: [0.6, 0] }}
            transition={{
              duration: 1.8,
              delay: 0.45,
              repeat: Infinity,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute inset-0 rounded-full border border-[#818CF8]/50 bg-[#818CF8]/10"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0.45 }}
            animate={{ scale: [1, 2.8], opacity: [0.4, 0] }}
            transition={{
              duration: 1.8,
              delay: 0.9,
              repeat: Infinity,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute inset-0 rounded-full border border-[#C084FC]/40"
          />
        </div>
      )}

      {/* ========================================================
          2. ATMOSPHERIC BACKLIGHT AURORA (Apple Motion Glow)
          Soft chromatic volumetric halo diffusing into the background
         ======================================================== */}
      <motion.div
        animate={
          isSpeaking
            ? {
                scale: [1.12, 1.3, 1.12],
                opacity: [0.6, 0.85, 0.6],
                rotate: [0, 180, 360]
              }
            : isGenerating
            ? {
                scale: [1.08, 1.22, 1.08],
                opacity: [0.55, 0.75, 0.55],
                rotate: [0, 180, 360]
              }
            : {
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.45, 0.3]
              }
        }
        transition={{
          duration: isSpeaking ? 3 : isGenerating ? 4 : 7,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute -inset-1 rounded-full pointer-events-none ${dimensions.glowBlur}`}
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.75) 0%, rgba(79, 70, 229, 0.55) 50%, rgba(192, 132, 252, 0.35) 75%, transparent 100%)'
        }}
      />

      {/* ========================================================
          3. CHROMATIC GRADIENT BORDER RING
          Apple Intelligence iridescent outer border
         ======================================================== */}
      <motion.div
        animate={
          isGenerating
            ? { rotate: 360 }
            : isSpeaking
            ? { rotate: [0, 15, -15, 0] }
            : { rotate: 0 }
        }
        transition={
          isGenerating
            ? { duration: 4, repeat: Infinity, ease: 'linear' }
            : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
        className={`absolute inset-0 rounded-full ${dimensions.ringPadding} bg-gradient-to-tr from-[#38BDF8] via-[#818CF8] to-[#C084FC] shadow-sm`}
      />

      {/* ========================================================
          4. MAIN 3D CHARACTER AVATAR BODY
          Floating levitation & breathing motion
         ======================================================== */}
      <motion.div
        animate={
          isSpeaking
            ? {
                scale: [1, 1.04, 0.98, 1.03, 1],
                y: [0, -2, 1, -1, 0]
              }
            : isGenerating
            ? {
                scale: [1, 1.03, 1],
                y: [0, -2, 0]
              }
            : {
                y: [0, -1.5, 0]
              }
        }
        transition={{
          duration: isSpeaking ? 1.4 : isGenerating ? 2 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="relative w-full h-full rounded-full p-[2px] overflow-hidden bg-white shadow-[0_2px_10px_rgba(37,99,235,0.2)] flex items-center justify-center z-10"
      >
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover object-center select-none pointer-events-none"
        />

        {/* Specular glass reflection meniscus on top of avatar */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[85%] ${dimensions.specularH} rounded-full pointer-events-none z-20`}
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0) 100%)'
          }}
        />

        {/* Subtle inner shadow rim for physical depth */}
        <div className="absolute inset-0 rounded-full pointer-events-none z-20 shadow-[inset_0_0_4px_rgba(0,0,0,0.12)]" />
      </motion.div>

      {/* ========================================================
          5. ACTIVE STATUS INDICATOR PIN (On larger sizes)
         ======================================================== */}
      {(size === 'lg' || size === 'xl') && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-0.5 -right-0.5 z-30 flex items-center justify-center"
        >
          <span className="relative flex h-4 w-4">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSpeaking
                  ? 'bg-emerald-400'
                  : isGenerating
                  ? 'bg-blue-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-xs ${
                isSpeaking
                  ? 'bg-emerald-500'
                  : isGenerating
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
            />
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
