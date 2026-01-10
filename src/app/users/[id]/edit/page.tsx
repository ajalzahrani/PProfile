"use client";

import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { getUserById, updateUser } from "@/actions/users";
import { getRoles } from "@/actions/roles";
import { getDepartments } from "@/actions/departments";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RoleFormValues } from "@/actions/roles.validation";
import { DepartmentFormValues } from "@/actions/departments.validation";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import {
  UserFormValuesWithRolesAndDepartments,
  userFormSchema,
} from "@/actions/users.validations";

// Define a type for the page params
interface PageParams {
  id: string;
}

export default function EditUserPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const userId = resolvedParams.id;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleFormValues[]>([]);
  const [departments, setDepartments] = useState<DepartmentFormValues[]>([]);

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
      id: "",
      name: "",
      username: "",
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

  // Watch role and department values
  const selectedRole = watch("role");
  const selectedDepartment = watch("department");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles
        const rolesResponse = await getRoles();
        if (rolesResponse.success) {
          setRoles(rolesResponse.roles as RoleFormValues[]);
        } else {
          toast({
            title: "Error",
            description: rolesResponse.error || "Failed to load roles",
          });
        }

        // Fetch departments
        const departmentsResponse = await getDepartments();
        if (departmentsResponse.success) {
          setDepartments(
            departmentsResponse.departments as DepartmentFormValues[]
          );
        } else {
          toast({
            title: "Error",
            description:
              departmentsResponse.error || "Failed to load departments",
          });
        }

        // Fetch user data
        const userResponse = await getUserById(userId);
        if (userResponse.success) {
          const user = userResponse.user;
          reset({
            id: user?.id,
            name: user?.name || "",
            username: user?.username || "",
            email: user?.email || "",
            password: "", // Empty password field for security
            role: {
              id: user?.role?.id || "",
              name: user?.role?.name || "",
              description: user?.role?.description || "",
            },
            department: {
              id: user?.department?.id || "",
              name: user?.department?.name || "",
            },
          });
        } else {
          toast({
            title: "Error",
            description: userResponse.error || "Failed to load user data",
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading data",
        });
      }
    };

    fetchData();
  }, [userId, reset]);

  const onSubmit = async (data: UserFormValuesWithRolesAndDepartments) => {
    setIsSubmitting(true);
    try {
      const result = await updateUser(userId, data);
      if (result.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        router.push("/users");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update user",
        });
      }
    } catch (err) {
      console.error("Error updating user:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader heading="Edit User" text="Edit user details">
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
                    checked={selectedRole?.id === role.id}
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
                  <div className="flex flex-col">
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-medium">
                      {role.name}
                    </Label>
                    <Label htmlFor={`role-${role.description}`}>
                      {role.description}
                    </Label>
                  </div>
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
                    checked={selectedDepartment?.id === department.id}
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
            {isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
