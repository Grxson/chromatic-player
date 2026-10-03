import { Search } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";

export function SearchPage() {
  return (
    <>
      <Header title="Search" subtitle="Find tracks, albums, artists and playlists." />
      <Content>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
            <Search size={20} aria-hidden="true" />
          </div>
          <h2 className="text-base text-[var(--color-text-primary)]">
            Search arrives with the Core Player release
          </h2>
          <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
            The search input and live results will be wired to the MusicProvider once the TIDAL
            integration is enabled.
          </p>
        </div>
      </Content>
    </>
  );
}
