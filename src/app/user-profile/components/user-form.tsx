"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, Form, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  personSchema,
  type PersonFormValues,
} from "@/actions/persons.validation";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { updateUserProfile } from "@/actions/user-profile";

interface ModelType {
  id: string;
  nameEn: string;
  nameAr: string;
}

export function UserForm({
  initialData,
  jobTitles,
  units,
  sponsors,
  nationalities,
  ranks,
}: {
  initialData?: PersonFormValues | null;
  jobTitles: ModelType[];
  units: ModelType[];
  sponsors: ModelType[];
  nationalities: ModelType[];
  ranks: ModelType[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      userId: "",
      firstName: "",
      secondName: "",
      thirdName: "",
      lastName: "",
      gender: "Male",
      dob: new Date(),
      citizenship: "Civilian",
      nationalityId: undefined,
      noriqama: "",
      mrn: "",
      employeeNo: "",
      unitId: "",
      rankId: "",
      jobTitleId: undefined,
      sponsorId: "",
      pictureLink: "",
      cardExpiryAt: new Date(),
      lastRenewalAt: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    if (!jobTitles.length) return;
    if (!nationalities) return;

    form.reset({
      ...initialData,
      jobTitleId: initialData.jobTitleId || undefined,
      nationalityId: initialData.nationalityId || undefined,
      citizenship: initialData.citizenship || undefined,
    });
  }, [initialData, jobTitles.length, form]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    getValues,
    watch,
  } = form;

  const citizenship = watch("citizenship");

  // Determine if this is create or update mode
  const isUpdateMode =
    initialData?.id !== undefined && initialData?.id !== null;

  const onSubmit: SubmitHandler<PersonFormValues> = async (data) => {
    setIsSubmitting(true);

    try {
      // Get the file from the form
      const form = document.querySelector("form");
      const fileInput = form?.querySelector(
        "input[type=file]",
      ) as HTMLInputElement;

      // Create a FormData object
      const formData = new FormData();

      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append the file if it exists
      if (fileInput?.files?.[0]) {
        formData.append("file", fileInput.files[0]);
      }

      console.log("Submitting form data...", formData);
      const result = await updateUserProfile(formData);
      console.log("Submission result:", result);

      if (result.success) {
        toast({
          title: isUpdateMode
            ? "User profile updated successfully"
            : "User profile created successfully",
        });
        // Refresh the page to show update form if it was a create
        if (!isUpdateMode) {
          router.refresh();
        }
      } else {
        toast({
          title: isUpdateMode
            ? "Failed to update user profile"
            : "Failed to create user profile",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error saving user profile:", error);
      toast({
        title: isUpdateMode
          ? "Failed to update user profile"
          : "Failed to create user profile",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <form
      onSubmit={handleSubmit(
        (data) => {
          console.log("Form submitted with data:", data);
          return onSubmit(data);
        },
        (errors) => {
          console.log("Form validation errors:", errors);
        },
      )}>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* First Row */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="Enter first name"
              className="mt-1"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* <div className="space-y-2">
                <Label htmlFor="secondName">Second Name</Label>
                <Input
                  id="secondName"
                  {...register("secondName")}
                  placeholder="Enter second name"
                  className="mt-1"
                />
                {errors.secondName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.secondName.message}
                  </p>
                )}
              </div> */}

          {/* <div className="space-y-2">
                <Label htmlFor="thirdName">Third Name</Label>
                <Input
                  id="thirdName"
                  {...register("thirdName")}
                  placeholder="Enter third name"
                  className="mt-1"
                />
                {errors.thirdName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.thirdName.message}
                  </p>
                )}
              </div> */}

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Enter last name"
              className="mt-1"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Second Row */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <DatePicker
                  date={field.value || new Date()}
                  setDate={field.onChange}
                />
              )}
            />
            {errors.dob && (
              <p className="text-sm text-red-500">{errors.dob.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Controller
              name="jobTitleId"
              control={control}
              render={({ field }) => (
                <Select
                  key={`${field.value}-${jobTitles.length}`}
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select job title" />
                  </SelectTrigger>
                  <SelectContent className="">
                    {jobTitles.map((jobTitle: ModelType) => (
                      <SelectItem key={jobTitle.id} value={jobTitle.id}>
                        {jobTitle.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.jobTitleId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.jobTitleId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeno">Employee Number</Label>
            <Input
              id="employeeno"
              {...register("employeeNo")}
              placeholder="Enter Employee number"
              className="mt-1"
            />
            {errors.employeeNo && (
              <p className="mt-1 text-sm text-red-500">
                {errors.employeeNo.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="citizenship">Citizenship</Label>
            <Controller
              name="citizenship"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select citizenship" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="Civilian">Civilian</SelectItem>
                    <SelectItem value="Foreigner">Foreigner</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.citizenship && (
              <p className="mt-1 text-sm text-red-500">
                {errors.citizenship.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="noriqama">National / Iqama Number</Label>
            <Input
              id="noriqama"
              {...register("noriqama")}
              placeholder="Enter national/iqama number"
              className="mt-1"
            />
            {errors.noriqama && (
              <p className="mt-1 text-sm text-red-500">
                {errors.noriqama.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Controller
              name="nationalityId"
              control={control}
              render={({ field }) => (
                <Select
                  key={`${field.value}-${nationalities.length}`}
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalities.map((nationality: ModelType) => (
                      <SelectItem key={nationality.id} value={nationality.id}>
                        {nationality.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.nationalityId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.nationalityId.message}
              </p>
            )}
          </div>

          {citizenship === "Foreigner" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sponsor">Sponsor</Label>
                <Controller
                  name="sponsorId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sponsor" />
                      </SelectTrigger>
                      <SelectContent>
                        {sponsors.map((sponsor: ModelType) => (
                          <SelectItem key={sponsor.id} value={sponsor.id}>
                            {sponsor.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sponsorId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.sponsorId.message}
                  </p>
                )}
              </div>
            </>
          )}

          {citizenship === "Other" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mrn">MRN</Label>
                <Input
                  id="mrn"
                  {...register("mrn")}
                  placeholder="Enter mrn"
                  className="mt-1"
                />
                {errors.mrn && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mrn.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank">Rank</Label>
                <Controller
                  name="rankId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {ranks.map((rank: ModelType) => (
                          <SelectItem key={rank.id} value={rank.id}>
                            {rank.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.rankId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.rankId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Controller
                  name="unitId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit: ModelType) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unitId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.unitId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeNo">Employee Number</Label>
                <Input
                  id="employeeNo"
                  {...register("employeeNo")}
                  placeholder="Enter employee number"
                  className="mt-1"
                />
                {errors.employeeNo && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.employeeNo.message}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 mt-4">
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="mr-2">
            Cancel
          </Button>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isUpdateMode
              ? "Updating..."
              : "Creating..."
            : isUpdateMode
              ? "Update User Profile"
              : "Create User Profile"}
        </Button>
      </CardFooter>
    </form>
  );
}
