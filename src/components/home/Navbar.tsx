"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../theme/mode-toggle";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { PopoverCRM } from "../PopoverCRM";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if page is scrolled more than 10px
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
  ? "bg-white/15 dark:bg-black/15 backdrop-blur-lg border-b border-white/15 dark:border-white/15 shadow-md" 
  : "bg-transparent"
    }`}>
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
       <Link href="/" className="flex items-center">
  <span className="text-2xl font-bold tracking-tight">
    Resu<span className="text-primary font-bold text-2xl">my</span>
  </span>
</Link>

        <div className="flex items-center gap-3">
           <PopoverCRM />
          <ModeToggle />
         
          {isSignedIn ? (
            <>
              <UserButton />
            </>
          ) : (
            <>
             
            </>
          )}
        </div>
      </nav>
    </header>
  );
}