use russh::client::{Handle, Msg};
use russh::Channel;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

use super::connection::ClientHandler;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub id: String,
    #[serde(rename = "profileName")]
    pub profile_name: String,
    pub host: String,
    pub username: String,
    pub status: String,
    #[serde(rename = "connectedAt")]
    pub connected_at: Option<u64>,
}

pub struct ActiveSession {
    pub info: SessionInfo,
    pub handle: Handle<ClientHandler>,
    pub channel: Channel<Msg>,
    pub data_rx: Arc<Mutex<mpsc::UnboundedReceiver<Vec<u8>>>>,
}

pub struct SessionManager {
    pub sessions: Arc<Mutex<HashMap<String, ActiveSession>>>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn generate_id() -> String {
        Uuid::new_v4().to_string()
    }

    pub async fn add_session(
        &self,
        id: String,
        profile_name: String,
        host: String,
        username: String,
        handle: Handle<ClientHandler>,
        channel: Channel<Msg>,
        data_rx: Arc<Mutex<mpsc::UnboundedReceiver<Vec<u8>>>>,
    ) {
        let session = ActiveSession {
            info: SessionInfo {
                id: id.clone(),
                profile_name,
                host,
                username,
                status: "connected".to_string(),
                connected_at: Some(
                    std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap()
                        .as_millis() as u64,
                ),
            },
            handle,
            channel,
            data_rx,
        };
        self.sessions.lock().await.insert(id, session);
    }

    pub async fn remove_session(&self, id: &str) -> Option<ActiveSession> {
        self.sessions.lock().await.remove(id)
    }

    pub async fn list_sessions(&self) -> Vec<SessionInfo> {
        self.sessions
            .lock()
            .await
            .values()
            .map(|s| s.info.clone())
            .collect()
    }
}
