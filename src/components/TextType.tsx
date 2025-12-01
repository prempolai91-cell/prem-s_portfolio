'use client';

import { useEffect, useRef, useState, createElement, useMemo, useCallback } from 'react';
import './TextType.css';

const TextType = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(!startOnVisible);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const stateRef = useRef({
    charIndex: 0,
    isDeleting: false,
    textIndex: 0,
    pauseUntil: 0,
    lastTime: 0,
    accumulatedTime: 0,
  });

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return undefined;
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isAnimationActive) {
          setIsAnimationActive(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [startOnVisible, isAnimationActive]);
  
  useEffect(() => {
    if (!isAnimationActive) return;

    stateRef.current.pauseUntil = performance.now() + initialDelay;

    const animate = (currentTime: number) => {
      const state = stateRef.current;
      
      if (currentTime < state.pauseUntil) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      if (!state.lastTime) {
        state.lastTime = currentTime;
      }

      const deltaTime = currentTime - state.lastTime;
      state.lastTime = currentTime;
      state.accumulatedTime += deltaTime;
      
      const currentFullText = reverseMode ? textArray[state.textIndex].split('').reverse().join('') : textArray[state.textIndex];
      const currentSpeed = state.isDeleting ? deletingSpeed : getRandomSpeed();
      
      if (state.accumulatedTime >= currentSpeed) {
        state.accumulatedTime = 0;
        let nextCharIndex = state.charIndex;
        let nextIsDeleting = state.isDeleting;
        let nextTextIndex = state.textIndex;

        if (state.isDeleting) {
          if (state.charIndex > 0) {
            nextCharIndex--;
          } else {
            nextIsDeleting = false;
            nextTextIndex = (state.textIndex + 1) % textArray.length;
            
            if (onSentenceComplete) {
              onSentenceComplete(textArray[nextTextIndex], nextTextIndex);
            }

            if (!loop && nextTextIndex === 0) {
              // Stop after one full loop if not looping
              setDisplayedText(textArray[textArray.length - 1]);
              if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
              return;
            }
            state.pauseUntil = currentTime + pauseDuration;
          }
        } else { // Typing
          if (state.charIndex < currentFullText.length) {
            nextCharIndex++;
          } else { // Finished typing sentence
            if (loop || state.textIndex < textArray.length - 1) {
                nextIsDeleting = true;
                state.pauseUntil = currentTime + pauseDuration;
            } else { // Finished all sentences and not looping
                setDisplayedText(currentFullText);
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                return;
            }
          }
        }
        
        state.charIndex = nextCharIndex;
        state.isDeleting = nextIsDeleting;
        state.textIndex = nextTextIndex;

        setDisplayedText(currentFullText.substring(0, state.charIndex));
        setCurrentTextIndex(state.textIndex);
        setIsDeleting(state.isDeleting);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimationActive, textArray, deletingSpeed, typingSpeed, loop, pauseDuration, onSentenceComplete, reverseMode, getRandomSpeed, initialDelay]);

  const currentTextLength = textArray[currentTextIndex]?.length || 0;
  const isTypingInProgress = displayedText.length < currentTextLength;
  const shouldHideCursor = hideCursorWhileTyping && (isTypingInProgress || isDeleting);

  const cursorStyle = {
    animationDuration: `${cursorBlinkDuration * 2}s`,
  };

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`,
      ...props,
    },
    createElement('span', {
      className: "text-type__content",
      style: { color: getCurrentTextColor() },
    }, displayedText),
    showCursor && createElement(
      'span',
      {
        style: cursorStyle,
        className: `text-type__cursor ${cursorClassName} ${shouldHideCursor ? 'text-type__cursor--hidden' : ''}`,
        'aria-hidden': 'true'
      },
      cursorCharacter
    )
  );
};

export default TextType;
