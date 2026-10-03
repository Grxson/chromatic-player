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

  // The current volume lives on the PlayerStore because it is live
  // playback state, not a persistent preference.
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);

  return (
    <>
      <Header title="Settings" subtitle="Preferences for the current session." />
      <Content>
        <div className="mx-auto max-w-2xl space-y-8">
          <Group title="Playback">
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
          </Group>

          <Group title="Interface">
            <Row label="Animations">
              <Toggle checked={animations} onChange={setAnimations} />
            </Row>
            <Row label="Collapse sidebar">
              <Toggle checked={sidebarCollapsed} onChange={setSidebarCollapsed} />
            </Row>
          </Group>

          <Group title="Integrations">
            <Row label="Discord Rich Presence">
              <div className="flex items-center gap-3">
                <Toggle checked={discordPresence} onChange={setDiscordPresence} disabled />
                <span className="text-xs text-[var(--color-text-muted)]">Coming soon</span>
              </div>
            </Row>
          </Group>
        </div>
      </Content>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
      {children}
    </div>
  );
}
