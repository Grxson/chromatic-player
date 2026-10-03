// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Application entry point. Kept intentionally minimal during the
/// foundation phase — the desktop shell does not expose any custom
/// commands yet. Future Rust responsibilities (filesystem, secure
/// storage, media keys, MPRIS, Windows Media Session, ...) will be
/// added here without growing the UI surface.
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
