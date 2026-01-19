"use client";

import { updateCertificateRequirement } from "@/actions/document-configs";
import { useState, useEffect } from "react";

export function RequirementToggle({ jobId, catId, initialData }: any) {
  const [isRequired, setIsRequired] = useState(
    initialData?.isRequired || false
  );
  const [requiresExpiry, setRequiresExpiry] = useState(
    initialData?.requiresExpiry || false
  );

  // useEffect(() => {
  //   console.log(initialData);
  // }, []);

  const handleChange = async (mandatory: boolean, expiry: boolean) => {
    const formData = new FormData();
    formData.append("jobTitleId", jobId);
    formData.append("categoryId", catId);
    formData.append("isRequired", String(mandatory));
    formData.append("requiresExpiry", String(expiry));

    await updateCertificateRequirement(formData);
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
