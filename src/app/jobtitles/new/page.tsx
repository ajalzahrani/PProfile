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
import { createJobTitle } from "@/actions/jobtitles";
import {
  jobTitleSchema,
  type JobTitleFormValues,
} from "@/actions/jobtitles.validation";

export default function NewJobTitlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobTitleFormValues>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
    },
  });

  const onSubmit = async (data: JobTitleFormValues) => {
    console.log("onSubmit called", data);
    setIsSubmitting(true);
    try {
      const result = await createJobTitle({
        nameEn: data.nameEn,
        nameAr: data.nameAr,
      });

      if (result.success) {
        toast({
          title: "JobTitle created successfully",
        });
        router.push("/jobtitles");
      } else {
        toast({
          title: "Failed to create jobTitle",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error creating jobTitle:", error);
      toast({
        title: "Failed to create jobTitle",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader heading="Create JobTitle" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">JobTitle Name</Label>
            <Input
              id="nameEn"
              {...register("nameEn")}
              placeholder="Enter English Name"
              className="mt-1"
            />
            {errors.nameEn && (
              <p className="mt-1 text-sm text-red-500">
                {errors.nameEn.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameAr">JobTitle Name (Arabic)</Label>
            <Input
              id="nameAr"
              {...register("nameAr")}
              placeholder="Enter Arabic Name"
              className="mt-1"
            />
            {errors.nameAr && (
              <p className="mt-1 text-sm text-red-500">
                {errors.nameAr.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/jobtitles")}
            type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create JobTitle"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
