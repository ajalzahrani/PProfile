"use client";

import { updateCertificateRequirement } from "@/actions/document-configs";
import { useState } from "react";
import { DocumentConfigFormValues } from "@/actions/document-configs.validation";
import { toast } from "@/components/ui/use-toast";

export function RequirementToggle({ jobId, catId, initialData }: any) {
  const [isRequired, setIsRequired] = useState(
    initialData?.isRequired || false,
  );
  const [requiresExpiry, setRequiresExpiry] = useState(
    initialData?.requiresExpiry || false,
  );
  const [isActive, setIsActive] = useState(initialData?.isActive || false);

  const handleChange = async (
    mandatory: boolean,
    expiry: boolean,
    isActive: boolean,
  ) => {
    const payload: DocumentConfigFormValues = {
      jobTitleId: jobId,
      documentCategoryId: catId,
      isRequired: mandatory,
      requiresExpiry: expiry,
      isActive,
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
    <div className="flex flex-col gap-2 text-xs">
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(e) => {
            setIsRequired(e.target.checked);
            handleChange(e.target.checked, requiresExpiry, isActive);
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
            handleChange(isRequired, e.target.checked, isActive);
          }}
        />
        Has Expiry
      </label>
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => {
            setIsActive(e.target.checked);
            if (e.target.checked === false) {
              console.log("state :", e.target.checked);
              setIsRequired(false);
              setRequiresExpiry(false);
              handleChange(
                e.target.checked,
                e.target.checked,
                e.target.checked,
              );
            } else {
              handleChange(isRequired, requiresExpiry, e.target.checked);
            }
          }}
        />
        Active
      </label>
    </div>
  );
}
