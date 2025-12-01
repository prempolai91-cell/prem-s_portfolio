
'use client';
import { SectionHeading } from './section-heading';
import { Card, CardContent, CardHeader } from './ui/card';
import { Progress } from './ui/progress';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { Brush, Code, Bot, MonitorSmartphone, PenTool, Blend, Video, Star } from 'lucide-react';
import type { ComponentType } from 'react';
import { PORTFOLIO_USER_ID } from '@/lib/config';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// A map to associate skill names with icons.
const iconMap: { [key: string]: ComponentType<{ className?: string }> } = {
  'Graphics Designing': Brush,
  'Web Developer': Code,
  'UI/UX Design': PenTool,
  'Web Design': MonitorSmartphone,
  'Branding': Blend,
  'Video Editing': Video,
  'Full - Stack Developing': Code,
  'default': Star,
};

type Skill = {
    id: string;
    name: string;
    percentage: number;
}


function SkillCard({ name, percentage }: { name: string, percentage: number }) {
  // Find the icon by name, or use the default icon.
  const Icon = iconMap[name] || iconMap['default'];
  return (
    <Card className="bg-card/80 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 p-4 flex flex-col justify-between">
        <CardHeader className="items-center p-2">
            <div className="p-4 bg-secondary rounded-full">
                <Icon className="h-8 w-8 text-primary" />
            </div>
        </CardHeader>
        <CardContent className="p-2 flex-grow flex flex-col justify-center">
            <h3 className="text-lg font-semibold">{name}</h3>
            <div className="flex items-center gap-2 mt-2">
                 <Progress value={percentage} className="h-2 w-full" />
                 <span className="text-sm font-medium text-primary">{percentage}%</span>
            </div>
        </CardContent>
    </Card>
  );
}

function SkillsContent({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const skillsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users', userId, 'skills') : null, [userId, firestore]);
    const { data: skills, isLoading } = useCollection<Skill>(skillsCollectionRef);

    if (isLoading) {
        return (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        );
    }
    
    if (!skills || skills.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {skills.map((skill) => (
              <SkillCard key={skill.id} name={skill.name} percentage={skill.percentage} />
            ))}
        </div>
    );
}


export function SkillsSection() {
    const userIdToShow = PORTFOLIO_USER_ID;
    const skillsImage = PlaceHolderImages.find(p => p.id === 'skills-ai');

    return (
        <section id="skills" className="animate-in fade-in duration-500" style={{'--index': 2} as React.CSSProperties}>
          <SectionHeading>Skills__</SectionHeading>
          
          {userIdToShow ? (
            <SkillsContent userId={userIdToShow} />
          ) : (
             <p className="mt-8 text-center text-red-500">
                Please configure a user ID in `src/lib/config.ts` to display skills.
             </p>
          )}

          {skillsImage && (
            <div className="mt-12 flex justify-center">
                <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl shadow-primary/20">
                    <Image 
                        src={skillsImage.imageUrl} 
                        alt="AI representation of skills" 
                        fill
                        className="object-cover"
                        data-ai-hint={skillsImage.imageHint}
                    />
                </div>
            </div>
          )}
        </section>
      );
}
