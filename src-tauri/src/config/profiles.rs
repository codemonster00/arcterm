use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionProfile {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    #[serde(rename = "authMethod")]
    pub auth_method: String,
    pub password: Option<String>,
    #[serde(rename = "keyPath")]
    pub key_path: Option<String>,
    pub passphrase: Option<String>,
    #[serde(rename = "colorTag")]
    pub color_tag: Option<String>,
    pub group: Option<String>,
}

pub struct ProfileStore {
    profiles: Mutex<Vec<ConnectionProfile>>,
}

impl ProfileStore {
    pub fn new() -> Self {
        let profiles = Self::load_from_disk().unwrap_or_default();
        Self {
            profiles: Mutex::new(profiles),
        }
    }

    fn config_path() -> PathBuf {
        let mut path = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("arcterm");
        std::fs::create_dir_all(&path).ok();
        path.push("profiles.json");
        path
    }

    fn load_from_disk() -> Result<Vec<ConnectionProfile>, String> {
        let path = Self::config_path();
        if !path.exists() {
            return Ok(Vec::new());
        }
        let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).map_err(|e| e.to_string())
    }

    fn save_to_disk(profiles: &[ConnectionProfile]) -> Result<(), String> {
        let path = Self::config_path();
        let data = serde_json::to_string_pretty(profiles).map_err(|e| e.to_string())?;
        std::fs::write(&path, data).map_err(|e| e.to_string())
    }

    pub fn get_all(&self) -> Vec<ConnectionProfile> {
        self.profiles.lock().unwrap().clone()
    }

    pub fn save(&self, profile: ConnectionProfile) -> Result<(), String> {
        let mut profiles = self.profiles.lock().unwrap();
        if let Some(existing) = profiles.iter_mut().find(|p| p.id == profile.id) {
            *existing = profile;
        } else {
            profiles.push(profile);
        }
        Self::save_to_disk(&profiles)
    }

    pub fn delete(&self, id: &str) -> Result<(), String> {
        let mut profiles = self.profiles.lock().unwrap();
        profiles.retain(|p| p.id != id);
        Self::save_to_disk(&profiles)
    }
}
