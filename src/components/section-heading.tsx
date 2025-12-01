
'use client';

import type { ReactNode } from 'react';
import TextType from './TextType';

type SectionHeadingProps = {
  children: ReactNode;
};

export function SectionHeading({ children }: SectionHeadingProps) {
  // The TextType component works best with a string.
  // We'll check if the children are a string before applying the effect.
  if (typeof children !== 'string') {
    return (
      <h2 className="text-center text-3xl font-bold tracking-tight text-gradient-primary sm:text-4xl">
        {children}
      </h2>
    );
  }

  return (
    <div className="text-center">
        <TextType
            as="h2"
            text={children}
            typingSpeed={75}
            deletingSpeed={0}
            pauseDuration={10000} // Long pause to prevent deleting
            loop={false}
            startOnVisible={true} // Animate when it scrolls into view
            className="text-3xl font-bold tracking-tight text-gradient-primary sm:text-4xl inline-block"
            cursorClassName="text-primary"
        />
    </div>
  );
}
