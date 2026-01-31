"use client";

import { updateCertificateRequirement } from "@/actions/document-configs";
import { useState } from "react";
import { DocumentConfigFormValues } from "@/actions/document-configs.validation";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
      <Label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={isRequired}
          onCheckedChange={(checked) => {
            const isChecked = checked === true;
            setIsRequired(isChecked);
            handleChange(isChecked, requiresExpiry, isActive);
          }}
        />
        Required
      </Label>
      <Label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={requiresExpiry}
          onCheckedChange={(checked) => {
            const isChecked = checked === true;
            setRequiresExpiry(isChecked);
            handleChange(isRequired, isChecked, isActive);
          }}
        />
        Has Expiry
      </Label>
      <Label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={isActive}
          onCheckedChange={(checked) => {
            const isChecked = checked === true;
            setIsActive(isChecked);
            if (!isChecked) {
              setIsRequired(false);
              setRequiresExpiry(false);
              handleChange(false, false, false);
            } else {
              handleChange(isRequired, requiresExpiry, isChecked);
            }
          }}
        />
        Active
      </Label>
    </div>
  );
}
