import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getPersonById } from "@/actions/persons";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const person = await getPersonById(session.user.id);

  if (!person) {
    notFound();
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <PageShell>
      <PageHeader
        heading={`${person.person?.firstName} ${person.person?.lastName}`}
        text="Person Details">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/persons">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Persons
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/persons/${person.person?.id}/edit`}>Edit Person</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={person.person?.pictureLink || undefined}
                  alt={`${person.person?.firstName} ${person.person?.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(
                    person.person?.firstName || "",
                    person.person?.lastName || "",
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {person.person?.firstName} {person.person?.secondName}{" "}
                  {person.person?.thirdName} {person.person?.lastName}
                </h2>
                {person.person?.jobTitle && (
                  <p className="text-muted-foreground">
                    {person.person.jobTitle.nameEn}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </dt>
                    <dd>
                      {person.person?.dob
                        ? new Date(person.person.dob).toLocaleDateString()
                        : "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Gender
                    </dt>
                    <dd>{person.person?.gender}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          {/* Citizenship Information */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">Citizenship Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Citizenship
                    </dt>
                    <dd>{person.person?.citizenship}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Nationality
                    </dt>
                    <dd>{person.person?.nationality?.nameEn || ""}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      National/Iqama Number
                    </dt>
                    <dd>{person.person?.noriqama}</dd>
                  </div>
                </dl>
                <dl>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Sponsor
                    </dt>
                    <dd>{person.person?.sponsor?.nameEn || "Not specified"}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">Employment Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Employee Number
                    </dt>
                    <dd>{person.person?.employeeNo || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Medical Record Number
                    </dt>
                    <dd>{person.person?.mrn || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Unit
                    </dt>
                    <dd>{person.person?.unit?.nameEn || "Not specified"}</dd>
                  </div>
                </dl>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Rank
                    </dt>
                    <dd>{person.person?.rank?.nameEn || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Job Title
                    </dt>
                    <dd>
                      {person.person?.jobTitle?.nameEn || "Not specified"}
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          {/* Card Information */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">Card Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Card Expiry Date
                    </dt>
                    <dd>
                      {new Date(
                        person.person?.cardExpiryAt || "",
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Last Renewal Date
                    </dt>
                    <dd>
                      {person.person?.lastRenewalAt
                        ? new Date(
                            person.person.lastRenewalAt,
                          ).toLocaleDateString()
                        : "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd>
                      <Badge
                        variant={
                          person.person?.isActive ? "default" : "secondary"
                        }>
                        {person.person?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
