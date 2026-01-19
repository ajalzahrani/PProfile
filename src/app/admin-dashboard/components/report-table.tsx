"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSeverityColor } from "@/lib/severity-color";
import { getStatusBadge } from "@/lib/status-badge";

interface Occurrence {
  id: string;
  occurrenceNo: string;
  description: string;
  occurrenceDate: Date;
  mrn: string | null;
  isPatientInvolve: boolean;
  status: {
    name: string;
  };
  incident: {
    name: string;
    severity: {
      name: string;
    };
  };
  location: {
    name: string;
  } | null;
  createdBy: {
    name: string;
  } | null;
  assignments: Array<{
    department: {
      name: string;
    };
  }>;
}

interface ReportTableProps {
  occurrences: Occurrence[];
}

export function ReportTable({ occurrences }: ReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occurrence Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occurrences.length > 0 ? (
                occurrences.map((occurrence) => {
                  const statusBadge = getStatusBadge(occurrence.status.name);
                  return (
                    <TableRow key={occurrence.id}>
                      <TableCell className="font-medium">
                        {occurrence.occurrenceNo}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(occurrence.occurrenceDate),
                          "dd/MM/yyyy"
                        )}
                      </TableCell>
                      <TableCell>
                        {occurrence.incident.name.slice(0, 30)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            getSeverityColor(
                              occurrence.incident.severity.name
                            ) as any
                          }>
                          {occurrence.incident.severity.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant as any}>
                          {occurrence.status.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {occurrence.location?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {occurrence.assignments
                            .slice(0, 2)
                            .map((assignment, idx) => (
                              <span key={idx} className="text-xs">
                                {assignment.department.name}
                              </span>
                            ))}
                          {occurrence.assignments.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{occurrence.assignments.length - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {occurrence.isPatientInvolve ? (
                          <Badge variant="outline">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/occurrences/${occurrence.id}`}
                          className="text-primary hover:underline inline-flex items-center gap-1">
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No occurrences found matching the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
