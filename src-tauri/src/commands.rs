use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};

use crate::config::profiles::{ConnectionProfile, ProfileStore};
use crate::ssh::auth::AuthCredential;
use crate::ssh::connection::SshConnection;
use crate::ssh::session::{SessionInfo, SessionManager};
use crate::terminal::pty;

#[derive(Clone, serde::Serialize)]
struct SessionStatusEvent {
    #[serde(rename = "sessionId")]
    session_id: String,
    status: String,
    message: Option<String>,
}

#[tauri::command]
pub async fn connect(
    app: AppHandle,
    profile: ConnectionProfile,
    session_mgr: State<'_, SessionManager>,
) -> Result<String, String> {
    let session_id = SessionManager::generate_id();

    // Emit connecting status
    let _ = app.emit(
        "session-status",
        SessionStatusEvent {
            session_id: session_id.clone(),
            status: "connecting".to_string(),
            message: None,
        },
    );

    // Establish SSH connection
    let (mut handle, data_rx) =
        SshConnection::establish(&profile.host, profile.port, 10).await?;

    // Authenticate
    let credential = if profile.auth_method == "key" {
        AuthCredential::KeyFile {
            path: profile.key_path.unwrap_or_default(),
            passphrase: profile.passphrase.clone(),
        }
    } else {
        AuthCredential::Password(profile.password.unwrap_or_default())
    };

    let auth_ok = credential.authenticate(&mut handle, &profile.username).await?;
    if !auth_ok {
        return Err("Authentication failed".to_string());
    }

    // Open channel and request PTY
    let mut channel = handle
        .channel_open_session()
        .await
        .map_err(|e| format!("Failed to open channel: {}", e))?;

    SshConnection::request_pty(&mut channel, 80, 24).await?;

    // Store session
    let sm: &SessionManager = &session_mgr;
    let sessions_arc = sm.sessions.clone();

    sm.add_session(
        session_id.clone(),
        profile.name.clone(),
        profile.host.clone(),
        profile.username.clone(),
        handle,
        channel,
        data_rx,
    )
    .await;

    // Get the data_rx from the stored session and spawn reader
    let sessions = sessions_arc.lock().await;
    if let Some(session) = sessions.get(&session_id) {
        let data_rx = session.data_rx.clone();
        let sm_arc = Arc::new(SessionManager {
            sessions: sessions_arc.clone(),
        });
        drop(sessions);
        pty::spawn_data_reader(app.clone(), session_id.clone(), data_rx, sm_arc);
    }

    // Emit connected status
    let _ = app.emit(
        "session-status",
        SessionStatusEvent {
            session_id: session_id.clone(),
            status: "connected".to_string(),
            message: None,
        },
    );

    Ok(session_id)
}

#[tauri::command]
pub async fn disconnect(
    session_id: String,
    session_mgr: State<'_, SessionManager>,
) -> Result<(), String> {
    if let Some(session) = session_mgr.remove_session(&session_id).await {
        let _ = session
            .handle
            .disconnect(russh::Disconnect::ByApplication, "", "")
            .await;
    }
    Ok(())
}

#[tauri::command]
pub async fn send_input(
    session_id: String,
    data: String,
    session_mgr: State<'_, SessionManager>,
) -> Result<(), String> {
    let mut sessions = session_mgr.sessions.lock().await;
    if let Some(session) = sessions.get_mut(&session_id) {
        session
            .channel
            .data(data.as_bytes())
            .await
            .map_err(|e| format!("Send failed: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn resize_terminal(
    session_id: String,
    cols: u32,
    rows: u32,
    session_mgr: State<'_, SessionManager>,
) -> Result<(), String> {
    let mut sessions = session_mgr.sessions.lock().await;
    if let Some(session) = sessions.get_mut(&session_id) {
        session
            .channel
            .window_change(cols, rows, 0, 0)
            .await
            .map_err(|e| format!("Resize failed: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn list_sessions(
    session_mgr: State<'_, SessionManager>,
) -> Result<Vec<SessionInfo>, String> {
    Ok(session_mgr.list_sessions().await)
}

#[tauri::command]
pub async fn save_profile(
    profile: ConnectionProfile,
    store: State<'_, ProfileStore>,
) -> Result<(), String> {
    store.save(profile)
}

#[tauri::command]
pub async fn get_profiles(store: State<'_, ProfileStore>) -> Result<Vec<ConnectionProfile>, String> {
    Ok(store.get_all())
}

#[tauri::command]
pub async fn delete_profile(id: String, store: State<'_, ProfileStore>) -> Result<(), String> {
    store.delete(&id)
}

#[tauri::command]
pub async fn test_connection(profile: ConnectionProfile) -> Result<String, String> {
    let (mut handle, _data_rx) =
        SshConnection::establish(&profile.host, profile.port, 5).await?;

    let credential = if profile.auth_method == "key" {
        AuthCredential::KeyFile {
            path: profile.key_path.unwrap_or_default(),
            passphrase: profile.passphrase.clone(),
        }
    } else {
        AuthCredential::Password(profile.password.unwrap_or_default())
    };

    let auth_ok = credential.authenticate(&mut handle, &profile.username).await?;
    if auth_ok {
        let _ = handle
            .disconnect(russh::Disconnect::ByApplication, "", "")
            .await;
        Ok("Connection successful!".to_string())
    } else {
        Err("Authentication failed".to_string())
    }
}
