import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import assistantAsset from '../../assets/images/assistant-character.png.asset.json';
import bodyAsset from '../../assets/images/assistant-character-body.png.asset.json';
import armAsset from '../../assets/images/assistant-character-arm.png.asset.json';

export const assistantAvatarUrl = assistantAsset.url;

const bodyUrl = bodyAsset.url;
const armUrl = armAsset.url;

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
    <span
      className="relative inline-flex w-full h-full items-center justify-center"
      data-assistant-state={state}
    >
      <motion.span
        className={`relative w-[124%] max-w-none aspect-[1024/631] ${isReacting ? 'assistant-reply-highlight' : ''}`}
        animate={reducedMotion ? { y: 0, rotate: 0, scale: 1 } : isReacting ? {
          // Corpo quase parado, só acompanha levemente o aceno
          y: [0, -1, 0, -1, 0, 0],
          rotate: [0, -1.5, 1, -1.5, 1, 0],
        } : isSpeaking ? {
          y: [0, -2, 0], rotate: [0, -3, 3, 0],
        } : isGenerating ? {
          y: [0, -3, 0], rotate: [0, -5, 5, 0],
        } : { y: 0, rotate: 0 }}
        transition={{
          duration: isReacting ? 1.3 : isSpeaking ? 1.2 : 2,
          repeat: reducedMotion || state === 'idle' ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        {/*
          Camadas alinhadas ao mesmo canvas (1024x631):
          corpo fixo + bracinho que gira no ponto do ombro.
        */}
        <img
          src={imageUrl === assistantAvatarUrl ? bodyUrl : imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        />
        <motion.img
          src={armUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
          style={{ transformOrigin: '77.5% 98%' }}
          animate={
            reducedMotion
              ? { rotate: 0 }
              : isReacting
                ? { rotate: [0, 18, -6, 18, -6, 0] }
                : { rotate: 0 }
          }
          transition={{
            duration: 1.3,
            repeat: isReacting && !reducedMotion ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      </motion.span>
    </span>
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
