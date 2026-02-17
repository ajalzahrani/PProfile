// src/app/documents/components/document-search.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ColumnFiltersState } from "@tanstack/react-table";
import { getRoles } from "@/actions/roles";
import { getDepartments } from "@/actions/departments";
import { getSearchCookie, setSearchCookie } from "@/lib/cookies-service";

interface DocumentsSearchProps {
  onFiltersChange?: (filters: ColumnFiltersState) => void;
}

export function DocumentsSearch({ onFiltersChange }: DocumentsSearchProps) {
  // Local state for search params
  const [searchParams, setSearchParams] =
    React.useState<Record<string, string>>(getSearchCookie());

  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // On mount, hydrate local state from cookie if needed
  useEffect(() => {
    setSearchParams(getSearchCookie());
  }, []);

  // Fetch roles and departments
  useEffect(() => {
    const fetchRoles = async () => {
      const rolesResult = await getRoles();
      if (rolesResult.success && rolesResult.roles) {
        setRoles(rolesResult.roles);
      }
    };
    const fetchDepartments = async () => {
      const departmentsResult = await getDepartments();
      if (departmentsResult.success && departmentsResult.departments) {
        setDepartments(departmentsResult.departments);
      }
    };
    fetchRoles();
    fetchDepartments();
  }, []);

  // Update table filters when search params change
  useEffect(() => {
    if (onFiltersChange) {
      const filters: ColumnFiltersState = [];
      
      if (searchParams.name) {
        filters.push({ id: "name", value: searchParams.name });
      }
      if (searchParams.email) {
        filters.push({ id: "email", value: searchParams.email });
      }
      if (searchParams.role) {
        filters.push({ id: "role", value: searchParams.role });
      }
      if (searchParams.department) {
        filters.push({ id: "department", value: searchParams.department });
      }
      if (searchParams.compliance) {
        filters.push({ id: "compliance", value: searchParams.compliance });
      }

      onFiltersChange(filters);
    }
  }, [searchParams, onFiltersChange]);

  const updateFilter = (key: string, value: string) => {
    let newParams = { ...searchParams };
    if (value === "all" || value === "") {
      delete newParams[key];
    } else {
      newParams[key] = value;
    }
    newParams.page = "1"; // Reset to first page on filter change
    newParams.pageSize = newParams.pageSize || "10";
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchCookie({});
    if (onFiltersChange) {
      onFiltersChange([]);
    }
    router.refresh();
  };

  const handleApplyFilters = () => {
    setIsOpen(false);
    setSearchCookie(searchParams);
    router.refresh();
  };

  return (
    <div className="gap-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4 px-4">
            <div className="space-y-2">
              <label>Name</label>
              <Input
                placeholder="Search by name..."
                value={searchParams.name ?? ""}
                onChange={(e) => updateFilter("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label>Email</label>
              <Input
                placeholder="Search by email..."
                value={searchParams.email ?? ""}
                onChange={(e) => updateFilter("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label>Role</label>
              <Select
                defaultValue={searchParams.role ?? "all"}
                onValueChange={(value) => updateFilter("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Department</label>
              <Select
                defaultValue={searchParams.department ?? "all"}
                onValueChange={(value) => updateFilter("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.name}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Compliance Status</label>
              <Select
                defaultValue={searchParams.compliance ?? "all"}
                onValueChange={(value) => updateFilter("compliance", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select compliance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between px-4">
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
