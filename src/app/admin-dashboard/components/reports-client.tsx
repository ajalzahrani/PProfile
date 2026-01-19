"use client";

import { useState } from "react";
import { ReportFilters } from "./report-filters";
import { ReportStatistics } from "./report-statistics";
import { ReportCharts } from "./report-charts";
import { ReportTable } from "./report-table";
import { ExportButtons } from "./export-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Table as TableIcon, PieChart } from "lucide-react";

interface ReportsClientProps {
  initialOccurrences: any[];
  initialStatistics: any;
  filterOptions: any;
}

export function ReportsClient({
  initialOccurrences,
  initialStatistics,
  filterOptions,
}: ReportsClientProps) {
  const [occurrences, setOccurrences] = useState(initialOccurrences);
  const [statistics, setStatistics] = useState(initialStatistics);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (filters: any) => {
    setIsLoading(true);
    try {
      // Call API to get filtered data
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data = await response.json();
        setOccurrences(data.occurrences);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Row: Export + Filter */}
      <div className="flex justify-end items-center gap-2">
        <ExportButtons occurrences={occurrences} statistics={statistics} />
        <ReportFilters
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading report data...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <ReportStatistics statistics={statistics} />

            {/* Tabs for Charts and Table */}
            <Tabs defaultValue="charts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Charts
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Data Table
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-4">
                <ReportCharts statistics={statistics} />
              </TabsContent>

              <TabsContent value="table">
                <ReportTable occurrences={occurrences} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
