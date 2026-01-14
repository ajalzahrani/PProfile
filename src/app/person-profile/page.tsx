import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./components/profile-form";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  const person = await prisma.person.findFirst({
    where: { userId: user?.id },
    include: { jobTitle: true },
  });

  const jobTitles = await prisma.jobTitle.findMany({
    select: { id: true, nameEn: true },
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Personal Information</h1>
        <p className="text-muted-foreground">
          Please provide your professional details to complete registration.
        </p>
      </div>

      <ProfileForm initialData={person} jobTitles={jobTitles} />
    </div>
  );
}
