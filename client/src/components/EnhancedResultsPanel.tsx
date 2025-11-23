import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Sparkles,
  BarChart3,
  Copy,
  Download,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

// Define the data structure for an analysis result locally
export type AnalysisResult = {
  extractedText: string;
  suggestions: string;
  metadata: {
    fileType: string;
    fileName: string;
    wordCount: number;
  };
};

interface EnhancedResultsPanelProps {
  result: AnalysisResult;
  sentiment?: { score: number; label: string };
}

/**
 * EnhancedResultsPanel Component
 * ------------------------------
 * The main dashboard for viewing a single analysis.
 * It calculates readability scores on the fly and provides tools to
 * export or copy the data.
 */
export function EnhancedResultsPanel({
  result,
  sentiment,
}: EnhancedResultsPanelProps) {
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState(false);
  const [copiedSuggestions, setCopiedSuggestions] = useState(false);

  // Helper to copy text to clipboard with visual feedback
  const copyToClipboard = async (
    text: string,
    type: "text" | "suggestions"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "text") {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      } else {
        setCopiedSuggestions(true);
        setTimeout(() => setCopiedSuggestions(false), 2000);
      }
      toast({
        title: "Copied!",
        description: `${
          type === "text" ? "Extracted text" : "AI suggestions"
        } copied to clipboard`,
      });
    } catch {
      // Simplified error handling (removed unused variable)
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Generates a downloadable text file of the analysis
  const downloadAsText = () => {
    const content = `EXTRACTED TEXT:\n${result.extractedText}\n\n\nAI SUGGESTIONS:\n${result.suggestions}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${result.metadata.fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Analysis saved as text file",
    });
  };

  // Calculates a simple readability score based on sentence length and syllables
  // (Approximation of Flesch Reading Ease)
  const calculateReadability = (text: string): number => {
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;

    const syllables = text.split(/\s+/).reduce((count, word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      if (cleanWord.length === 0) return count;

      const vowelGroups = cleanWord.match(/[aeiouy]+/g);
      let syllableCount = vowelGroups ? vowelGroups.length : 1;

      if (cleanWord.endsWith("e") && syllableCount > 1) {
        syllableCount--;
      }

      return count + Math.max(1, syllableCount);
    }, 0);

    if (sentences === 0 || words === 0) return 0;

    const score =
      206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const readabilityScore = calculateReadability(result.extractedText);

  return (
    <div className="space-y-8">
      {/* Metrics Card: Shows high-level stats */}
      <Card data-testid="card-enhanced-metrics">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Content Metrics
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAsText}
              data-testid="button-download-text"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Word Count</p>
              <p
                className="text-2xl font-semibold"
                data-testid="text-word-count"
              >
                {result.metadata.wordCount}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">File Type</p>
              <p
                className="text-2xl font-semibold capitalize"
                data-testid="text-file-type"
              >
                {result.metadata.fileType}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Readability</p>
              <p
                className="text-2xl font-semibold"
                data-testid="text-readability-score"
              >
                {readabilityScore}
              </p>
            </div>
            {sentiment && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sentiment</p>
                <p
                  className="text-2xl font-semibold capitalize"
                  data-testid="text-sentiment"
                >
                  {sentiment.label}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area: Split view for Text and Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Extracted Text */}
        <Card data-testid="card-extracted-text">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Extracted Text
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.extractedText, "text")}
                data-testid="button-copy-text"
              >
                {copiedText ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full rounded-md border p-4">
              <pre
                className="text-sm font-mono whitespace-pre-wrap text-foreground"
                data-testid="text-extracted-content"
              >
                {result.extractedText || "No text extracted"}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: AI Suggestions */}
        <Card data-testid="card-ai-suggestions">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Suggestions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(result.suggestions, "suggestions")
                }
                data-testid="button-copy-suggestions"
              >
                {copiedSuggestions ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full rounded-md border p-4">
              <div
                className="text-sm text-foreground whitespace-pre-wrap"
                data-testid="text-ai-suggestions"
              >
                {result.suggestions || "No suggestions available"}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
