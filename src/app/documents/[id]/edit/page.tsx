"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  documentSchema,
  type DocumentFormValues,
} from "@/actions/documents.validation";
import Link from "next/link";
import { ChevronLeft, FileQuestion } from "lucide-react";
import { SimplePdfViewer } from "../../../../components/pdf-components/simple-pdf-viewer";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { use } from "react";
import { getDocumentById } from "@/actions/documents";
import { getCategoriesForSelect } from "@/actions/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDepartmentsForSelect,
  getDocumentDepartmentsForSelect,
} from "@/actions/departments";

interface PageParams {
  id: string;
}

export default function EditDepartmentPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const documentId = resolvedParams.id;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [isOrganizationWide, setIsOrganizationWide] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      id: "",
      title: "",
      categoryId: undefined,
      departmentIds: [],

      description: "",

      isArchived: false,
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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTagsInput(inputValue);
  };

  const onSubmit = async (data: DocumentFormValues) => {
    console.log("Form submission data:", data);
    console.log("Selected departments:", selectedDepartments);
    console.log("Is organization wide:", isOrganizationWide);
    setIsSubmitting(true);

    // For updates without new file, we need a different approach
    if (!selectedFile && data.id) {
      // Update only metadata without new file
      try {
        const res = await fetch(`/api/documents/${data.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.title,
            description: data.description ?? "",
            categoryId: data.categoryId,
            departmentIds: data.departmentIds,
            isArchived: data.isArchived,
            expirationDate: data.expirationDate?.toISOString() as string,
            changeNote: data.changeNote,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          toast({
            title: "Error",
            description: result.error || "Failed to update document",
            variant: "destructive",
          });
          return;
        }

        if (result.success) {
          toast({ title: "Document updated successfully" });
          router.push("/documents");
        }
      } catch (err) {
        toast({
          title: "Update failed",
          description: "Try again",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For new uploads or updates with new file
    if (!selectedFile && !data.id) {
      toast({ title: "Please select a PDF file" });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    if (data.id) {
      formData.append("id", data.id as string);
    }
    formData.append("title", data.title as string);
    formData.append("description", data.description as string);

    formData.append("departmentIds", JSON.stringify(data.departmentIds));

    if (data.categoryId) {
      formData.append("categoryId", data.categoryId as string);
    }
    if (data.expirationDate) {
      formData.append(
        "expirationDate",
        data.expirationDate.toISOString() as string
      );
    }
    formData.append("isArchived", JSON.stringify(data.isArchived));
    formData.append("changeNote", data.changeNote as string);
    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error === "Duplicate document detected" && result.details) {
          toast({
            title: "Duplicate document detected",
            description: `This file already exists as "${result.details.title}" (version ${result.details.versionNumber})`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Something went wrong",
            variant: "destructive",
          });
        }
        return;
      }

      if (result.success) {
        toast({ title: data.id ? "Document updated" : "Document created" });
        router.push("/documents");
      } else {
        toast({
          title: "Error",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Try again",
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

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, categories } = await getCategoriesForSelect();
      if (success) {
        setCategories(categories ?? []);
      }
    };
    fetchCategories();
    const fetchDepartments = async () => {
      const { success, departments } = await getDepartmentsForSelect();
      if (success) {
        setDepartments(departments ?? []);
      }
    };
    const fetchDocumentDepartments = async () => {
      const { success, departments } = await getDocumentDepartmentsForSelect(
        documentId
      );
      if (success) {
        const departmentIds =
          departments?.map((department) => department.id) ?? [];
        setSelectedDepartments(departmentIds);
        setValue("departmentIds", departmentIds);
      }
    };
    fetchCategories();
    fetchDepartments();
    fetchDocumentDepartments();
    const fetchDocument = async () => {
      const { documents, success, error } = await getDocumentById(documentId);

      if (success && documents) {
        const document = documents[0];
        // search for latest version by versionNumber
        const currentVersion = document?.currentVersion ?? null;

        setValue("id", document.id);
        setValue("title", document.title);
        setSelectedCategory(document.categoryId ?? undefined);
        setValue("categoryId", document.categoryId ?? "");
        setValue("description", document.description ?? "");
        setTagsInput(document.tags.join(", "));
        setValue("isArchived", document.isArchived);
        setValue("expirationDate", currentVersion?.expirationDate ?? undefined);
        setFilePreviewUrl(currentVersion?.filePath ?? null);
        setValue("changeNote", currentVersion?.changeNote ?? "");
        // Set departments from document data if available
        if (document.departments && document.departments.length > 0) {
          const departmentIds = document.departments.map(
            (dept: any) => dept.id
          );
          setSelectedDepartments(departmentIds);
          setValue("departmentIds", departmentIds);
        }
      } else {
        toast({
          title: "Error",
          description: error || "Failed to load document",
          variant: "destructive",
        });
      }
    };

    fetchDocument();
  }, [documentId, reset]);

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
          <h1 className="text-xl font-semibold truncate">Edit Document</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/documents/${documentId}`)}
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
                <Label htmlFor="document">Upload New Document (Optional)</Label>
                <Input
                  id="document"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="mt-1"
                  required={false}
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Leave empty to update only document information without
                  changing the file
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        field.onChange(value);
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={`${category.id}`}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.categoryId.message}
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
                      date={field.value as Date}
                      setDate={field.onChange}
                    />
                  )}
                />
                {errors.expirationDate && (
                  <p className="text-sm text-red-500">
                    {String(errors.expirationDate.message)}
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
              <div className="space-y-2">
                <Label htmlFor="changeNote">Change Note</Label>
                <Textarea
                  id="changeNote"
                  {...register("changeNote")}
                  placeholder="Enter change note"
                  className="mt-1"
                  rows={4}
                />
              </div>
              {errors.changeNote && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.changeNote.message}
                </p>
              )}
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Document"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
