
'use client';
import { SectionHeading } from './section-heading';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { PORTFOLIO_USER_ID } from '@/lib/config';
import { LogoLoop } from './LogoLoop';

type SvgIconProps = {
  className?: string;
  path: string;
};

const SvgIcon = ({ className, path }: SvgIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d={path} />
  </svg>
);


// A map to associate technology names with their SVG paths.
const iconMap: { [key: string]: { path: string; viewBox?: string } } = {
  'React': { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-8.5c0-1.07 1.1-1.93 2.4-1.93s2.4.86 2.4 1.93c0 1.07-1.1 1.93-2.4 1.93s-2.4-.86-2.4-1.93zm9.5 0c0-1.07 1.1-1.93 2.4-1.93s2.4.86 2.4 1.93c0 1.07-1.1 1.93-2.4 1.93s-2.4-.86-2.4-1.93zM12 6.5c-2.39 0-4.44 1.22-5.5 3.09.28-.05.57-.09.88-.09 2.49 0 4.5 2.01 4.5 4.5s-2.01 4.5-4.5 4.5c-.31 0-.6-.04-.88-.09C7.56 19.78 9.61 21 12 21c3.31 0 6-2.69 6-6s-2.69-6-6-6z' },
  'Next.js': { path: 'M14.33 2.01L7.38 8.96l-4.25-4.25-2.12 2.12 6.37 6.37 8.07-8.07zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
  'Genkit': { path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-4h2v4zm4 0h-2v-2h2v2z' },
  'Firebase': { path: 'M3.18 10.37l5.44 1.45c.2.05.36.22.41.41l1.45 5.44c.08.3.36.52.66.52s.58-.22.66-.52l1.45-5.44c.05-.2.22-.36.41-.41l5.44-1.45c.3-.08.52-.36.52-.66s-.22-.58-.52-.66L11.63 7.6c-.2-.05-.36-.22-.41.41L9.77 1.74c-.08-.3-.36-.52-.66-.52s-.58.22-.66.52L6.99 7.18c-.05.2-.22-.36-.41.41L1.14 9.04c-.3.08-.52.36-.52-.66s.22.58.52.67z' },
  'Figma': { path: 'M15 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-3-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 10c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm6 1c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM6 13c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z' },
  'Framer': { path: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.31L19.53 8 12 11.69 4.47 8 12 4.31zM4 16.24V9.33l7.5 4.22V21l-7.5-4.22v-.01z' },
  'Dribbble': { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.34 14.89c-1.28.6-2.7.93-4.2.93-3.07 0-5.87-1.3-7.79-3.41.22.03.45.04.68.04 1.8 0 3.51-.51 4.97-1.42-1.3-.23-2.42-1.04-2.8-2.22.42.08.85.11 1.28.11.39 0 .78-.05 1.15-.15-1.5-.3-2.63-1.65-2.63-3.26V9.8c.45.25.96.4 1.5.42C6.47 9.8 5.75 8.35 6.13 6.9c1.64 2.01 4.07 3.33 6.8 3.45-.11-.43-.17-.88-.17-1.35 0-3.28 2.67-5.95 5.95-5.95.83 0 1.62.35 2.22.92.65-.13 1.27-.37 1.84-.7-.22.68-.68 1.25-1.27 1.61.58-.07 1.13-.22 1.64-.45-.38.57-.86 1.06-1.41 1.48z' },
  'Tailwind CSS': { path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  'ShadCN UI': { path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  'default': { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 12.17l7.59-7.59L19 6l-9 9z' },
};

function TechnologiesContent({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const technologiesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users', userId, 'technologies') : null, [userId, firestore]);
    const { data: technologies, isLoading } = useCollection(technologiesCollectionRef);

    if (isLoading) {
        return (
            <div className="mt-12">
                <Skeleton key="loader" className="h-24 w-full" />
            </div>
        );
    }
    
    if (!technologies || technologies.length === 0) {
        return <p className="mt-8 text-center text-muted-foreground">No technologies to display yet. Add some in the admin panel!</p>;
    }

    const logoItems = technologies.map(tech => {
        const icon = iconMap[tech.name] || iconMap['default'];
        return {
            node: (
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-24 h-24 p-4 bg-secondary rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-1 cursor-pointer">
                         <SvgIcon path={icon.path} className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold mt-2 text-foreground">{tech.name}</h3>
                </div>
            )
        };
    });

    return (
        <div className="mt-12">
            <LogoLoop
                logos={logoItems}
                speed={80}
                direction="left"
                logoHeight={140} 
                gap={48}
                pauseOnHover={true}
            />
        </div>
    );
}


export function TechnologiesSection() {
    const userIdToShow = PORTFOLIO_USER_ID;

    return (
        <section id="technologies" className="animate-in fade-in duration-500" style={{'--index': 2} as React.CSSProperties}>
          <SectionHeading>Technologies Used__</SectionHeading>
          {userIdToShow ? (
            <TechnologiesContent userId={userIdToShow} />
          ) : (
             <p className="mt-8 text-center text-red-500">
                Please configure a user ID in `src/lib/config.ts` to display technologies.
             </p>
          )}
        </section>
      );
}
