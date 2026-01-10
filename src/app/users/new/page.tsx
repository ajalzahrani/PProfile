"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Building2, Link } from "lucide-react";
import { createUser } from "@/actions/users";
import { getRoles } from "@/actions/roles";
import { getDepartments } from "@/actions/departments";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  userFormSchema,
  UserFormValuesWithRolesAndDepartments,
} from "@/actions/users.validations";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { RoleFormValues } from "@/actions/roles.validation";
import { DepartmentFormValues } from "@/actions/departments.validation";
import { Label } from "@/components/ui/label";

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleFormValues[]>([]);
  const [departments, setDepartments] = useState<DepartmentFormValues[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Initialize the form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormValuesWithRolesAndDepartments>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      role: {
        id: "",
        name: "",
        description: "",
      },
      department: {
        id: "",
        name: "",
      },
    },
  });

  // Fetch roles and departments when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        // Fetch roles
        const rolesResponse = await getRoles();
        if (rolesResponse.success) {
          setRoles(rolesResponse.roles as RoleFormValues[]);
        } else {
          setError("Failed to load roles");
        }

        // Fetch departments
        const departmentsResponse = await getDepartments();
        if (departmentsResponse.success) {
          setDepartments(
            departmentsResponse.departments as DepartmentFormValues[]
          );
        } else {
          setError("Failed to load departments");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("An unexpected error occurred while loading data");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: UserFormValuesWithRolesAndDepartments) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createUser(
        data as unknown as UserFormValuesWithRolesAndDepartments
      );
      if (result.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        router.push("/users");
      } else {
        setError(result.error || "Failed to create user");
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create user",
        });
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the user",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-10 text-center">Loading...</div>
    );
  }

  return (
    <PageShell>
      <PageHeader heading="New User" text="Create a new user">
        <Button variant="outline" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter user name"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="Enter username"
              className="mt-1"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter new password (leave blank to keep current)"
              className="mt-1"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid gap-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={watch("role")?.id === role.id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValue("role", {
                          id: role.id,
                          name: role.name,
                          description: role.description,
                        });
                      }
                    }}
                  />
                  <Label
                    htmlFor={`role-${role.id}`}
                    className="text-sm font-medium">
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.role?.id && (
              <p className="mt-1 text-sm text-red-500">
                {errors.role.id.message}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              Department
            </Label>
            <div className="grid gap-4">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center space-x-2">
                  <Checkbox
                    id={`department-${department.id}`}
                    checked={watch("department")?.id === department.id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValue("department", {
                          id: department.id,
                          name: department.name,
                        });
                      }
                    }}
                  />
                  <Label
                    htmlFor={`department-${department.id}`}
                    className="text-sm font-medium">
                    {department.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.department?.id && (
              <p className="mt-1 text-sm text-red-500">
                {errors.department.id.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(`/users`)}
            type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
