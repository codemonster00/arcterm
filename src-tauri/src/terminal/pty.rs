use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
use tokio::sync::mpsc;

use crate::ssh::session::SessionManager;

#[derive(Clone, serde::Serialize)]
struct TerminalOutputEvent {
    #[serde(rename = "sessionId")]
    session_id: String,
    data: Vec<u8>,
}

#[derive(Clone, serde::Serialize)]
struct SessionStatusEvent {
    #[serde(rename = "sessionId")]
    session_id: String,
    status: String,
    message: Option<String>,
}

pub fn spawn_data_reader(
    app: AppHandle,
    session_id: String,
    data_rx: Arc<Mutex<mpsc::UnboundedReceiver<Vec<u8>>>>,
    session_manager: Arc<SessionManager>,
) {
    let sid = session_id.clone();
    tokio::spawn(async move {
        let mut rx = data_rx.lock().await;
        while let Some(data) = rx.recv().await {
            let _ = app.emit(
                "terminal-output",
                TerminalOutputEvent {
                    session_id: sid.clone(),
                    data,
                },
            );
        }
        // Channel closed — session disconnected
        let _ = app.emit(
            "session-status",
            SessionStatusEvent {
                session_id: sid.clone(),
                status: "disconnected".to_string(),
                message: Some("Connection closed".to_string()),
            },
        );
        session_manager.remove_session(&sid).await;
    });
}
