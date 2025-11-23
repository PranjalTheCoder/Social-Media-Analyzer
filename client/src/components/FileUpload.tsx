import { useCallback, useState } from "react";
import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

/**
 * FileUpload Component
 * Handles the drag-and-drop or click-to-upload logic for a single file.
 * It validates the file type/size immediately to give quick feedback to the user.
 */
export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // HELPER: Validate file before processing
  // We define this first so it's available for the event handlers below.
  const isValidFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB Limit

    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload PDF or Image files.");
      return false;
    }

    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 10MB.");
      return false;
    }

    return true;
  };

  // UI HANDLERS: Manage the visual "drag over" state
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // DROP HANDLER: Process the file when the user drops it
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  // CLICK HANDLER: Process the file when selected via system dialog
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          // Change visual style when dragging to give feedback
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover-elevate"
          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          data-testid="dropzone-file-upload"
        >
          <div className="flex flex-col items-center gap-4">
            {selectedFile ? (
              // State 1: File Selected
              <>
                {selectedFile.type === "application/pdf" ? (
                  <FileText className="w-16 h-16 text-primary" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-primary" />
                )}
                <div>
                  <p className="font-medium text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    // Reset the hidden input so the same file can be selected again if needed
                    const input = document.getElementById("file-upload") as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                  size="sm"
                >
                  Change File
                </Button>
              </>
            ) : (
              // State 2: Waiting for Upload
              <>
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Upload your document
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your file here, or click to browse
                  </p>
                </div>
                
                {/* Hidden input for accessibility and standard file selection */}
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  disabled={isProcessing}
                  className="hidden"
                  data-testid="input-file-upload"
                  aria-label="Upload file"
                />
                <Button
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={isProcessing}
                  size="lg"
                  data-testid="button-browse-files"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: PDF, JPG, PNG • Max size: 10MB
                </p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}