"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

type DocumentResult = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  tags: string[];
  currentVersion: {
    filePath: string;
  };
};

const fetchDocuments = async (q: string) => {
  const params = new URLSearchParams();
  if (q) params.append("q", q);

  const res = await fetch(`/api/public-search?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

export function SearchPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["documents", debouncedSearchTerm],
    queryFn: () => fetchDocuments(debouncedSearchTerm),
    enabled: Boolean(debouncedSearchTerm),
  });

  // Control skeleton display with minimum duration
  useEffect(() => {
    let skeletonTimer: NodeJS.Timeout | undefined;

    if (isLoading) {
      setShowSkeletons(true);
      setShowResults(false);
    } else if (!isLoading && showSkeletons) {
      // Keep showing skeletons for at least 800ms for a smoother experience
      skeletonTimer = setTimeout(() => {
        setShowSkeletons(false);
        // Only show results if we have data and a search term
        if (data?.documents && debouncedSearchTerm) {
          setShowResults(true);
        }
      }, 800);
    }

    // When search term changes, reset the results state
    if (!debouncedSearchTerm) {
      setShowResults(false);
    }

    return () => {
      if (skeletonTimer) clearTimeout(skeletonTimer);
    };
  }, [isLoading, showSkeletons, data, debouncedSearchTerm]);

  return (
    <div className="flex flex-col items-center px-4 min-h-screen">
      {/* Fixed header with search */}
      <div className="w-full max-w-2xl pt-16 pb-8 sticky top-0 bg-white z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">DocBox Search</h1>
          <p className="text-gray-500">
            Find documents across your organization
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search documents by title, description or tags..."
            className="h-12 text-lg pl-10 shadow-md focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable results area */}
      <div className="w-full max-w-2xl">
        {showSkeletons && (
          <div className="space-y-4 mt-4 animate-fade-in">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 mt-4 animate-fade-in">
            <CardContent className="pt-6">
              <p className="text-red-500">Error fetching results</p>
            </CardContent>
          </Card>
        )}

        {showResults && data?.documents?.length > 0 && (
          <div className="space-y-4 mt-4 animate-fade-in">
            {data.documents.map((doc: DocumentResult) => (
              <Card
                key={doc.id}
                onClick={() =>
                  router.push(
                    `review/${encodeURIComponent(doc.currentVersion.filePath)}`,
                  )
                }
                className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold text-blue-600 mb-1">
                    {doc.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    {doc.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    {doc.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchTerm && showResults && data?.documents?.length === 0 && (
          <div className="text-center mt-8 animate-fade-in">
            <p className="text-gray-500">
              No documents found matching your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
