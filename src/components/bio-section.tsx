
'use client';

import { SectionHeading } from './section-heading';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { PORTFOLIO_USER_ID } from '@/lib/config';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type UserProfile = {
    bio?: string;
};

function BioContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userProfileRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [userId, firestore]);
  const { data: profile, isLoading } = useDoc<UserProfile>(userProfileRef);
  const educationImage = PlaceHolderImages.find(p => p.id === 'education-placeholder');
  
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-full mt-4" />
            </div>
            <div>
                <Skeleton className="aspect-video w-full" />
            </div>
      </div>
    );
  }
  
  if (!profile || !profile.bio) {
    return (
        <div className="text-center">
            <div className="max-w-2xl mx-auto space-y-6 text-lg text-muted-foreground">
                <p>Details about my educational background will appear here once updated in the admin panel.</p>
            </div>
        </div>
    );
  }

  const bioParagraphs = profile.bio.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-lg text-muted-foreground text-left">
            {bioParagraphs.map((paragraph, index) => {
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
        {educationImage?.imageUrl && (
             <div className="relative aspect-video w-full mx-auto group">
                <Image 
                    src={educationImage.imageUrl} 
                    alt={educationImage.description} 
                    fill
                    className="object-contain rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={educationImage.imageHint}
                />
            </div>
        )}
    </div>
  );
}

export function BioSection() {
  const userIdToShow = PORTFOLIO_USER_ID;

  return (
    <section id="education" className="animate-in fade-in duration-500">
      <SectionHeading>My Education__</SectionHeading>
      <div className="mt-12">
        {userIdToShow ? (
          <BioContent userId={userIdToShow} />
        ) : (
          <p className="mt-8 text-center text-red-500">
            Please configure a user ID in `src/lib/config.ts` to display the bio.
          </p>
        )}
      </div>
    </section>
  );
}
