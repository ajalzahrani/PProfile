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
import { updateDepartment, getDepartmentById } from "@/actions/departments";
import {
  DepartmentFormValues,
  departmentSchema,
} from "@/actions/departments.validation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define a type for the page params
interface PageParams {
  id: string;
}

export default function EditDepartmentPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const departmentId = resolvedParams.id;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      id: "",
      name: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const departmentResponse = await getDepartmentById(departmentId);

      if (departmentResponse.success) {
        reset({
          id: departmentResponse.department?.id,
          name: departmentResponse.department?.name,
        });
      } else {
        toast({
          title: "Failed to load department",
          description: departmentResponse.error,
        });
      }
    };
    fetchData();
  }, [departmentId, reset]);

  const onSubmit = async (data: DepartmentFormValues) => {
    console.log("onSubmit called", data);
    setIsSubmitting(true);
    try {
      const formDataInstance = new FormData();
      formDataInstance.append("name", data.name);

      const result = await updateDepartment(departmentId, {
        id: data.id,
        name: data.name,
      });

      if (result.success) {
        toast({
          title: "Department created successfully",
        });
        router.push("/departments");
      } else {
        toast({
          title: "Failed to create department",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Failed to create department",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader heading="Edit Department" text="Edit the department details">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/departments">
              <ArrowLeft className="h-4 w-4" />
              Back to Departments
            </Link>
          </Button>
        </div>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter department name"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(`/departments/${departmentId}`)}
            type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Department"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
