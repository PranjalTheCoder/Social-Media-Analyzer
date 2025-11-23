import { useCallback, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BatchUploadProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
  processingProgress?: { current: number; total: number };
}

/**
 * BatchUpload Component
 * Allows users to select multiple files at once.
 * Shows a list of selected files and a global progress bar during processing.
 */
export function BatchUpload({
  onFilesSelect,
  isProcessing,
  processingProgress,
}: BatchUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // HELPER: Validates individual files
  // Defined at the top to avoid "used before declaration" errors
  const isValidFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // We return false (and could optionally log/alert) for invalid files
    if (!validTypes.includes(file.type)) return false;
    if (file.size > maxSize) return false;

    return true;
  };

  // DRAG HANDLERS
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Filter valid files immediately upon drop
    const files = Array.from(e.dataTransfer.files).filter(isValidFile);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  }, []);

  // INPUT HANDLER
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const validFiles = Array.from(files).filter(isValidFile);
        setSelectedFiles(validFiles);
      }
    },
    []
  );

  // Remove a single file from the staging list
  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  // Trigger the parent's upload logic
  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelect(selectedFiles);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover-elevate"
          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          data-testid="dropzone-batch-upload"
        >
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-muted-foreground" />

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Upload Multiple Files
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop multiple files here, or click to browse
              </p>
            </div>

            <input
              type="file"
              id="batch-file-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              disabled={isProcessing}
              multiple
              className="hidden"
              data-testid="input-batch-file"
              aria-label="Select files to upload"
            />

            <Button
              onClick={() =>
                document.getElementById("batch-file-upload")?.click()
              }
              disabled={isProcessing}
              size="lg"
              data-testid="button-choose-files"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>

            <p className="text-xs text-muted-foreground mt-2">
              Supported: PDF, JPG, PNG • Max size: 10MB per file
            </p>
          </div>
        </div>

        {/* FILE LIST: Shows what the user is about to upload */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-3" data-testid="selected-files-list">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Selected Files ({selectedFiles.length})
              </p>
              {!isProcessing && (
                <Button
                  onClick={handleUpload}
                  size="sm"
                  data-testid="button-upload-batch"
                >
                  Upload All
                </Button>
              )}
            </div>

            {/* PROGRESS BAR: Only visible during processing */}
            {processingProgress && (
              <div className="space-y-2" data-testid="batch-progress">
                <div className="flex justify-between text-sm">
                  <span>Processing files...</span>
                  <span>
                    {processingProgress.current} / {processingProgress.total}
                  </span>
                </div>
                <Progress
                  value={
                    (processingProgress.current / processingProgress.total) *
                    100
                  }
                  data-testid="progress-batch"
                />
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {file.type === "application/pdf" ? (
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                    >
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  {!isProcessing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}