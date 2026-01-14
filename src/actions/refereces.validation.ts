import { z } from "zod";

const jobTitleSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
});
type JobTitleFormValues = z.infer<typeof jobTitleSchema>;

export { jobTitleSchema, type JobTitleFormValues };
