"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Occurrence {
  id: string;
  occurrenceNo: string;
  description: string;
  occurrenceDate: Date;
  mrn: string | null;
  isPatientInvolve: boolean;
  status: { name: string };
  incident: {
    name: string;
    severity: { name: string };
  };
  location: { name: string } | null;
  createdBy: { name: string } | null;
  assignments: Array<{ department: { name: string } }>;
}

interface ExportButtonsProps {
  occurrences: Occurrence[];
  statistics: any;
}

export function ExportButtons({ occurrences, statistics }: ExportButtonsProps) {
  const exportToCSV = () => {
    try {
      // Create CSV header
      const headers = [
        "Occurrence ID",
        "Date",
        "Incident",
        "Severity",
        "Status",
        "Location",
        "Departments",
        "Patient Involved",
        "MRN",
        "Reporter",
        "Description",
      ];

      // Create CSV rows
      const rows = occurrences.map((occ) => [
        occ.occurrenceNo,
        new Date(occ.occurrenceDate).toLocaleDateString(),
        occ.incident.name,
        occ.incident.severity.name,
        occ.status.name,
        occ.location?.name || "N/A",
        occ.assignments.map((a) => a.department.name).join("; "),
        occ.isPatientInvolve ? "Yes" : "No",
        occ.mrn || "N/A",
        occ.createdBy?.name || "Anonymous",
        occ.description.replace(/,/g, ";"), // Replace commas in description
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `occurrence-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Report has been exported to CSV",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export report to CSV",
      });
    }
  };

  const exportToJSON = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        statistics,
        occurrences: occurrences.map((occ) => ({
          occurrenceNo: occ.occurrenceNo,
          date: occ.occurrenceDate,
          incident: occ.incident.name,
          severity: occ.incident.severity.name,
          status: occ.status.name,
          location: occ.location?.name || "N/A",
          departments: occ.assignments.map((a) => a.department.name),
          patientInvolved: occ.isPatientInvolve,
          mrn: occ.mrn,
          reporter: occ.createdBy?.name || "Anonymous",
          description: occ.description,
        })),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `occurrence-report-${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Report has been exported to JSON",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export report to JSON",
      });
    }
  };

  const printReport = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "You can now print or save as PDF",
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={exportToCSV} variant="outline">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export to CSV
      </Button>
      <Button onClick={exportToJSON} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export to JSON
      </Button>
      <Button onClick={printReport} variant="outline">
        <FileText className="mr-2 h-4 w-4" />
        Print / Save as PDF
      </Button>
    </div>
  );
}
