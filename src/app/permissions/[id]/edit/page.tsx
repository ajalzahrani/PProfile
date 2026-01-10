"use client";

import { use, useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getPermissionById, updatePermission } from "@/actions/permissions";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";

const permissionFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;

interface PageParams {
  id: string;
}

export default function EditPermissionPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const permissionId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  // Fetch role and permissions when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        // Fetch all available permissions
        const permissionsResponse = await getPermissionById(permissionId);
        if (permissionsResponse.success) {
          const permission = permissionsResponse.permission;

          form.reset({
            code: permission?.code || "",
            name: permission?.name || "",
            description: permission?.description || "",
          });
        }
      } catch (err) {
        console.error("Error loading permission:", err);
        setError("An unexpected error occurred while loading permission");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [permissionId, form, toast]);

  const onSubmit = async (data: PermissionFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // First update the permission basic info
      const permissionUpdateResult = await updatePermission(permissionId, {
        code: data.code,
        name: data.name,
        description: data.description,
      });

      if (!permissionUpdateResult.success) {
        setError(permissionUpdateResult.error || "Failed to update permission");
        toast({
          variant: "destructive",
          title: "Error",
          description:
            permissionUpdateResult.error || "Failed to update permission",
        });
      }

      toast({
        title: "Permission updated",
        description: "Permission updated successfully",
      });

      router.push(`/permissions`);
    } catch (err) {
      console.error("Error updating permission:", err);
      setError("An unexpected error occurred while updating permission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader heading="Edit Permission" text="Edit a permission" />
      <Card>
        <CardHeader>
          <CardTitle>Permission Information</CardTitle>
          <CardDescription>
            Create a new permission that can be assigned to roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. view:users" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use format like &quot;action:resource&quot; (e.g.
                        view:users, edit:occurrences)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter permission name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A human-readable name for this permission
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter permission description"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description explaining what this permission
                        allows
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push("/permissions")}
                  type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Editing..." : "Edit Permission"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
