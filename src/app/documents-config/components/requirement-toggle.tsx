"use client";

import { updateCertificateRequirement } from "@/actions/document-configs";
import { useState, useEffect } from "react";
import { DocumentConfigFormValues } from "@/actions/document-configs.validation";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function RequirementToggle({ jobId, catId, initialData }: any) {
  const [isRequired, setIsRequired] = useState(
    initialData?.isRequired || false,
  );
  const [requiresExpiry, setRequiresExpiry] = useState(
    initialData?.requiresExpiry || false,
  );
  const router = useRouter();

  const handleChange = async (mandatory: boolean, expiry: boolean) => {
    const payload: DocumentConfigFormValues = {
      jobTitleId: jobId,
      documentCategoryId: catId,
      isRequired: mandatory,
      requiresExpiry: expiry,
      isActive: true,
    };

    try {
      const result = await updateCertificateRequirement(payload);

      if (result.success) {
        toast({
          title: "Certificate requirement updated successfully",
        });
        // router.push("/documents-config");
      } else {
        toast({
          title: "Failed to update certificate requirement",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Failed to update certificate requirement",
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 text-xs">
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(e) => {
            setIsRequired(e.target.checked);
            handleChange(e.target.checked, requiresExpiry);
          }}
        />
        Required
      </label>
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={requiresExpiry}
          onChange={(e) => {
            setRequiresExpiry(e.target.checked);
            handleChange(isRequired, e.target.checked);
          }}
        />
        Has Expiry
      </label>
    </div>
  );
}
