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
import { updateCategory, getCategoryById } from "@/actions/categories";
import {
  UpdateDocumentCategoryFormValues,
  updateDocumentCategorySchema,
} from "@/actions/categories.validation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define a type for the page params
interface PageParams {
  id: string;
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const categoryId = resolvedParams.id;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateDocumentCategoryFormValues>({
    resolver: zodResolver(updateDocumentCategorySchema),
    defaultValues: {
      id: "",
      name: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const categoryResponse = await getCategoryById(categoryId);

      if (categoryResponse.success) {
        reset({
          id: categoryResponse.category?.id,
          name: categoryResponse.category?.name,
        });
      } else {
        toast({
          title: "Failed to load category",
          description: categoryResponse.error,
        });
      }
    };
    fetchData();
  }, [categoryId, reset]);

  const onSubmit = async (data: UpdateDocumentCategoryFormValues) => {
    console.log("onSubmit called", data);
    setIsSubmitting(true);
    try {
      const result = await updateCategory({
        id: data.id,
        name: data.name,
        description: data.description,
      });

      if (result.success) {
        toast({
          title: "Category created successfully",
        });
        router.push("/categories");
      } else {
        toast({
          title: "Failed to create category",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Failed to create category",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader heading="Edit Category" text="Edit the category details">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4" />
              Back to Categorys
            </Link>
          </Button>
        </div>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter category name"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Category Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Enter category description"
              className="mt-1"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(`/categories/${categoryId}`)}
            type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Category"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
