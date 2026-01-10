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
import { getRoleById, updateRole } from "@/actions/roles";
import { RoleFormValues, roleSchema } from "@/actions/roles.validation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { getPermissions, getPermissionsByRoleId } from "@/actions/permissions";
import { PermissionFormValues } from "@/actions/permissions.validation";

interface PageParams {
  id: string;
}

export default function EditRolePage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const roleId = resolvedParams.id;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<PermissionFormValues[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all available permissions
        const permissionsResponse = await getPermissions();
        if (permissionsResponse.success) {
          setPermissions(
            permissionsResponse.permissions as PermissionFormValues[]
          );
        }

        // Fetch role data
        const roleResponse = await getRoleById(roleId);
        if (roleResponse.success) {
          const role = roleResponse.role;
          reset({
            id: role?.id || undefined,
            name: role?.name || "",
            description: role?.description || "",
          });

          // Fetch role permissions
          const rolePermissionsData = await getPermissionsByRoleId(roleId);
          if (rolePermissionsData.success && rolePermissionsData.permissions) {
            setSelectedPermissions(
              rolePermissionsData.permissions.map((p: any) => p.id)
            );
          }
        } else {
          toast({
            title: "Failed to load role",
            description: roleResponse.error,
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading data",
        });
      }
    };
    fetchData();
  }, [roleId, reset]);

  // Group permissions by category
  const groupedPermissions = permissions.reduce(
    (groups: Record<string, PermissionFormValues[]>, permission) => {
      const category = permission.code.split(":")[0] || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    },
    {}
  );

  const sortedCategories = Object.keys(groupedPermissions).sort();

  const onSubmit = async (data: RoleFormValues) => {
    setIsSubmitting(true);
    try {
      // Update role basic info
      const roleResult = await updateRole(roleId, data, selectedPermissions);

      if (!roleResult.success) {
        toast({
          title: "Failed to update role",
          description: roleResult.error,
        });
        return;
      } else {
        toast({
          title: "Role updated successfully",
        });
        router.push("/roles");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      if (checked) {
        return [...prev, permissionId];
      } else {
        return prev.filter((id) => id !== permissionId);
      }
    });
  };

  return (
    <PageShell>
      <PageHeader
        heading="Edit Role"
        text="Edit the role details and permissions">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/roles">
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </Link>
          </Button>
        </div>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter role name"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter role description"
              className="mt-1"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Permissions</Label>
            {sortedCategories.map((category) => (
              <div key={category} className="space-y-4">
                <h4 className="text-sm font-medium capitalize">
                  {category} Permissions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedPermissions[category].map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(
                          permission.id || ""
                        )}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            permission.id || "",
                            checked as boolean
                          )
                        }
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-medium cursor-pointer">
                          {permission.name}
                        </Label>
                        {permission.description && (
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/roles")}
            type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Role"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
