
'use client';

import Image from 'next/image';
import { SectionHeading } from './section-heading';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { PORTFOLIO_USER_ID } from '@/lib/config';
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { ExternalLink, Award } from 'lucide-react';

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date: string; // Assuming date is stored as a string e.g., 'YYYY-MM-DD'
  link?: string;
  imageUrl?: string;
};

function CertificateCard({ certificate }: { certificate: Certificate }) {
    const displayDate = new Date(certificate.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    const cardContent = (
      <Card className="flex h-full flex-col overflow-hidden bg-card/80 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 group">
        {certificate.imageUrl && (
            <div className="aspect-video relative w-full overflow-hidden">
                <Image 
                    src={certificate.imageUrl} 
                    alt={certificate.title} 
                    fill 
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
        )}
        <CardHeader>
            <CardTitle>{certificate.title}</CardTitle>
            <CardDescription className="pt-1">
                {certificate.issuer} &bull; {displayDate}
            </CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto">
            {certificate.link && certificate.link !== '#' ? (
                 <p className="text-sm text-primary group-hover:underline">
                    View Credential <ExternalLink className="inline h-4 w-4 ml-1" />
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">Credential not available</p>
            )}
        </CardFooter>
      </Card>
    );

    if (certificate.link && certificate.link !== '#') {
        return (
            <a href={certificate.link} target="_blank" rel="noopener noreferrer" className="block h-full">
                {cardContent}
            </a>
        )
    }

    return cardContent;
}

function CertificatesContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const certificatesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users', userId, 'certificates'), orderBy('date', 'desc'));
  }, [userId, firestore]);

  const { data: certificates, isLoading } = useCollection<Certificate>(certificatesCollectionRef);
  
  if (isLoading) {
    return (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }
  
  if (!certificates || certificates.length === 0) {
    return (
        <div className="mt-8 text-center">
            <p className="text-muted-foreground">My certificates will be displayed here. Please add them in the admin panel.</p>
        </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
        ))}
    </div>
  );
}

export function CertificatesSection() {
  const userIdToShow = PORTFOLIO_USER_ID;

  return (
    <section id="certificates" className="animate-in fade-in duration-500">
      <SectionHeading>Certificates__</SectionHeading>
        {userIdToShow ? (
            <CertificatesContent userId={userIdToShow} />
        ) : (
            <p className="mt-8 text-center text-red-500">
            Please configure a user ID in `src/lib/config.ts` to display certificates.
            </p>
        )}
    </section>
  );
}
