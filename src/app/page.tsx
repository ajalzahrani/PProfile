import { SearchPanel } from "./searchs/components/search-panel";

export default async function LandingPage() {
  return (
    <div className="flex flex-col p-6">
      <SearchPanel />
    </div>
  );
}
