import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCategoryById } from "@/actions/categories";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const categoryId = (await params).id;

  // Get category by ID
  const category = await getCategoryById(categoryId);

  console.log(category);

  if (!category) {
    notFound();
  }

  return (
    <PageShell>
      <PageHeader
        heading={`${category.category?.name} Category`}
        text="Manage category">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/categories">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/categories/${categoryId}/edit`}>Edit Category</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            {category.category?.name}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            {category.category?.description || "No description provided."}
          </CardHeader>
        </Card>
      </div>
    </PageShell>
  );
}
