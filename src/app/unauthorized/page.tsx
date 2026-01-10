import { HomeButton } from "./components/home-button";

export default function Unauthorized() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Unauthorized Access
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <HomeButton />
      </div>
    </div>
  );
}
