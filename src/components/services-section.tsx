import { services, type Service } from '@/app/data';
import { SectionHeading } from './section-heading';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <Card className="bg-card/80 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2">
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-secondary rounded-full">
                <Icon className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-xl">{service.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{service.description}</p>
        </CardContent>
    </Card>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className="animate-in fade-in duration-500" style={{'--index': 3} as React.CSSProperties}>
      <SectionHeading>Services__</SectionHeading>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </div>
    </section>
  );
}
