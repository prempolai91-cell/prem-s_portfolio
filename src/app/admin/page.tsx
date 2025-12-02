'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, FormEvent } from 'react';
import { doc, collection, writeBatch, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Save, Inbox, UserCircle, Image as ImageIcon, Briefcase, Star, Cpu, LogOut, RefreshCcw, Award, ArrowLeft, Edit, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { PORTFOLIO_USER_ID } from '@/lib/config';
import { Skeleton } from '@/components/ui/skeleton';
import { resetPassword, getFriendlyAuthErrorMessage } from '@/firebase/auth/auth-client';

// Types for our data structures
type UserProfile = {
  id?: string;
  name?: string;
  title?: string;
  aboutMe?: string;
  bio?: string;
  profilePhotoUrl?: string;
  educationPhotoUrl?: string;
  fullName?: string;
  contactEmail?: string;
};

type Skill = {
  id: string;
  name: string;
  userProfileId: string;
  percentage: number;
};

type Technology = {
  id: string;
  name: string;
  userProfileId: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  userProfileId: string;
  details?: string;
  role?: string;
  outcome?: string;
  imageId?: string;
};

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
  userProfileId: string;
  imageUrl?: string;
};


function ProfileEditor({ profile, setProfile }: { profile: UserProfile, setProfile: (p: UserProfile) => void }) {
  if (!profile) return null;

  const handleFieldChange = (field: keyof Omit<UserProfile, 'id'>, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserCircle /> Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="profile-photo-url">Profile Picture URL</Label>
                <Input 
                    id="profile-photo-url" 
                    type="text" 
                    placeholder="https://example.com/your-photo.jpg" 
                    value={profile.profilePhotoUrl || ''} 
                    onChange={(e) => handleFieldChange('profilePhotoUrl', e.target.value)} 
                />
                {profile.profilePhotoUrl && (
                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <Image src={profile.profilePhotoUrl} alt="Profile Preview" width={80} height={80} className="rounded-full object-cover aspect-square" />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="education-photo-url">Education Image URL</Label>
                <Input 
                    id="education-photo-url" 
                    type="text" 
                    placeholder="https://example.com/education-photo.jpg" 
                    value={profile.educationPhotoUrl || ''} 
                    onChange={(e) => handleFieldChange('educationPhotoUrl', e.target.value)} 
                />
                {profile.educationPhotoUrl && (
                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <Image src={profile.educationPhotoUrl} alt="Education Preview" width={80} height={80} className="rounded-lg object-cover aspect-square" />
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={profile.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={profile.title || ''} onChange={(e) => handleFieldChange('title', e.target.value)} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="aboutMe">About Me</Label>
            <Textarea
                id="aboutMe"
                value={profile.aboutMe || ''}
                onChange={(e) => handleFieldChange('aboutMe', e.target.value)}
                placeholder="Write your 'About Me' section here..."
                rows={6}
            />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">My Education</Label>
          <Textarea 
            id="bio" 
            value={profile.bio || ''} 
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            placeholder="Write your education details here..."
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SkillsEditor({ skills, setSkills }: { skills: (Partial<Skill> & { _deleted?: boolean })[], setSkills: (s: (Partial<Skill> & { _deleted?: boolean })[]) => void }) {
    const [newSkill, setNewSkill] = useState({ name: '', percentage: 0 });

    const handleAddSkill = () => {
        if (!newSkill.name || !newSkill.name.trim()) return;
        const skillToAdd: Partial<Skill> = {
            id: `new-${Date.now()}`, // Temporary ID
            name: newSkill.name,
            percentage: newSkill.percentage,
        };
        setSkills([...skills, skillToAdd]);
        setNewSkill({ name: '', percentage: 0 });
    };

    const handleDeleteSkill = (skillId: string) => {
        setSkills(skills.map(s => s.id === skillId ? { ...s, _deleted: true } : s));
    };
    
    const handleUpdateSkill = (skillId: string, field: 'name' | 'percentage', value: string | number) => {
        setSkills(skills.map(s => s.id === skillId ? { ...s, [field]: value } : s));
    };
    
    const visibleSkills = skills.filter(s => !s._deleted);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star /> Edit Skills</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-4">
                    {visibleSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between gap-2 p-2 bg-secondary rounded-md">
                            <Input 
                                value={skill.name || ''}
                                onChange={(e) => handleUpdateSkill(skill.id!, 'name', e.target.value)} 
                                className="bg-transparent border-none focus-visible:ring-0 flex-grow" 
                                placeholder="Skill Name"
                            />
                             <Input 
                                type="number"
                                value={skill.percentage || 0}
                                onChange={(e) => handleUpdateSkill(skill.id!, 'percentage', parseInt(e.target.value, 10) || 0)} 
                                className="bg-transparent border-none focus-visible:ring-0 w-20"
                                placeholder="%"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSkill(skill.id!)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input 
                        placeholder="New Skill Name" 
                        value={newSkill.name} 
                        onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                    />
                     <Input 
                        type="number"
                        placeholder="%" 
                        value={newSkill.percentage || ''} 
                        onChange={(e) => setNewSkill({...newSkill, percentage: parseInt(e.target.value, 10) || 0})}
                        className="w-24"
                    />
                    <Button onClick={handleAddSkill}>Add Skill</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function TechnologiesEditor({ technologies, setTechnologies }: { technologies: (Partial<Technology> & { _deleted?: boolean })[], setTechnologies: (s: (Partial<Technology> & { _deleted?: boolean })[]) => void }) {
    const [newTechnologyName, setNewTechnologyName] = useState('');

    const handleAddTechnology = () => {
        if (!newTechnologyName.trim()) return;
        const newTechnology: Partial<Technology> = {
            id: `new-${Date.now()}`, // Temporary ID
            name: newTechnologyName,
        };
        setTechnologies([...technologies, newTechnology]);
        setNewTechnologyName('');
    };

    const handleDeleteTechnology = (techId: string) => {
        setTechnologies(technologies.map(s => s.id === techId ? { ...s, _deleted: true } : s));
    };
    
    const handleUpdateTechnology = (techId: string, newName: string) => {
        setTechnologies(technologies.map(s => s.id === techId ? { ...s, name: newName } : s));
    };
    
    const visibleTechnologies = technologies.filter(s => !s._deleted);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cpu /> Edit Technologies</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-4">
                    {visibleTechnologies.map((tech) => (
                        <div key={tech.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                            <Input value={tech.name || ''} onChange={(e) => handleUpdateTechnology(tech.id!, e.target.value)} className="bg-transparent border-none focus-visible:ring-0" />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTechnology(tech.id!)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input 
                        placeholder="New Technology Name" 
                        value={newTechnologyName}
                        onChange={(e) => setNewTechnologyName(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTechnology(); } }}
                    />
                    <Button onClick={handleAddTechnology}>Add Technology</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ProjectEditor({ projects, setProjects }: { projects: (Partial<Project> & { _deleted?: boolean })[], setProjects: (p: (Partial<Project> & { _deleted?: boolean })[]) => void }) {
    const [newProject, setNewProject] = useState({ title: '', description: '', link: '' });

    const handleAddProject = () => {
        if (!newProject.title.trim()) return;
        const projectToAdd: Partial<Project> = {
            id: `new-${Date.now()}`, // Temporary ID
            ...newProject,
        };
        setProjects([...projects, projectToAdd]);
        setNewProject({ title: '', description: '', link: '' });
    };

    const handleDeleteProject = (projectId: string) => {
        setProjects(projects.map(p => p.id === projectId ? { ...p, _deleted: true } : p));
    };
    
    const handleUpdateProject = (projectId: string, field: keyof Omit<Project, 'id' | 'userProfileId'>, value: string) => {
        setProjects(projects.map(p => p.id === projectId ? { ...p, [field]: value } : p));
    };

    const visibleProjects = projects.filter(p => !p._deleted);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase /> Edit Projects</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-4">
                    {visibleProjects.map((project) => (
                        <div key={project.id} className="p-4 bg-secondary/50 rounded-md space-y-3">
                           <div className="flex justify-between items-start">
                                <div className="flex-grow space-y-2">
                                     <div className="space-y-1">
                                        <Label htmlFor={`proj-title-${project.id}`}>Title</Label>
                                        <Input id={`proj-title-${project.id}`} value={project.title || ''} onChange={(e) => handleUpdateProject(project.id!, 'title', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`proj-desc-${project.id}`}>Description</Label>
                                        <Textarea id={`proj-desc-${project.id}`} value={project.description || ''} onChange={(e) => handleUpdateProject(project.id!, 'description', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`proj-link-${project.id}`}>Link</Label>
                                        <Input id={`proj-link-${project.id}`} value={project.link || ''} onChange={(e) => handleUpdateProject(project.id!, 'link', e.target.value)} />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id!)} className="ml-2 flex-shrink-0">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Add New Project</h3>
                     <div className="space-y-1">
                        <Label htmlFor="new-proj-title">Title</Label>
                        <Input id="new-proj-title" placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="new-proj-desc">Description</Label>
                        <Textarea id="new-proj-desc" placeholder="Project Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="new-proj-link">Link</Label>
                        <Input id="new-proj-link" placeholder="Project Link" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} />
                    </div>
                    <Button onClick={handleAddProject} className="w-full">Add Project</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function CertificatesEditor({ certificates, setCertificates }: { certificates: (Partial<Certificate> & { _deleted?: boolean })[], setCertificates: (p: (Partial<Certificate> & { _deleted?: boolean })[]) => void }) {
    const [newCertificate, setNewCertificate] = useState({ title: '', issuer: '', date: '', link: '', imageUrl: '' });

    const handleAddCertificate = () => {
        if (!newCertificate.title.trim() || !newCertificate.issuer.trim() || !newCertificate.date.trim()) return;
        const certificateToAdd: Partial<Certificate> = {
            id: `new-${Date.now()}`, // Temporary ID
            ...newCertificate,
        };
        setCertificates([...certificates, certificateToAdd]);
        setNewCertificate({ title: '', issuer: '', date: '', link: '', imageUrl: '' });
    };

    const handleDeleteCertificate = (certId: string) => {
        setCertificates(certificates.map(c => c.id === certId ? { ...c, _deleted: true } : c));
    };

    const handleUpdateCertificate = (certId: string, field: keyof Omit<Certificate, 'id' | 'userProfileId'>, value: string) => {
        setCertificates(certificates.map(c => c.id === certId ? { ...c, [field]: value } : c));
    };

    const visibleCertificates = certificates.filter(c => !c._deleted);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award /> Edit Certificates</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-4">
                    {visibleCertificates.map((cert) => (
                        <div key={cert.id} className="p-4 bg-secondary/50 rounded-md space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow space-y-2">
                                     <div className="space-y-1">
                                        <Label htmlFor={`cert-image-url-${cert.id}`}>Image URL (Optional)</Label>
                                        <Input id={`cert-image-url-${cert.id}`} value={cert.imageUrl || ''} onChange={(e) => handleUpdateCertificate(cert.id!, 'imageUrl', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor={`cert-title-${cert.id}`}>Title</Label>
                                            <Input id={`cert-title-${cert.id}`} value={cert.title || ''} onChange={(e) => handleUpdateCertificate(cert.id!, 'title', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`cert-issuer-${cert.id}`}>Issuer</Label>
                                            <Input id={`cert-issuer-${cert.id}`} value={cert.issuer || ''} onChange={(e) => handleUpdateCertificate(cert.id!, 'issuer', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor={`cert-date-${cert.id}`}>Date</Label>
                                            <Input id={`cert-date-${cert.id}`} type="date" value={cert.date || ''} onChange={(e) => handleUpdateCertificate(cert.id!, 'date', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`cert-link-${cert.id}`}>Link (Optional)</Label>
                                            <Input id={`cert-link-${cert.id}`} value={cert.link || ''} onChange={(e) => handleUpdateCertificate(cert.id!, 'link', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCertificate(cert.id!)} className="ml-2 flex-shrink-0">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Add New Certificate</h3>
                    <div className="space-y-1">
                        <Label htmlFor="new-cert-image-url">Image URL (Optional)</Label>
                        <Input id="new-cert-image-url" placeholder="https://example.com/cert.png" value={newCertificate.imageUrl} onChange={(e) => setNewCertificate({ ...newCertificate, imageUrl: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="new-cert-title">Title</Label>
                            <Input id="new-cert-title" placeholder="Certificate Title" value={newCertificate.title} onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="new-cert-issuer">Issuer</Label>
                            <Input id="new-cert-issuer" placeholder="Issuing Organization" value={newCertificate.issuer} onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="new-cert-date">Date</Label>
                            <Input id="new-cert-date" type="date" value={newCertificate.date} onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="new-cert-link">Link (Optional)</Label>
                            <Input id="new-cert-link" placeholder="Credential Link" value={newCertificate.link} onChange={(e) => setNewCertificate({ ...newCertificate, link: e.target.value })} />
                        </div>
                    </div>
                    <Button onClick={handleAddCertificate} className="w-full">Add Certificate</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AccountSettings() {
    const { user } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordReset = async () => {
        if (!auth || !user?.email) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: "Could not send password reset email. User or auth service not available.",
            });
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(auth, user.email);
            toast({
                variant: 'success',
                title: 'Password Reset Email Sent',
                description: `An email has been sent to ${user.email} with instructions to reset your password.`,
            });
        } catch (e: any) {
            const errorMessage = getFriendlyAuthErrorMessage(e);
            toast({
                variant: 'destructive',
                title: 'Reset Failed',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Account Settings</CardTitle>
                <CardDescription>Manage your administrator account settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg">
                        <div className="mb-2 sm:mb-0">
                           <p className="font-medium text-foreground">Administrator Email</p>
                           <p className="text-muted-foreground">{user?.email || 'No email found'}</p>
                        </div>
                        <Button onClick={handlePasswordReset} disabled={isLoading || !user?.email}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">Clicking "Reset Password" will send a link to your email to set a new password.</p>
            </CardFooter>
        </Card>
    );
}


const defaultProjects: Omit<Project, 'id' | 'userProfileId'>[] = [
    {
        title: 'Kismat.AI',
        description: 'An AI-powered platform, leveraging xAI for unfiltered knowledge, real-time data integration, and advanced image generation.',
        link: '#',
        imageId: 'project-kismat-ai',
        role: 'Full-Stack Developer & AI Engineer',
        details: 'Kismat.AI is a cutting-edge conversational AI platform designed to provide users with direct, unfiltered information and creative inspiration. It integrates with real-time data sources and offers powerful image generation capabilities, all within an intuitive and responsive interface.',
        outcome: `- Designed and implemented a responsive and modern UI with React and Next.js.
- Integrated xAI's language models to power the conversational agent.
- Engineered the back-end logic with Genkit to handle real-time data fetching and API integration.
- Developed the image generation feature, allowing users to create visuals from text prompts.`
    }
];

const defaultTechnologies: Omit<Technology, 'id' | 'userProfileId'>[] = [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'Genkit' },
    { name: 'Firebase' },
    { name: 'Figma' },
    { name: 'Framer' },
    { name: 'Dribbble' },
    { name: 'Tailwind CSS' },
    { name: 'ShadCN UI' },
]

const defaultSkills: Omit<Skill, 'id' | 'userProfileId'>[] = [
    { name: 'Web Designing', percentage: 86 },
    { name: 'Video Editing', percentage: 82 },
    { name: 'Graphics Designing', percentage: 90 },
    { name: 'Full - Stack Developing', percentage: 80 }
]

const defaultCertificates: Omit<Certificate, 'id' | 'userProfileId'>[] = [
    { title: 'Google Advanced Data Analytics', issuer: 'Google', date: '2023-11-01', link: '#', imageUrl: "https://i.postimg.cc/nLR3MCzn/Screenshot-2025-11-30-211737.png" }
];


export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const publicUserId = PORTFOLIO_USER_ID;

  // Firestore refs
  const userProfileRef = useMemoFirebase(() => publicUserId && firestore ? doc(firestore, 'users', publicUserId) : null, [publicUserId, firestore]);
  const skillsCollectionRef = useMemoFirebase(() => publicUserId && firestore ? collection(firestore, 'users', publicUserId, 'skills') : null, [publicUserId, firestore]);
  const technologiesCollectionRef = useMemoFirebase(() => publicUserId && firestore ? collection(firestore, 'users', publicUserId, 'technologies') : null, [publicUserId, firestore]);
  const projectsCollectionRef = useMemoFirebase(() => publicUserId && firestore ? collection(firestore, 'users', publicUserId, 'projects') : null, [publicUserId, firestore]);
  const certificatesCollectionRef = useMemoFirebase(() => publicUserId && firestore ? collection(firestore, 'users', publicUserId, 'certificates') : null, [publicUserId, firestore]);

  // Original data
  const { data: originalProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: originalSkills, isLoading: areSkillsLoading } = useCollection<Skill>(skillsCollectionRef);
  const { data: originalTechnologies, isLoading: areTechnologiesLoading } = useCollection<Technology>(technologiesCollectionRef);
  const { data: originalProjects, isLoading: areProjectsLoading } = useCollection<Project>(projectsCollectionRef);
  const { data: originalCertificates, isLoading: areCertificatesLoading } = useCollection<Certificate>(certificatesCollectionRef);
  
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'edit', 'messages', 'account'

  // Local editing state
  const [profile, setProfile] = useState<UserProfile>({});
  const [skills, setSkills] = useState<(Partial<Skill> & { _deleted?: boolean })[]>([]);
  const [technologies, setTechnologies] = useState<(Partial<Technology> & { _deleted?: boolean })[]>([]);
  const [projects, setProjects] = useState<(Partial<Project> & { _deleted?: boolean })[]>([]);
  const [certificates, setCertificates] = useState<(Partial<Certificate> & { _deleted?: boolean })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const isLoading = isUserLoading || isProfileLoading || areSkillsLoading || areTechnologiesLoading || areProjectsLoading || areCertificatesLoading;
  
  const initializeData = useCallback(() => {
    let initialProfile = originalProfile;
    if (initialProfile) {
        if (!initialProfile.aboutMe) {
            initialProfile.aboutMe = `Hello, I am a Graphic Designer and Web Developer dedicated to building digital experiences that are both visually compelling and technically flawless. Intuitive user interfaces (UI/UX), and impactful marketing collateral.

- Strategic Design : Creating strong visual narratives, logos, and digital assets that clearly communicate a brand's message.
- UI/UX Experience : Mapping out intuitive user flows and wireframes for maximum usability.
- Full-Stack Development : Bringing designs to life with clean, semantic, and responsive code, focusing on performance and accessibility.`;
        }
        if (!initialProfile.bio) {
             initialProfile.bio = `I am Engineering student from The Nalanda Institute Of Technology, Bhubaneswar from 2nd year batch pursing my b-tech course with computer science branch and little bit interesting about design, development, and innovation.`;
        }
    }
    setProfile(initialProfile || {});

    if (originalSkills) {
        setSkills(originalSkills.length > 0 ? originalSkills : defaultSkills.map(s => ({...s, id: `new-${Date.now()}-${Math.random()}`})));
    }
    
    if (originalTechnologies) {
        setTechnologies(originalTechnologies.length > 0 ? originalTechnologies : defaultTechnologies.map(t => ({...t, id: `new-${Date.now()}-${Math.random()}`})));
    }

    if (originalProjects) {
        setProjects(originalProjects.length > 0 ? originalProjects : defaultProjects.map(p => ({...p, id: `new-${Date.now()}-${Math.random()}`})));
    }
    
    if (originalCertificates) {
        setCertificates(originalCertificates.length > 0 ? originalCertificates : defaultCertificates.map(p => ({...p, id: `new-${Date.now()}-${Math.random()}`})));
    }

    setIsDataInitialized(true);
  }, [originalProfile, originalSkills, originalTechnologies, originalProjects, originalCertificates]);

  useEffect(() => {
    if (!isLoading && !isDataInitialized) {
        initializeData();
    }
  }, [isLoading, isDataInitialized, initializeData]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const resetChanges = useCallback(() => {
    initializeData();
    toast({
      variant: 'default',
      title: 'Changes Discarded',
      description: 'Your edits have been reset to the last saved state.',
    });
  }, [toast, initializeData]);

  const handleSaveAll = useCallback(async () => {
    if (!firestore || !publicUserId) {
      toast({ variant: "destructive", title: "Error", description: "Cannot save changes. Database not available." });
      return;
    }
    setIsSaving(true);
  
    try {
      const batch = writeBatch(firestore);
  
      if (profile && Object.keys(profile).length > 0) {
        const profileRef = doc(firestore, 'users', publicUserId);
        const { id: profileId, ...profileData } = profile;
        batch.set(profileRef, profileData, { merge: true });
      }
  
      const collectionsToUpdate = [
          { ref: collection(firestore, 'users', publicUserId, 'skills'), items: skills },
          { ref: collection(firestore, 'users', publicUserId, 'technologies'), items: technologies },
          { ref: collection(firestore, 'users', publicUserId, 'projects'), items: projects },
          { ref: collection(firestore, 'users', publicUserId, 'certificates'), items: certificates },
      ];

      collectionsToUpdate.forEach(({ ref, items }) => {
          items.forEach(item => {
            const { _deleted, id, ...itemData } = item;
            if (!id) return;
            const isNew = id.startsWith('new-');
            const docRef = isNew ? doc(ref) : doc(ref, id);

            if (_deleted) {
              if (!isNew) batch.delete(docRef);
            } else {
              batch.set(docRef, { ...itemData, userProfileId: publicUserId }, { merge: true });
            }
          });
      });
  
      await batch.commit();
  
      toast({
        variant: "success",
        title: "Changes Successfully Saved",
        description: "Your portfolio has been updated.",
      });
  
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "An unexpected error occurred. Your changes were not saved.",
      });
    } finally {
      setIsSaving(false);
      setIsDataInitialized(false); // Re-initialize data to get fresh state from DB
    }
  }, [firestore, publicUserId, toast, profile, skills, technologies, projects, certificates]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (isLoading || !isDataInitialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'messages':
        return <MessagesPage />;
      case 'account':
        return <AccountSettings />;
      case 'edit':
        return (
          <>
            <div className="grid grid-cols-1 gap-10">
                <ProfileEditor profile={profile} setProfile={setProfile} />
                <SkillsEditor skills={skills} setSkills={setSkills} />
                <TechnologiesEditor technologies={technologies} setTechnologies={setTechnologies} />
                <ProjectEditor projects={projects} setProjects={setProjects} />
                <CertificatesEditor certificates={certificates} setCertificates={setCertificates} />
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border z-50">
                <div className="container mx-auto max-w-5xl flex justify-end gap-4">
                    <Button size="lg" variant="outline" onClick={resetChanges} disabled={isSaving}>
                      <RefreshCcw />
                      Reset
                    </Button>
                    <Button size="lg" onClick={handleSaveAll} disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                      {isSaving ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </div>
            </div>
          </>
        );
      case 'dashboard':
      default:
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Edit /> Manage Content</CardTitle>
                  <CardDescription>Edit your profile, skills, projects, and more.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveView('edit')} className="w-full">
                    Go to Editor
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Inbox /> View Messages</CardTitle>
                  <CardDescription>See all the messages sent from your contact form.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button onClick={() => setActiveView('messages')} className="w-full">
                    View Messages
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserCircle /> Profile Settings</CardTitle>
                  <CardDescription>Manage your administrator account.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button onClick={() => setActiveView('account')} className="w-full" variant="outline">
                    Account Details
                  </Button>
                </CardContent>
              </Card>
            </div>
        );
    }
  }


  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl py-12 px-4 sm:py-16 lg:px-8 pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            {activeView !== 'dashboard' && (
              <Button onClick={() => setActiveView('dashboard')} variant="outline" size="icon">
                  <ArrowLeft />
              </Button>
            )}
            {profile?.profilePhotoUrl && (
              <Image src={profile.profilePhotoUrl} alt="Admin" width={64} height={64} className="rounded-full object-cover" />
            )}
            <div>
              <h1 className="text-4xl font-bold text-primary tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {profile?.name || 'Admin'}!</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleSignOut}><LogOut /> Sign Out</Button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}


function MessagesPage() {
  const firestore = useFirestore();
  
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contactMessages'), orderBy('sentAt', 'desc'));
  }, [firestore]);

  const { data: messages, isLoading } = useCollection<ContactMessage>(messagesQuery);

  if (isLoading) {
    return (
      <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-10 gap-4">
            <div>
                <h1 className="text-4xl font-bold text-primary tracking-tight">Contact Messages</h1>
                <p className="text-muted-foreground mt-1">Here are the messages submitted from your portfolio.</p>
            </div>
        </div>

        {messages && messages.length > 0 ? (
            <div className="space-y-6">
                {messages.map(msg => <MessageCard key={msg.id} message={msg} />)}
            </div>
        ) : (
            <div className="text-center py-16 px-4 border-2 border-dashed border-border rounded-lg">
                <h3 className="text-xl font-semibold text-foreground">No Messages Yet</h3>
                <p className="text-muted-foreground mt-2">When someone contacts you through your portfolio, their message will appear here.</p>
            </div>
        )}
    </div>
  );
}

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: import('firebase/firestore').Timestamp | null;
};

function MessageCard({ message }: { message: ContactMessage }) {
    const sentDate = message.sentAt ? message.sentAt.toDate() : new Date();

    return (
        <Card className="bg-card/50">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{message.name}</CardTitle>
                        <CardDescription>{message.email}</CardDescription>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {new Date(sentDate).toLocaleDateString()}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-foreground/90 whitespace-pre-wrap">{message.message}</p>
            </CardContent>
        </Card>
    )
}
