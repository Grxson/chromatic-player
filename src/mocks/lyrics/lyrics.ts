/**
 * Mock lyrics for the prototype. Completely fictional, never based on
 * real copyrighted material. Each entry is keyed by `trackId` and
 * contains a small list of plain prose lines that resemble lyrics
 * without belonging to any actual song.
 *
 * Lines are intentionally short and ambient. They exist so the
 * Fullscreen Player can demonstrate the lyric layout before the
 * real lyrics integration lands in a later release.
 */
export interface MockLyrics {
  trackId: string;
  lines: string[];
}

export const MOCK_LYRICS: Record<string, string[]> = {
  "track-slow-light": [
    "The room holds on to what it knows",
    "and the light arrives in pieces",
    "Slow light on the walls",
    "Slow light on the ground",
    "We let the day decide for us",
    "How much of it to keep around",
  ],
  "track-drift-theory": [
    "Somewhere between the wires",
    "the signal finds a way",
    "Drifting past the doorway",
    "Drifting past the day",
    "If nothing holds its shape",
    "then nothing gets to stay",
  ],
  "track-velvet-echo": [
    "Velvet echo, soft return",
    "the song's wind is slow to turn",
    "What was here is here again",
    "what was thin is thin and then",
    "Velvet echo, velvet hum",
    "we were always on the run",
  ],
  "track-amber-hymn": [
    "Amber hymn for the ones who leave",
    "amber hymn for the ones who stay",
    "The dawn forgets the names we made",
    "and keeps the shapes we threw away",
  ],
  "track-hollow-lullaby": [
    "Hollow lullaby on the radio",
    "humming low where the streetlamps go",
    "Soft surrender, soft refrain",
    "no-one awake to sing the gain",
    "Hollow lullaby, hold me close",
    "long enough to feel the ghosts",
  ],
  "track-quiet-room": [
    "Quiet room, quieter mind",
    "no-one to remind us what to find",
    "The curtains pull the day away",
    "and the dust remembers where to stay",
  ],
  "track-cold-hour": [
    "The cold hour folds itself in two",
    "and waits for something warm to do",
    "Outside the snow forgets the lines",
    "and writes a quieter set of signs",
  ],
  "track-paper-sky": [
    "Paper sky over paper ground",
    "everything rustles, nothing is sound",
    "We drew the maps we were supposed to",
    "and followed them right out of view",
  ],
  "track-low-tide": [
    "Low tide, slow retreat",
    "the boats forget their mooring",
    "Salt on the window glass",
    "salt on the morning",
    "Low tide, slow release",
    "the day begins its touring",
  ],
  "track-soft-engine": [
    "Soft engine, easier pace",
    "no need to win the whole race",
    "The road remembers every bend",
    "and learns to be the longer friend",
  ],
  "track-night-form": [
    "Night form, take a shape",
    "something we can drape",
    "over the windowsill",
    "over the hill",
    "Night form, hold the line",
    "long enough to feel like mine",
  ],
  "track-late-train": [
    "Late train, late station",
    "the city folds in",
    "Strangers at the windows",
    "no-one knows the bin",
    "Where the morning goes to",
    "when the evening ends",
    "Late train, slow station",
    "and the slow amends",
  ],
  "track-pale-water": [
    "Pale water on the floor",
    "pale water by the door",
    "Pale water where we stood",
    "where the evening understood",
    "Pale water, pale refrain",
    "we will sing the same again",
  ],
  "track-slow-thread": [
    "Slow thread between the hours",
    "Slow thread between the doors",
    "It holds the room together",
    "while the quiet slowly soars",
  ],
  "track-grey-signal": [
    "Grey signal through the wall",
    "Grey signal through the hall",
    "It's a small and honest frequency",
    "asking nothing much at all",
  ],
  "track-room-noise": [
    "Room noise, evening hum",
    "patient as a drum",
    "Soft insistence, soft return",
    "until the lamps learn to burn",
  ],
  "track-paper-bell": [
    "Paper bell, paper tongue",
    "every sound is half-young",
    "Fold the day into a square",
    "and keep it in a drawer somewhere",
  ],
  "track-cold-letter": [
    "Cold letter on the desk",
    "Cold letter in the drawer",
    "Cold letter is a colder friend",
    "than the one I'm looking for",
  ],
  "track-still-water": [
    "Still water, still reflection",
    "no current, no affection",
    "Just the shape of what was there",
    "still as an unanswered question",
  ],
  "track-low-room": [
    "Low room, lower light",
    "the windows give up early",
    "Low room, longer evening",
    "the evening is too wordy",
  ],
  "track-pale-mountain": [
    "Pale mountain in the haze",
    "pale mountain for days",
    "It doesn't move, it doesn't mind",
    "the roads that lose their ways",
  ],
  "track-soft-exit": [
    "Soft exit through the door",
    "leave a key, leave a drawer",
    "Soft exit, slower footsteps",
    "softer than before",
  ],
  "track-quiet-river": [
    "Quiet river, quiet bend",
    "it takes a while to mend",
    "Quiet river, quiet stone",
    "quiet as a dial tone",
  ],
  "track-cold-room": [
    "Cold room, colder breath",
    "nothing much to test",
    "Cold room, longer morning",
    "and the slowest of the rest",
  ],
  "track-paper-window": [
    "Paper window, paper view",
    "everything is faint and new",
    "Paper window, paper sky",
    "paper everything goes by",
  ],
  "track-grey-mountain": [
    "Grey mountain, grey horizon",
    "the morning is a slow surprising",
    "Grey mountain, grey refrain",
    "we will sing the same again",
  ],
  "track-pale-engine": [
    "Pale engine on the line",
    "pale engine, soft decline",
    "We don't need to get there yet",
    "we don't need to look behind",
  ],
  "track-slow-signal": [
    "Slow signal through the wires",
    "Slow signal through the air",
    "It carries almost nothing",
    "but it always gets somewhere",
  ],
  "track-grey-letter": [
    "Grey letter, grey envelope",
    "everything inside is drenched in hope",
    "Grey letter on a wooden floor",
    "we have read it twice before",
  ],
  "track-cold-room-2": [
    "Cold room again, cold room",
    "the radiator is not assuming",
    "Cold room, the sound of snow",
    "is the same one we've been losing",
  ],
};

export function lyricsFor(trackId: string): string[] | null {
  return MOCK_LYRICS[trackId] ?? null;
}
