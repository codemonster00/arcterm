use russh_keys::load_secret_key;
use std::path::Path;
use std::sync::Arc;

pub enum AuthCredential {
    Password(String),
    KeyFile {
        path: String,
        passphrase: Option<String>,
    },
}

impl AuthCredential {
    pub async fn authenticate(
        &self,
        session: &mut russh::client::Handle<super::connection::ClientHandler>,
        username: &str,
    ) -> Result<bool, String> {
        match self {
            AuthCredential::Password(password) => {
                session
                    .authenticate_password(username, password)
                    .await
                    .map_err(|e| format!("Password auth failed: {}", e))
            }
            AuthCredential::KeyFile { path, passphrase } => {
                let expanded = shellexpand_path(path);
                let key = load_secret_key(Path::new(&expanded), passphrase.as_deref())
                    .map_err(|e| format!("Failed to load key '{}': {}", path, e))?;
                session
                    .authenticate_publickey(username, Arc::new(key))
                    .await
                    .map_err(|e| format!("Key auth failed: {}", e))
            }
        }
    }
}

fn shellexpand_path(path: &str) -> String {
    if path.starts_with("~/") {
        if let Some(home) = dirs::home_dir() {
            return format!("{}{}", home.display(), &path[1..]);
        }
    }
    path.to_string()
}
