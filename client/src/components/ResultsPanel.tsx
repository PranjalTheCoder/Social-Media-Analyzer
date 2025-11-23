import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Sparkles, BarChart3 } from "lucide-react";

// Defined locally to ensure type safety without external dependencies
export type AnalysisResult = {
  extractedText: string;
  suggestions: string;
  metadata: {
    fileType: string;
    fileName: string;
    wordCount: number;
  };
};

interface ResultsPanelProps {
  result: AnalysisResult;
}

/**
 * ResultsPanel Component
 * ----------------------
 * A lightweight version of the results display.
 * Shows the core content: Metrics, Extracted Text, and AI Suggestions.
 */
export function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <div className="space-y-8">
      {/* Metrics Card */}
      <Card data-testid="card-metrics">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Content Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
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
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Extracted Text Column */}
        <Card data-testid="card-extracted-text">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Extracted Text
            </CardTitle>
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

        {/* AI Suggestions Column */}
        <Card data-testid="card-ai-suggestions">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Suggestions
            </CardTitle>
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
