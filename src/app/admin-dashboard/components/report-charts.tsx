"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartsProps {
  statistics: {
    byStatus: Array<{ statusName: string; count: number }>;
    bySeverity: Array<{ severityName: string; count: number }>;
    byDepartment: Array<{ departmentName: string; count: number }>;
    byLocation: Array<{ locationName: string; count: number }>;
  };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
];

export function ReportCharts({ statistics }: ChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.byStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="statusName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statistics.bySeverity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.severityName}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count">
                {statistics.bySeverity.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={statistics.byDepartment.slice(0, 10)}
              layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="departmentName" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Location Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Location Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.byLocation.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="locationName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ffc658" name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
