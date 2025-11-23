import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUpload } from "@/components/FileUpload";
import { BatchUpload } from "@/components/BatchUpload";
import { LoadingStates } from "@/components/LoadingStates";
import { EnhancedResultsPanel } from "@/components/EnhancedResultsPanel";
import { BatchResultsPanel } from "@/components/BatchResultsPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, FileUp, Files } from "lucide-react";

// --- Local Type Definitions (Matching MongoDB Schema) ---

// Represents a single analyzed document
type AnalysisResult = {
  extractedText: string;
  suggestions: string;
  metadata: {
    fileType: string;
    fileName: string;
    wordCount: number;
  };
  sentiment?: { score: number; label: string };
};

// Represents a historical record from the DB
type Analysis = {
  _id: string;
  fileName: string;
  fileType: "pdf" | "image";
  extractedText: string;
  suggestions: string;
  wordCount: number;
  createdAt: string;
  sentiment?: { score: number; label: string };
};

// Represents one item in a batch upload result
interface BatchResult {
  fileName: string;
  success: boolean;
  error?: string;
  metadata?: {
    fileType: string;
    wordCount: number;
  };
}

type ProcessingStatus = "idle" | "uploading" | "extracting" | "analyzing";

/**
 * EnhancedHome Page
 * -----------------
 * The main dashboard. It manages the state for:
 * 1. Single File Uploads
 * 2. Batch File Uploads
 * 3. Viewing Results (Single & Batch)
 * 4. Viewing History
 */
export default function EnhancedHome() {
  // --- State Management ---
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  
  // State for Single Analysis Result
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // State for Batch Analysis Results
  const [batchResults, setBatchResults] = useState<{ results: BatchResult[]; total: number; successful: number } | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | undefined>();
  
  const { toast } = useToast();

  // --- API Mutation: Single Upload ---
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("uploading");
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      // Simulate steps for UX (so the user sees "Extracting" -> "Analyzing")
      setStatus("extracting");
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setStatus("analyzing");
      await new Promise((resolve) => setTimeout(resolve, 500));

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setStatus("idle");
      toast({
        title: "Analysis complete!",
        description: "Your content has been analyzed successfully.",
      });
    },
    onError: (error: Error) => {
      setStatus("idle");
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- API Mutation: Batch Upload ---
  const batchUploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      setStatus("uploading");
      setBatchProgress({ current: 0, total: files.length });
      
      const response = await fetch("/api/upload/batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Batch upload failed");
      }

      setStatus("extracting");
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setStatus("analyzing");
      await new Promise((resolve) => setTimeout(resolve, 500));

      return response.json();
    },
    onSuccess: (data) => {
      setStatus("idle");
      setBatchProgress(undefined);
      setBatchResults(data);
      toast({
        title: "Batch analysis complete!",
        description: `Successfully analyzed ${data.successful} out of ${data.total} files.`,
      });
    },
    onError: (error: Error) => {
      setStatus("idle");
      setBatchProgress(undefined);
      toast({
        title: "Batch upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Event Handlers ---

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleBatchSelect = (files: File[]) => {
    batchUploadMutation.mutate(files);
  };

  // Triggered when clicking an item in the History panel
  const handleSelectFromHistory = (analysis: Analysis) => {
    // Map the MongoDB document structure to the Result view structure
    setResult({
      extractedText: analysis.extractedText,
      suggestions: analysis.suggestions,
      metadata: {
        fileType: analysis.fileType,
        fileName: analysis.fileName,
        wordCount: analysis.wordCount,
      },
      sentiment: analysis.sentiment,
    });
    
    // Smooth scroll to top to see the result
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear current view to upload again
  const handleReset = () => {
    setResult(null);
    setBatchResults(null);
    setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12" data-testid="header-main">
          <h1 className="text-3xl font-semibold text-foreground mb-3">
            Social Media Content Analyzer
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Upload your social media posts as PDF or images, and get AI-powered suggestions
            to improve engagement, captions, hooks, and hashtags
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-12">
          
          {/* 1. Upload Selection (Tabs) */}
          {status === "idle" && !result && !batchResults && (
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="single" data-testid="tab-single-upload">
                  <FileUp className="w-4 h-4 mr-2" />
                  Single File
                </TabsTrigger>
                <TabsTrigger value="batch" data-testid="tab-batch-upload">
                  <Files className="w-4 h-4 mr-2" />
                  Batch Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="single">
                <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
              </TabsContent>
              
              <TabsContent value="batch">
                <BatchUpload 
                  onFilesSelect={handleBatchSelect} 
                  isProcessing={false}
                  processingProgress={batchProgress}
                />
              </TabsContent>
            </Tabs>
          )}

          {/* 2. Loading States */}
          {(status === "uploading" || status === "extracting" || status === "analyzing") && (
            <LoadingStates status={status} />
          )}

          {/* 3. Single Result View */}
          {result && status === "idle" && !batchResults && (
            <>
              <EnhancedResultsPanel result={result} sentiment={result.sentiment} />
              
              <div className="flex justify-center">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  data-testid="button-upload-another"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Upload Another File
                </Button>
              </div>
            </>
          )}

          {/* 4. Batch Result View */}
          {batchResults && status === "idle" && (
            <>
              <BatchResultsPanel 
                results={batchResults.results}
                total={batchResults.total}
                successful={batchResults.successful}
              />
              
              <div className="flex justify-center">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  data-testid="button-upload-another"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Upload More Files
                </Button>
              </div>
            </>
          )}

          {/* 5. History Panel (Always visible at bottom) */}
          {status === "idle" && (
            <div className="mt-16">
              <HistoryPanel onSelectAnalysis={handleSelectFromHistory} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 py-6" data-testid="footer-main">
          <p className="text-sm text-muted-foreground">
            Powered by Google Gemini AI • Built with React & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}