import { z } from "zod";

// Permission schema for validation
export const personSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  firstName: z.string().min(2, "First name is required"),
  secondName: z.string().optional().nullable(),
  thirdName: z.string().optional().nullable(),
  lastName: z.string().min(2, "Last name is required"),
  gender: z.enum(["Male", "Female"], {
    required_error: "Gender is required",
  }),
  dob: z.date({
    required_error: "Date of birth is required",
  }),
  citizenship: z.enum(["Civilian", "Foreigner", "Other"], {
    required_error: "Citizenship is required",
  }),
  noriqama: z.string().min(1, "National/Iqama number is required"),
  mrn: z.string().optional().nullable(),
  employeeNo: z.string().optional().nullable(),
  nationalityId: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),
  rankId: z.string().optional().nullable(),
  jobTitleId: z.string().min(1, "Job title is required"),
  sponsorId: z.string().optional().nullable(),
  pictureLink: z.string().optional().nullable(),
  cardExpiryAt: z.date({
    required_error: "Card expiry date is required",
  }),
  lastRenewalAt: z.date().optional(),
  isActive: z.boolean(),
});

export type PersonFormValues = z.infer<typeof personSchema>;
