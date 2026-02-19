#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;
mod ssh;
mod terminal;

fn main() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ssh::session::SessionManager::new())
        .manage(config::profiles::ProfileStore::new())
        .invoke_handler(tauri::generate_handler![
            commands::connect,
            commands::disconnect,
            commands::send_input,
            commands::resize_terminal,
            commands::list_sessions,
            commands::save_profile,
            commands::get_profiles,
            commands::delete_profile,
            commands::test_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
