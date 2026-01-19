"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  AlertCircle,
  Users,
  MapPin,
  TrendingUp,
  Activity,
} from "lucide-react";

interface StatisticsProps {
  statistics: {
    totalOccurrences: number;
    patientInvolved: number;
    byStatus: Array<{ statusName: string; count: number }>;
    bySeverity: Array<{ severityName: string; count: number }>;
    byDepartment: Array<{ departmentName: string; count: number }>;
    byLocation: Array<{ locationName: string; count: number }>;
  };
}

export function ReportStatistics({ statistics }: StatisticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Occurrences */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Occurrences
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.totalOccurrences}
          </div>
          <p className="text-xs text-muted-foreground">
            In selected date range
          </p>
        </CardContent>
      </Card>

      {/* Patient Involved */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Patient Involved
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.patientInvolved}</div>
          <p className="text-xs text-muted-foreground">
            {statistics.totalOccurrences > 0
              ? `${Math.round(
                  (statistics.patientInvolved / statistics.totalOccurrences) *
                    100
                )}% of total`
              : "No data"}
          </p>
        </CardContent>
      </Card>

      {/* Top Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.byStatus.length > 0
              ? statistics.byStatus.sort((a, b) => b.count - a.count)[0]
                  .statusName
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics.byStatus.length > 0
              ? `${
                  statistics.byStatus.sort((a, b) => b.count - a.count)[0].count
                } occurrences`
              : "No data"}
          </p>
        </CardContent>
      </Card>

      {/* Top Severity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Severity</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.bySeverity.length > 0
              ? statistics.bySeverity.sort((a, b) => b.count - a.count)[0]
                  .severityName
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics.bySeverity.length > 0
              ? `${
                  statistics.bySeverity.sort((a, b) => b.count - a.count)[0]
                    .count
                } occurrences`
              : "No data"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
