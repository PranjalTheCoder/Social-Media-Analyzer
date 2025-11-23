import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Search, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

// Define local type for History items (matches the MongoDB schema structure)
export type Analysis = {
  _id: string; // Using _id from MongoDB
  fileName: string;
  fileType: "pdf" | "image";
  extractedText: string;
  suggestions: string;
  wordCount: number;
  createdAt: string;
};

interface HistoryPanelProps {
  onSelectAnalysis: (analysis: Analysis) => void;
}

/**
 * HistoryPanel Component
 * ----------------------
 * Fetches past analysis records from the API and displays them in a list.
 * Includes a client-side search filter to find specific documents easily.
 */
export function HistoryPanel({ onSelectAnalysis }: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch history data using React Query for caching and loading states
  const { data: history = [], isLoading } = useQuery<Analysis[]>({
    queryKey: ["/api/history"],
  });

  // Filter history based on the user's search input
  const filteredHistory = history.filter(
    (item) =>
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.extractedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card data-testid="card-history">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Analysis History
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-history"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-testid="text-loading"
          >
            Loading history...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-testid="text-no-history"
          >
            {searchQuery ? "No results found" : "No analysis history yet"}
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <Button
                  // Use MongoDB's unique _id as the key
                  key={item._id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4 hover-elevate"
                  onClick={() => onSelectAnalysis(item)}
                  data-testid={`button-history-item-${item._id}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    {item.fileType === "pdf" ? (
                      <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {item.fileName}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.extractedText.substring(0, 100)}...
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.wordCount} words
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
