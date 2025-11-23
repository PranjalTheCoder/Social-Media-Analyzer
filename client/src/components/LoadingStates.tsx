import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadingStatesProps {
  status: "uploading" | "extracting" | "analyzing";
}

/**
 * LoadingStates Component
 * Displays a visual indicator of the current background process.
 * This helps users understand that the app hasn't frozen, but is working on
 * specific steps like OCR extraction or AI generation.
 */
export function LoadingStates({ status }: LoadingStatesProps) {
  // User-friendly messages for each technical state
  const messages = {
    uploading: "Uploading file...",
    extracting: "Extracting text...",
    analyzing: "Generating AI suggestions...",
  };

  return (
    <Card className="p-12 max-w-3xl mx-auto" data-testid="loading-container">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Animated Spinner */}
        <Loader2
          className="w-16 h-16 text-primary animate-spin"
          data-testid="spinner-loading"
        />

        <div className="space-y-2">
          <h3
            className="text-xl font-semibold text-foreground"
            data-testid="text-loading-status"
          >
            {messages[status]}
          </h3>
          <p className="text-sm text-muted-foreground">
            This may take a moment, please wait...
          </p>
        </div>
      </div>
    </Card>
  );
}
