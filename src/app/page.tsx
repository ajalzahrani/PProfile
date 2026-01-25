import { SearchPanel } from "./searchs/components/search-panel";
import LoginPage from "./(auth)/login/page";

export default async function LandingPage() {
  return (
    <div className="flex flex-col p-6">
      <LoginPage />
    </div>
  );
}
