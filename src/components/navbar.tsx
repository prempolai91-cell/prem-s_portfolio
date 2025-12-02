'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Home, User, Star, Briefcase, Mail, Award, Cpu, Shield, BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggleButton } from './theme-toggle-button';
import './navbar.css';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';


interface NavbarProps {
  onScroll: (id: string) => void;
  onNavigate: (path: string) => void;
}

const navLinks = [
  { id: 'home', label: 'Home', icon: Home, adminOnly: false },
  { id: 'about', label: 'About', icon: User, adminOnly: false },
  { id: 'education', label: 'Education', icon: BookOpen, adminOnly: false },
  { id: 'certificates', label: 'Certificates', icon: Award, adminOnly: false },
  { id: 'skills', label: 'Skills', icon: Star, adminOnly: false },
  { id: 'technologies', label: 'Technologies', icon: Cpu, adminOnly: false },
  { id: 'projects', label: 'Projects', icon: Briefcase, adminOnly: false },
  { id: 'contact', label: 'Contact', icon: Mail, adminOnly: false },
];

const adminLink = { id: '/admin', label: 'Admin Panel', icon: Shield, adminOnly: true };

export function Navbar({ onScroll, onNavigate }: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY < 100) {
          setIsVisible(true);
        } else {
          if (window.scrollY > lastScrollY) {
            setIsVisible(false); // Scrolling down
          } else {
            setIsVisible(true); // Scrolling up
          }
        }
        lastScrollY = window.scrollY;
      }
    };

    window.addEventListener('scroll', controlNavbar);

    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, []);

  const finalNavLinks = isUserLoading ? navLinks : (user ? [...navLinks, adminLink] : navLinks);

  return (
    <nav className={`navbar ${isVisible ? '' : 'navbar--hidden'}`}>
      <div className="navbar-container">
        {finalNavLinks.map((link) => (
            <Tooltip key={link.id}>
                <TooltipTrigger asChild>
                    <button
                        onClick={(e) => { 
                            e.preventDefault();
                            if (link.adminOnly) {
                                router.push(link.id);
                            } else {
                                onScroll(link.id);
                            }
                        }}
                        className="navbar-icon-button"
                        aria-label={link.label}
                    >
                        <link.icon />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{link.label}</p>
                </TooltipContent>
            </Tooltip>
        ))}
        <div className="theme-toggle-container">
            <ThemeToggleButton />
        </div>
      </div>
    </nav>
  );
}
