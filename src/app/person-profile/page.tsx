import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./components/profile-form";
import { getItems } from "@/actions/refereces";
import { getPersonById } from "@/actions/persons";
import { PersonFormValues } from "@/actions/persons.validation";
import { checkServerPermission } from "@/lib/server-permissions";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

export default async function PersonProfilePage() {
  await checkServerPermission("manage:profiles");

  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  const personResult = await getPersonById(user.id);

  if (!personResult.success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Personal Information</h1>
        </div>
      </div>
    );
  }

  const person = personResult.person;

  const personObject: PersonFormValues = {
    userId: user.id,
    firstName: person?.firstName || "",
    lastName: person?.lastName || "",
    gender: (person?.gender as "Male" | "Female") || "Male",
    dob: person?.dob ? new Date(person.dob) : new Date(),
    citizenship:
      (person?.citizenship as "Civilian" | "Foreigner" | "Other") || "Civilian",
    noriqama: person?.noriqama || "",
    jobTitleId: person?.jobTitleId || "",
    cardExpiryAt: person?.cardExpiryAt
      ? new Date(person.cardExpiryAt)
      : new Date(),
    isActive: person?.isActive || false,
    id: person?.id,
    secondName: person?.secondName || undefined,
    thirdName: person?.thirdName,
    nationalityId: person?.nationalityId || undefined,
    mrn: person?.mrn || "",
    employeeNo: person?.employeeNo,
    unitId: person?.unitId || undefined,
    rankId: person?.rankId || undefined,
    sponsorId: person?.sponsorId || undefined,
    pictureLink: person?.pictureLink || undefined,
    lastRenewalAt: person?.lastRenewalAt
      ? new Date(person.lastRenewalAt)
      : undefined,
  };

  const [jobTitles, units, sponsors, nationalities, ranks] = await Promise.all([
    getItems("jobTitle"),
    getItems("unit"),
    getItems("sponsor"),
    getItems("nationality"),
    getItems("rank"),
  ]);

  return (
    <PageShell>
      <PageHeader
        heading="Profile Update"
        text="Update your personal information"></PageHeader>
      <ProfileForm
        initialData={personObject}
        jobTitles={jobTitles.data}
        units={units.data}
        sponsors={sponsors.data}
        nationalities={nationalities.data}
        ranks={ranks.data}
      />
    </PageShell>
  );
}
