
'use client';
import Image from 'next/image';
import { useState } from 'react';
import { SectionHeading } from './section-heading';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { ExternalLink, X, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { PORTFOLIO_USER_ID } from '@/lib/config';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Define the Project type based on what's fetched from Firestore
type Project = {
  id: string;
  title: string;
  description: string;
  link?: string;
  // Fields for modal - can be extended in backend.json if needed
  details?: string;
  role?: string;
  outcome?: string;
  imageId?: string; // e.g., for a placeholder image
};

function ProjectModal({ project, isOpen, onOpenChange }: { project: Project | null; isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  if (!project) return null;
  const projectImage = PlaceHolderImages.find(p => p.id === project.imageId);

  const outcomeItems = project.outcome?.split('\n').filter(p => p.trim() !== '' && p.trim() !== '-');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl text-primary">{project.title}</DialogTitle>
          <DialogDescription>{project.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
            {projectImage && (
                <div className="w-full aspect-video relative rounded-lg overflow-hidden">
                    <Image src={projectImage.imageUrl} alt={project.title} fill className="object-cover" />
                </div>
            )}
            {project.details && (
                <div>
                    <h4 className="font-semibold text-lg text-accent">About the project</h4>
                    <p className="text-muted-foreground mt-1">{project.details}</p>
                </div>
            )}
            {project.role && (
                <div>
                    <h4 className="font-semibold text-lg text-accent">My Role</h4>
                    <p className="text-muted-foreground mt-1">{project.role}</p>
                </div>
            )}
            {outcomeItems && outcomeItems.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-lg text-accent">Key Features & Contributions</h4>
                    <ul className="text-muted-foreground space-y-2 mt-2 list-disc pl-5">
                        {outcomeItems.map((item, index) => (
                           <li key={index}>{item.replace(/^- /, '')}</li>
                        ))}
                    </ul>
                </div>
            )}
            {project.link && project.link !== '#' && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline pt-2">
                    View Project <ExternalLink className="h-4 w-4" />
                </a>
            )}
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}


function ProjectCard({ project, onSelectProject }: { project: Project; onSelectProject: (project: Project) => void; }) {
  const projectImage = PlaceHolderImages.find(p => p.id === project.imageId);
  return (
    <Card 
      onClick={() => onSelectProject(project)}
      className="flex h-full flex-col overflow-hidden bg-card/80 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 cursor-pointer group"
    >
      {projectImage && (
        <div className="aspect-video relative w-full overflow-hidden">
            <Image src={projectImage.imageUrl} alt={project.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-accent">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{project.description}</CardDescription>
      </CardContent>
      <CardFooter>
          <p className="text-sm text-primary">View Details &rarr;</p>
      </CardFooter>
    </Card>
  );
}


function ProjectsContent({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const projectsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users', userId, 'projects') : null, [userId, firestore]);
    const { data: projects, isLoading } = useCollection<Project>(projectsCollectionRef);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
    };
    
    const handleCloseModal = () => {
        setSelectedProject(null);
    };

    if (isLoading) {
        return (
             <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-96 w-full" />
                ))}
            </div>
        );
    }
    
    if (!projects || projects.length === 0) {
        return <p className="mt-8 text-center text-muted-foreground">No projects to display yet. Add some in the admin panel!</p>;
    }

    return (
        <>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} onSelectProject={handleSelectProject} />
                ))}
            </div>
            <ProjectModal project={selectedProject} isOpen={!!selectedProject} onOpenChange={handleCloseModal} />
        </>
    );
}

export function ProjectsSection() {
  const userIdToShow = PORTFOLIO_USER_ID;
  return (
    <section id="projects" className="animate-in fade-in duration-500" style={{'--index': 4} as React.CSSProperties}>
      <SectionHeading>Projects__</SectionHeading>
      {userIdToShow ? (
        <ProjectsContent userId={userIdToShow} />
      ) : (
        <p className="mt-8 text-center text-red-500">
            Please configure a user ID in `src/lib/config.ts` to display projects.
        </p>
      )}
    </section>
  );
}
