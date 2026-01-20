"use client";
import React, {
  InputHTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { FileText, File, Upload, X, Loader2, SparkleIcon, Sparkles, FolderUpIcon } from "lucide-react";
import { DataContext } from "../DataProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "../ui/loader";


interface UploadCVProps {
  onJobsGenerated?: (jobs: any[]) => void;
}

export default function UploadCV({ onJobsGenerated }: UploadCVProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { setData } = React.useContext(DataContext);

  const handleFiles = useCallback((f: File | null) => {
    if (f) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      const fileExtension = f.name.split(".").pop()?.toLowerCase();
      const isAllowedType =
        allowedTypes.includes(f.type) ||
        ["pdf", "doc", "docx", "txt"].includes(fileExtension || "");

      if (!isAllowedType) {
        alert("Please upload a valid file type: PDF, DOC, DOCX, or TXT");
        return;
      }

      // Validate file size (5MB max)
      if (f.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setFile(f);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    handleFiles(f ?? null);
  }

  async function parsePdf() {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("An error occured while processing the PDF");
      }

      const data = await response.json();

      console.log(data);

      return data;
    } catch (err) {
      console.error(err);
    }
  }

  async function translateText(text: JSON) {
    const res = await fetch("/api/translate", {
      method: "POST",
      body: JSON.stringify(text),
    });

    const data = await res.json();
    console.log("Translation:", data);
    return data;
  }


  async function predictRole(pdfParsed: JSON) {
    const predict = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pdfParsed),
    });

    const predicted_data = await predict.json();
    console.log(predicted_data);

    return predicted_data.predicted_category
  }

  async function feedbackAI(predicted_category: any, cvText: JSON) {
    const ai = await fetch("/api/feedback", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cvText: cvText,
        predictedRole: predicted_category
      })
    });

    const feedback = await ai.json()

    console.log(feedback)

    return feedback.feedback;
  }

  async function extractSkills(cvText: JSON) {
    const response = await fetch("/api/extract-skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cvText)
    });


    const extract = await response.json()

    console.log(extract)
    return extract
  }
  

  async function findJobs(skills: any) {
    const response = await fetch("/api/find-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skills }),
    });

    const jobs = await response.json();

    console.log(jobs);
    return jobs;
  }

  function clearFile() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function onDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if leaving the drop zone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragging(false);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        alert("Please upload only one file at a time");
        return;
      }
      handleFiles(files[0]);
    }
  }

  const handleGenerateJobs = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      setUploadStatus("Parsing resume...");
      const parse = await parsePdf();

      setUploadStatus("Analyzing role...");
      const role = await predictRole(parse);

      setUploadStatus("Translating content...");
      const translateParse = await translateText(parse);
      
      setUploadStatus("Predicting role...");
      const rolePredicted = await predictRole(translateParse);
      setData((prev) => ({ ...prev, role: rolePredicted }));

      setUploadStatus("Generating feedback...");
      const feedbackGet = await feedbackAI(rolePredicted, parse);
      setData((prev) => ({ ...prev, feedback: feedbackGet }));

      setUploadStatus("Extracting skills...");
      const extracted = await extractSkills(parse);

      setUploadStatus("Finding matching jobs...");
      const jobsResponse = await findJobs(extracted);
      const jobsArray = jobsResponse.jobs || [];

      setData({ role: rolePredicted, feedback: feedbackGet, jobs: jobsArray });

      if (onJobsGenerated) {
        onJobsGenerated(jobsArray);
      }

    } catch (error) {
      console.error(error);
      setUploadStatus("Error occurred while processing");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };


  // Get file icon based on file type
  const getFileIcon = () => {
    if (!file) return <File className="w-8 h-8" />;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (
      fileType.includes("word") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx")
    ) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return <FileText className="w-8 h-8 text-gray-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-400" />;
    }
  };

  const getFileType = () => {
    if (!file) return "";

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".pdf")) return "PDF";
    if (fileName.endsWith(".doc")) return "DOC";
    if (fileName.endsWith(".docx")) return "DOCX";
    if (fileName.endsWith(".txt")) return "TXT";
    return "File";
  };

  return (
    <div className="w-full max-w-150 mx-auto p-1">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Upload Your Resume
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Get personalized career insights and job recommendations
        </p>
      </div>

     
     <div className="w-full max-w-7xl mx-auto">
  {/* Drop Zone - Animated */}
  <AnimatePresence>
    {!file && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") inputRef.current?.click();
        }}
        className={`border-2 rounded-xl p-8 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-200 group
          ${dragging
            ? "border-gray-500 bg-gray-50 dark:bg-gray-900/20 scale-[1.02] shadow-lg"
            : "border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/10"
          }
        `}
        aria-label="Drag and drop your CV here or click to select a file"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleChange}
          className="hidden"
          aria-hidden
        />

        {/* Upload Icon */}
        <div>
          <FolderUpIcon className={`w-8 h-8 transition-colors ${dragging
              ? "text-gray-600"
              : "text-gray-600 dark:text-gray-400 group-hover:text-gray-600"
            }`} />
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <div className="text-base text-gray-600 dark:text-gray-400">
            {dragging ? (
              <span className="text-blue-600 font-medium">Drop your resume here</span>
            ) : (
              <>
                <span className="font-medium text-gray-900 dark:text-white">Click to upload</span> or drag and drop
              </>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            PDF, DOC, DOCX, TXT (Max. 5MB)
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* File Preview & Generate Button - Animated */}
  <AnimatePresence>
    {file && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">{getFileIcon()}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </div>
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md font-medium">
                  {getFileType()}
                </span>
              </div>
              <div className="text-left text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(0)} KB • Uploaded {new Date().toLocaleDateString()}
              </div>
            </div>

            <button
              type="button"
              onClick={clearFile}
              className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Remove file"
              disabled={isUploading}
            >
              <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
            </button>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <Button
              type="button"
              onClick={handleGenerateJobs}
              disabled={isUploading}
              className={`w-full max-w-80 text-sm px-6 py-3 rounded-lg font-semibold
    ${isUploading
      ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-800/90'
      : 'bg-gradient-to-r from-primary to-primary/70 text-white hover:from-primary/90 hover:to-primary/80'
    }
    transition-all duration-200
    shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isUploading ? "Processing..." : "Generate job recommendations"}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader
                    variant="text-shimmer"
                    text={uploadStatus || "Processing..."}
                    className="text-md"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Generate jobs <Sparkles className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
      </div>
    </div>
  );
}
