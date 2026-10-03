import { Library } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";

export function LibraryPage() {
  return (
    <>
      <Header title="Library" subtitle="Saved albums, followed artists and your playlists." />
      <Content>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
            <Library size={20} aria-hidden="true" />
          </div>
          <h2 className="text-base text-[var(--color-text-primary)]">
            Your library will appear here
          </h2>
          <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
            Liked tracks, saved albums and followed artists will show up once authentication and
            persistence are enabled.
          </p>
        </div>
      </Content>
    </>
  );
}
