"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Switch } from "@/components/ui/swtich";
import {
  documentSchema,
  type DocumentFormValues,
} from "@/actions/documents.validation";
import Link from "next/link";
import { ChevronLeft, FileQuestion } from "lucide-react";
import { SimplePdfViewer } from "../../../components/pdf-components/simple-pdf-viewer";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { getCategoriesForSelect } from "@/actions/categories";
import { getDepartmentsForSelect } from "@/actions/departments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentScopeDialog } from "../components/document-scope";

export default function NewDocumentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isOrganizationWide, setIsOrganizationWide] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, categories } = await getCategoriesForSelect();
      if (success) {
        setCategories(categories ?? []);
      }
    };
    const fetchDepartments = async () => {
      const { success, departments } = await getDepartmentsForSelect();
      if (success) {
        setDepartments(departments ?? []);
      }
    };
    fetchCategories();
    fetchDepartments();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      categoryId: undefined,
      departmentIds: [],
      isOrganizationWide: false,
      description: "",
      tags: [],
      isArchived: false,
      documentStatus: "DRAFT",
      expirationDate: undefined,
      changeNote: "",
    },
  });

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleDepartmentChange = (departmentIds: string[]) => {
    setSelectedDepartments(departmentIds);
    setValue("departmentIds", departmentIds);
  };

  const handleOrganizationWideChange = (isOrgWide: boolean) => {
    setIsOrganizationWide(isOrgWide);
    setValue("isOrganizationWide", isOrgWide);
    if (isOrgWide) {
      // Clear selected departments when organization-wide is enabled
      setSelectedDepartments([]);
      setValue("departmentIds", []);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTagsInput(inputValue);

    const tagsArray = inputValue
      ? inputValue
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    setValue("tags", tagsArray);
  };

  const onSubmit = async (data: DocumentFormValues) => {
    setIsSubmitting(true);

    if (!selectedFile) {
      toast({ title: "Please select a PDF file" });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", data.title);
    formData.append("categoryId", data.categoryId ?? "");
    formData.append("description", data.description ?? "");

    // Append departmentIds as JSON for multi-select
    formData.append("departmentIds", JSON.stringify(data.departmentIds ?? []));
    formData.append(
      "isOrganizationWide",
      JSON.stringify(data.isOrganizationWide)
    );

    formData.append("tags", JSON.stringify(data.tags));
    if (data.expirationDate) {
      formData.append("expirationDate", data.expirationDate.toISOString());
    }
    formData.append("isArchived", JSON.stringify(data.isArchived));

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      let result: any = null;
      let rawText: string | null = null;
      try {
        result = await res.json();
      } catch (_) {
        try {
          rawText = await res.text();
        } catch (_) {
          rawText = null;
        }
      }

      if (!res.ok) {
        const errorText = result?.error || rawText || "Something went wrong";
        if (
          result?.error === "Duplicate document detected" &&
          result?.details
        ) {
          toast({
            title: "Duplicate document detected",
            description: `This file already exists as "${result.details.title}" (version ${result.details.versionNumber})`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `${errorText} (status ${res.status})`,
            variant: "destructive",
          });
        }
        return;
      }

      if (result.success) {
        toast({ title: "Document created" });
        router.push("/documents");
      } else {
        toast({
          title: "Error",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err?.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the file preview
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      setSelectedFile(file);

      // Try to set title from filename if empty
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const titleInput = document.getElementById("title") as HTMLInputElement;
      if (titleInput && !titleInput.value) {
        setValue("title", fileName);
      }
    } else {
      setFilePreviewUrl(null);
      setSelectedFile(null);
    }
  };

  return (
    <div className="w-screen min-h-screen">
      {/* Top navigation bar */}
      <div className="bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/documents"
            className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Documents
          </Link>
          <h1 className="text-xl font-semibold truncate">Create Document</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/documents")}
            type="button">
            Cancel
          </Button>
        </div>
      </div>

      {/* Main content - Three column layout */}
      <div className="flex w-full h-[calc(100vh-4rem)]">
        {/* PDF Viewer - 2/3 width */}
        <div className="w-2/3 border-r border-gray-200">
          {filePreviewUrl ? (
            <SimplePdfViewer fileUrl={filePreviewUrl} className="h-full" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
              <FileQuestion size={64} strokeWidth={1} />
              <p className="mt-4">Upload a PDF file to preview</p>
            </div>
          )}
        </div>

        {/* Form - 1/3 width */}
        <div className="w-1/3 p-6 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
            className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <Input
                  id="document"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="mt-1"
                  required
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter document title"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter document description"
                  className="mt-1"
                  rows={4}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Controller
                  name="expirationDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value as unknown as Date}
                      setDate={field.onChange}
                    />
                  )}
                />
                {errors.expirationDate && (
                  <p className="text-sm text-red-500">
                    {errors.expirationDate.message}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <Label htmlFor="expirationDate">Category</Label>
                <Select
                  value={selectedCategory ?? ""}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setValue("categoryId", value);
                  }}>
                  <SelectTrigger className="h-8 w-full min-w-[200px] mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={`${category.id}`}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">
                    {errors.categoryId?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentScope">Document Scope</Label>
                <DocumentScopeDialog
                  departments={departments ?? []}
                  selectedDepartmentIds={selectedDepartments}
                  setSelectedDepartmentIds={handleDepartmentChange}
                  isOrganizationWide={isOrganizationWide}
                  setIsOrganizationWide={handleOrganizationWideChange}
                />
                {isOrganizationWide ? (
                  <p className="mt-1 text-sm text-blue-600">
                    Organization-wide access enabled
                  </p>
                ) : (
                  selectedDepartments.length > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedDepartments.length} departments selected
                    </p>
                  )
                )}
                {errors.departmentIds && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.departmentIds.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={handleTagsChange}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1"
                />
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.tags.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isArchived" className="cursor-pointer">
                    Is Archived
                  </Label>
                  <input
                    type="checkbox"
                    id="isArchived"
                    {...register("isArchived")}
                    className="h-4 w-4"
                  />
                </div>
                {errors.isArchived && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.isArchived.message}
                  </p>
                )}
              </div>
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Document"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
