import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DocumentsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // Redirect to the dynamic route with the current user's ID
  redirect(`/user-documents/${currentUser.id}`);
}
