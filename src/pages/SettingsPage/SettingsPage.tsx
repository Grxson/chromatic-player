import type { AudioQuality } from "@/stores";
import { useAuthStore } from "@/stores/auth.store";
import { useMusicAuthProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
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
  const playback = usePlayback();
  const authProvider = useMusicAuthProvider();
  const authStatus = useAuthStore((state) => state.status ?? "initializing");
  const authUserId = useAuthStore((state) => state.userId);
  const authError = useAuthStore((state) => state.error);

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

          <SettingsGroup title="Account" description="Catalogue connection status.">
            {authProvider.name === "mock-auth" ? (
              <Row label="Catalogue">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Offline mock data
                </span>
              </Row>
            ) : (
              <>
                <Row label="TIDAL">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {authStatus === "initializing"
                      ? "Checking session…"
                      : authStatus === "authenticating"
                        ? "Connecting…"
                        : authStatus === "authenticated"
                          ? `Connected${authUserId ? ` · ${authUserId}` : ""}`
                          : authStatus === "error"
                            ? "Connection issue"
                            : "Not connected"}
                  </span>
                </Row>
                {authError ? (
                  <p role="alert" className="text-xs text-[var(--color-text-muted)]">
                    {authError}
                  </p>
                ) : null}
                <div className="flex justify-end">
                  {authStatus === "authenticated" ? (
                    <button
                      type="button"
                      onClick={() => void authProvider.logout()}
                      className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={authStatus === "initializing" || authStatus === "authenticating"}
                      onClick={() => void authProvider.login().catch(() => undefined)}
                      className="rounded-md bg-[var(--color-album-accent)] px-3 py-2 text-sm font-medium text-[var(--color-canvas)] disabled:opacity-50"
                    >
                      Connect TIDAL
                    </button>
                  )}
                </div>
              </>
            )}
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
                  onChange={(value) => void playback.setVolume(value)}
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
              <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                Applies when TIDAL playback is available.
              </span>
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
