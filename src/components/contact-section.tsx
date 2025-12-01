
import { SectionHeading } from './section-heading';
import { ContactForm } from './contact-form';
import { Mail, Linkedin, Github, Phone, Instagram, Facebook } from 'lucide-react';

export function ContactSection() {
  const contactLinks = [
    { icon: Mail, href: 'mailto:prempolai91@gmail.com', label: 'Email', color: 'hover:text-blue-400' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-purple-400' },
  ];

  return (
    <section id="contact" className="animate-in fade-in duration-500" style={{'--index': 5} as React.CSSProperties}>
      <SectionHeading>Get in Touch__</SectionHeading>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="text-lg text-muted-foreground">
            I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of an amazing team. Feel free to reach out.
          </p>
          <div className="mt-8">
             <div className="flex space-x-6">
                {contactLinks.map(({ icon: Icon, href, label, color }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`text-muted-foreground transition-colors ${color}`}>
                    <Icon className="h-8 w-8" />
                    </a>
                ))}
            </div>
            <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-6 w-6" />
                    <a href="tel:7870391315" className="text-lg hover:text-primary transition-colors">7870391315</a>
                </div>
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Linkedin className="h-6 w-6" />
                    <a href="https://www.linkedin.com/in/prem-polai" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-primary transition-colors">Prem Polai</a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Instagram className="h-6 w-6" />
                    <a href="https://www.instagram.com/2819.prem" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-primary transition-colors">2819.prem</a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Facebook className="h-6 w-6" />
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-primary transition-colors">Prem Polai</a>
                </div>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
