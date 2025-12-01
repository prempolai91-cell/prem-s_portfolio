import { Brush, MonitorSmartphone, PenTool, Blend, Code } from 'lucide-react';
import type { ComponentType } from 'react';

// This data is now managed in the Firestore database.
// The components will fetch the data directly.
// This file can be repurposed if no longer needed.


export type Service = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export const services: Service[] = [
    { title: 'UI/UX Design', description: 'Modern, user-centered interface designs.', icon: PenTool },
    { title: 'Web Design', description: 'Clean, responsive, and functional website layouts.', icon: MonitorSmartphone },
    { title: 'Branding', description: 'Logo design, visual identity, and brand styles.', icon: Blend },
    { title: 'Web Development', description: 'Full-stack development of web applications.', icon: Code },
];
