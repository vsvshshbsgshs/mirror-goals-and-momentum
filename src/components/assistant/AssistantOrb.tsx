import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import assistantAsset from '../../assets/images/assistant-character.png.asset.json';
import waveAsset from '../../assets/images/assistant-character-wave.png';

export const assistantAvatarUrl = assistantAsset.url;

interface AssistantOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  isGenerating?: boolean;
  isReacting?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
  imageUrl?: string;
}

export const AssistantOrb: React.FC<AssistantOrbProps> = ({
  size = 'md',
  isSpeaking = false,
  isGenerating = false,
  isReacting = false,
  className = '',
  onClick,
  title = 'Assistente Delux',
  imageUrl = assistantAvatarUrl,
}) => {
  const reducedMotion = useReducedMotion();
  const dimensions = {
    xs: 'w-6 h-6',
    sm: 'w-[34px] h-[34px]',
    md: 'w-12 h-12',
    lg: 'w-[76px] h-[76px]',
    xl: 'w-[104px] h-[104px]',
  }[size];
  const state = isReacting ? 'reply' : isSpeaking ? 'speaking' : isGenerating ? 'thinking' : 'idle';
  const character = (
    <motion.span
      className="relative inline-flex w-full h-full items-center justify-center"
      data-assistant-state={state}
      style={isReacting ? { transformOrigin: '60% 20%' } : undefined}
      animate={reducedMotion ? { y: 0, rotate: 0, scale: 1 } : isReacting ? {
        // Aceno: personagem inclina e balança como se movesse o bracinho
        rotate: [0, -10, 9, -10, 9, 0],
        y: [0, -4, 0, -4, 0, 0],
        scale: [1, 1.08, 1, 1.08, 1, 1],
      } : isSpeaking ? {
        y: [0, -2, 0], rotate: [0, -4, 4, 0], scale: [1, 1.04, 1],
      } : isGenerating ? {
        y: [0, -3, 0], rotate: [0, -6, 6, 0], scale: 1,
      } : { y: 0, rotate: 0, scale: 1 }}
      transition={{
        duration: isReacting ? 1.3 : isSpeaking ? 1.2 : 2,
        repeat: reducedMotion || state === 'idle' ? 0 : Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src={imageUrl}
        alt={title}
        className={`absolute inset-0 w-full h-full object-contain select-none pointer-events-none transition-opacity duration-200 ${isReacting ? 'opacity-0' : 'opacity-100'}`}
      />
      <img
        src={waveAsset}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1024}
        height={1024}
        className={`absolute inset-0 w-full h-full object-contain select-none pointer-events-none transition-opacity duration-200 ${isReacting ? `opacity-100 ${isReacting ? 'assistant-reply-highlight' : ''}` : 'opacity-0'}`}
      />
    </motion.span>
  );

  if (onClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`relative shrink-0 select-none rounded-full p-0 overflow-visible ${dimensions} ${className}`}
      >
        {character}
      </Button>
    );
  }
  return (
    <span title={title} className={`relative inline-flex shrink-0 select-none ${dimensions} ${className}`}>
      {character}
    </span>
  );
};
