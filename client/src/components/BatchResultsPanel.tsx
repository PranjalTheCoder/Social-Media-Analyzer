import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

// Define the shape of a single batch result
interface BatchResult {
  fileName: string;
  success: boolean;
  error?: string;
  metadata?: {
    fileType: string;
    wordCount: number;
  };
}

interface BatchResultsPanelProps {
  results: BatchResult[];
  total: number;
  successful: number;
}

/**
 * BatchResultsPanel Component
 * ---------------------------
 * Displays the outcome of a bulk upload operation.
 * It shows a summary (Total vs Successful) and a scrollable list of
 * individual file results so users can see exactly which files failed and why.
 */
export function BatchResultsPanel({
  results,
  total,
  successful,
}: BatchResultsPanelProps) {
  return (
    <Card data-testid="card-batch-results">
      <CardHeader>
        <CardTitle className="text-xl">Batch Processing Results</CardTitle>
        {/* Summary Statistics */}
        <div className="flex gap-4 text-sm mt-2">
          <div>
            <span className="text-muted-foreground">Total Files: </span>
            <span className="font-semibold">{total}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Successful: </span>
            <span className="font-semibold text-green-600">{successful}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Failed: </span>
            <span className="font-semibold text-red-600">
              {total - successful}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Scrollable list for individual file results */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-md border ${
                  result.success
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                }`}
                data-testid={`batch-result-${index}`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* File Name and Type Icon */}
                    <div className="flex items-center gap-2 mb-1">
                      {result.metadata?.fileType === "pdf" ? (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium truncate">
                        {result.fileName}
                      </span>
                    </div>

                    {/* Success Metadata */}
                    {result.success && result.metadata && (
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.metadata.wordCount} words
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {result.metadata.fileType}
                        </Badge>
                      </div>
                    )}

                    {/* Error Message */}
                    {!result.success && result.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
