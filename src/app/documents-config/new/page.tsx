"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { createDepartment } from "@/actions/departments";
import {
  documentConfigSchema,
  type DocumentConfigFormValues,
} from "@/actions/document-configs.validation";
import { DepartmentFormValues } from "@/actions/departments.validation";
import { departmentSchema } from "@/actions/departments.validation";

export default function NewDocumentConfigPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentConfigFormValues>({
    resolver: zodResolver(documentConfigSchema),
    defaultValues: {
      jobTitleId: "",
      documentCategoryId: "",
      isRequired: false,
      requiresExpiry: false,
      isActive: true,
    },
  });

  const onSubmit = async (data: DocumentConfigFormValues) => {
    console.log("onSubmit called", data);
    // setIsSubmitting(true);
    // try {
    //   const result = await createDepartment({
    //     name: data.name,
    //   });

    //   if (result.success) {
    //     toast({
    //       title: "Department created successfully",
    //     });
    //     router.push("/departments");
    //   } else {
    //     toast({
    //       title: "Failed to create department",
    //       description: result.error,
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error creating department:", error);
    //   toast({
    //     title: "Failed to create department",
    //     description: "Please try again.",
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <PageShell>
      <PageHeader heading="Create Department" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="jobTitleId"
              {...register("jobTitleId")}
              placeholder="Enter department name"
              className="mt-1"
            />
            {errors.jobTitleId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.jobTitleId.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/departments")}
            type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Department"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
