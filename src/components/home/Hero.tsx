"use client";
import UploadCV from "@/components/home/UploadCV";
import React, { useState, useRef, useEffect } from "react";
import Jobs from "./Jobs";
import { toast } from "sonner";
import Footer from "./Footer";
import PredictedRoles from "./PredictedRoles";
import { DataProvider } from "../DataProvider";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { CardSpotlight } from "@/components/ui/card-spotlight";

function Hero() {
  const [jobsGenerated, setJobsGenerated] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const jobsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const isFooterInView = useInView(footerRef, { once: true, margin: "-100px" });

  const handleJobsGenerated = () => {
    toast.success("Job generated successfully", {
      duration: 3000,
    });
    setIsLoadingJobs(true);
    setJobsGenerated(false);

    // Add a small delay to show skeleton loader
    setTimeout(() => {
      setJobsGenerated(true);
      setIsLoadingJobs(false);

      // Scroll to jobs section
      if (jobsRef.current) {
        jobsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }, 1500); // skeleton loading duration
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden pt-16">

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/5 to-primary/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-primary/15 to-primary/5 rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 flex-1 flex flex-col items-center text-center gap-8 md:gap-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center gap-8 md:gap-10"> {/* Changed from max-w-4xl to max-w-7xl */}



        {/* Header Section */}
        <motion.div
          className="space-y-6 md:space-y-8 w-full px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 backdrop-blur-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">
              AI-Powered Resume Assistant
            </span>
          </div>

          <h1 className="text-2xl sm:text-2xl md:text-6xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Build a better
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              resume instantly
            </span>
          </h1>

          <p className="text-base sm:text-sm text-muted-foreground leading-relaxed max-w-xl font-medium mx-auto px-4">
            Upload your CV, get automated improvements, tailored bullet points,
            and job-specific phrasing — fast and simple.
          </p>
        </motion.div>


          {/* Upload Section */}
         <DataProvider>
            <CardSpotlight 
              className="w-full max-w-7xl sm:w-[80%] md:w-[80%] p-6 sm:p-8 shadow-xl backdrop-blur-sm
                bg-white/60 dark:bg-neutral-900/60 
                border border-neutral-200 dark:border-neutral-700 mx-4"
              color="rgba(59, 130, 246, 0.15)"  // Increased opacity and adjusted blue color
              radius={400}
            >
              <UploadCV onJobsGenerated={handleJobsGenerated} />
            </CardSpotlight>

            <AnimatePresence>
              {(jobsGenerated || isLoadingJobs) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-7xl mx-auto mt-6" 
                >
                  {/* Show skeleton while loading */}
                  {isLoadingJobs ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-6 bg-gray-300 dark:bg-neutral-700 rounded w-1/3 mx-auto"></div>
                      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-4"> {/* Wider grid */}
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-48 bg-gray-300 dark:bg-neutral-700 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <PredictedRoles />
                      <div
                        ref={jobsRef}
                        className="w-full max-w-7xl mx-auto mt-6 md:mt-8 scroll-mt-20 px-4"
                      >
                        <Jobs />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </DataProvider>

        </div>
      </div>

      {/* Footer */}
      <motion.div
        ref={footerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isFooterInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mt-12 md:mt-20"
      >
        <Footer />
      </motion.div>

    </section>
  );
}

export default Hero;