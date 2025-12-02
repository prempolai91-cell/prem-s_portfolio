
import Image from 'next/image';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PORTFOLIO_USER_ID } from '@/lib/config';


export function ProfilePhoto() {
  const userIdToShow = PORTFOLIO_USER_ID;

  const firestore = useFirestore();
  const userProfileRef = useMemoFirebase(() => userIdToShow && firestore ? doc(firestore, 'users', userIdToShow) : null, [userIdToShow, firestore]);
  const { data: profile, isLoading } = useDoc(userProfileRef);

  const profilePlaceholder = PlaceHolderImages.find(p => p.id === 'profile-photo');
  
  // Ensure there's always a valid src, with a final fallback.
  const profileImage = profile?.profilePhotoUrl || profilePlaceholder?.imageUrl || "https://picsum.photos/seed/1/256/256";

  if (isLoading) {
    return <Skeleton className="w-96 h-96 md:w-[400px] md:h-[400px] rounded-full" />;
  }

  return (
    <div className="relative w-96 h-96 md:w-[400px] md:h-[400px]">
        <div
            className="absolute -inset-2 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full blur-xl opacity-60 animate-pulse"
            style={{
                borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
                animationDuration: '6s',
            }}
        />
        <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%' }}>
            <Image
                src={profileImage}
                alt={profile?.name || 'Profile Photo'}
                fill
                priority
                className="w-full h-full object-cover object-top"
            />
        </div>
    </div>
  );
}
