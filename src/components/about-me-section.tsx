
'use client';

import { SectionHeading } from './section-heading';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { PORTFOLIO_USER_ID } from '@/lib/config';

function AboutMeContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userProfileRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [userId, firestore]);
  const { data: profile, isLoading } = useDoc(userProfileRef);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }
  
  if (!profile || !profile.aboutMe) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-lg text-muted-foreground">
        <p>Your 'About Me' content will appear here. Please update it in the admin panel.</p>
      </div>
    );
  }

  // Split content by newlines to render paragraphs and lists correctly
  const paragraphs = profile.aboutMe.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="max-w-4xl mx-auto">
        <div className="space-y-6 text-lg text-muted-foreground">
            {paragraphs.map((paragraph, index) => {
                if (paragraph.trim().startsWith('-')) {
                    const listItems = paragraph.split('\n').filter(item => item.trim().startsWith('-'));
                    return (
                        <ul key={index} className="space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
                        {listItems.map((item, itemIndex) => (
                            <li key={itemIndex}>{item.replace('-', '').trim()}</li>
                        ))}
                        </ul>
                    );
                }
                return <p key={index}>{paragraph}</p>;
            })}
        </div>
    </div>
  );
}

export function AboutMeSection() {
  const userIdToShow = PORTFOLIO_USER_ID;

  return (
    <section id="about" className="animate-in fade-in-0 slide-in-from-top-12 duration-1000">
      <SectionHeading>About Me__</SectionHeading>
      <div className="mt-12">
        {userIdToShow ? (
          <AboutMeContent userId={userIdToShow} />
        ) : (
          <p className="mt-8 text-center text-red-500">
            Please configure a user ID in `src/lib/config.ts` to display this section.
          </p>
        )}
      </div>
    </section>
  );
}
