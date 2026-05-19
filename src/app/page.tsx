"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// Import Modular Landing Components
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Ecosystem from "@/components/landing/Ecosystem";
import Security from "@/components/landing/Security";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/landing/ScrollToTop";

export default function LandingPage() {
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150); // Muncul setelah scroll lebih dari 150px
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const isLoggedIn = status === "authenticated";

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans selection:bg-emerald-100 selection:text-slate-900">
      {/* 
        UNIFIED CANVAS BACKDROP (LIGHT THEME):
        Grid latar belakang menyatu di seluruh halaman tanpa terputus-putus
      */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-75 pointer-events-none z-0" />
      
      {/* Ambient Glowing Pastel Mesh Orbs yang tersebar di sepanjang scroll */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-200/35 blur-[120px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-[25%] right-[-10%] w-[35%] h-[35%] rounded-full bg-teal-200/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[55%] left-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-200/25 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[10%] w-[30%] h-[30%] rounded-full bg-teal-200/20 blur-[100px] pointer-events-none z-0" />

      {/* Header Section */}
      <Header
        isLoggedIn={isLoggedIn}
        handleScrollToTop={handleScrollToTop}
        handleScrollToSection={handleScrollToSection}
      />

      {/* Hero Section */}
      <Hero
        isLoggedIn={isLoggedIn}
        handleScrollToSection={handleScrollToSection}
      />

      {/* Why Choose SSO Section */}
      <Features />

      {/* Integrated Ecosystem Section */}
      <Ecosystem />

      {/* Security OAuth2 & Privacy Section */}
      <Security />

      {/* Bottom CTA Card Section */}
      <CTA isLoggedIn={isLoggedIn} />

      {/* Footer Section */}
      <Footer />

      {/* Floating Scroll to Top FAB Button */}
      <ScrollToTop
        scrolled={scrolled}
        handleScrollToTop={(e) => handleScrollToTop(e)}
      />
    </div>
  );
}
