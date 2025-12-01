
'use client';
import { Button } from '@/components/ui/button';
import { ProfilePhoto } from './profile-photo';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PORTFOLIO_USER_ID } from '@/lib/config';

// This component fetches and displays the profile for a specific user ID.
function ProfileHeaderContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userProfileRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId): null, [userId, firestore]);
  const { data: profile, isLoading } = useDoc(userProfileRef);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-12 w-full">
        <div className="flex justify-center items-center">
            <Skeleton className="w-56 h-56 md:w-80 md:h-[448px] rounded-full bg-muted" />
        </div>
        <div className="md:w-3/4 lg:w-2/3 space-y-4">
          <Skeleton className="h-20 w-3/4 bg-muted" />
          <Skeleton className="h-8 w-1/2 bg-muted" />
          <Skeleton className="h-6 w-full bg-muted" />
          <div className="flex gap-4">
            <Skeleton className="h-11 w-32 bg-muted" />
            <Skeleton className="h-11 w-32 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const displayProfile = profile || {};
  const headerBio = `Welcome to my professional portfolio. Explore my featured projects, skills, and experience.

Take a look around my digital portfolio. This is where I showcase my work and my creative journey.`;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-16 w-full">
        <div className="flex justify-center items-center">
            <ProfilePhoto />
        </div>
        <div className="md:w-3/4 lg:w-2/3 space-y-4 mt-8 md:mt-0">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2 font-headline-display text-foreground">
                Hii, I'm Prem
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground mt-8 whitespace-pre-line">
            {headerBio}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
            <Button asChild size="lg">
                <a href="#projects">View Projects</a>
            </Button>
            <Button asChild size="lg" variant="outline">
                <a href="#contact">Contact Me</a>
            </Button>
            </div>
        </div>
    </div>
  );
}


export function Header() {
  const userIdToShow = PORTFOLIO_USER_ID; 

  return (
    <header className="relative flex items-center justify-center pt-12 pb-20 animate-in fade-in duration-500">
      {userIdToShow ? (
        <ProfileHeaderContent userId={userIdToShow} />
      ) : (
         <p className="text-center text-red-500">
            Please configure a user ID in `src/lib/config.ts` to display profile information.
         </p>
      )}
    </header>
  );
}
