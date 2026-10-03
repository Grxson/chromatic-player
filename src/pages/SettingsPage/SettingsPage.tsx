import type { AudioQuality } from "@/stores";
import { usePlayerStore } from "@/stores/player.store";
import { useSettingsStore } from "@/stores/settings.store";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Slider } from "@/components/common/Slider";
import { Toggle } from "@/components/common/Toggle";

export function SettingsPage() {
  const {
    animations,
    setAnimations,
    discordPresence,
    setDiscordPresence,
    sidebarCollapsed,
    setSidebarCollapsed,
    audioQuality,
    setAudioQuality,
  } = useSettingsStore();

  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);

  return (
    <>
      <Header
        eyebrow="Preferences"
        title="Settings"
        subtitle="Tweak the experience for the current session."
      />
      <Content>
        <div className="mx-auto max-w-2xl space-y-10">
          <SettingsGroup title="Appearance" description="Theme and visual rhythm.">
            <Row label="Theme">
              <span className="text-sm text-[var(--color-text-secondary)]">Chromatic Dark</span>
            </Row>
            <Row label="Animations">
              <Toggle checked={animations} onChange={setAnimations} />
            </Row>
            <Row label="Collapse sidebar">
              <Toggle checked={sidebarCollapsed} onChange={setSidebarCollapsed} />
            </Row>
          </SettingsGroup>

          <SettingsGroup title="Playback" description="Audio preferences.">
            <Row label="Volume">
              <div className="w-48">
                <Slider
                  ariaLabel="Volume"
                  value={volume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={setVolume}
                />
              </div>
            </Row>
            <Row label="Audio quality">
              <select
                value={audioQuality}
                onChange={(event) => setAudioQuality(event.target.value as AudioQuality)}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-text-secondary)]"
              >
                <option value="LOW">Low</option>
                <option value="HIGH">High</option>
                <option value="LOSSLESS">Lossless</option>
                <option value="MAX">Max</option>
              </select>
            </Row>
          </SettingsGroup>

          <SettingsGroup title="Experience" description="Optional integrations.">
            <Row label="Discord Rich Presence">
              <div className="flex items-center gap-3">
                <Toggle checked={discordPresence} onChange={setDiscordPresence} disabled />
                <span className="text-xs text-[var(--color-text-muted)]">Coming later</span>
              </div>
            </Row>
          </SettingsGroup>
        </div>
      </Content>
    </>
  );
}

function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      <div className="space-y-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
      {children}
    </div>
  );
}
