use async_trait::async_trait;
use russh::client::{self, Handler, Msg};
use russh::keys::ssh_key;
use russh::Channel;
use std::sync::Arc;
use tokio::sync::mpsc;

pub struct ClientHandler {
    pub data_tx: mpsc::UnboundedSender<Vec<u8>>,
}

#[async_trait]
impl Handler for ClientHandler {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &ssh_key::PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }

    async fn data(
        &mut self,
        _channel: russh::ChannelId,
        data: &[u8],
        _session: &mut client::Session,
    ) -> Result<(), Self::Error> {
        let _ = self.data_tx.send(data.to_vec());
        Ok(())
    }
}

pub struct SshConnection;

impl SshConnection {
    pub async fn establish(
        host: &str,
        port: u16,
        timeout_secs: u64,
    ) -> Result<(client::Handle<ClientHandler>, mpsc::UnboundedReceiver<Vec<u8>>), String> {
        let config = Arc::new(russh::client::Config {
            keepalive_interval: Some(std::time::Duration::from_secs(15)),
            keepalive_max: 3,
            ..Default::default()
        });

        let (data_tx, data_rx) = mpsc::unbounded_channel();
        let handler = ClientHandler { data_tx };

        let addr = format!("{}:{}", host, port);

        let handle = tokio::time::timeout(
            std::time::Duration::from_secs(timeout_secs),
            russh::client::connect(config, &addr, handler),
        )
        .await
        .map_err(|_| format!("Connection timeout after {}s", timeout_secs))?
        .map_err(|e| format!("Connection failed: {}", e))?;

        Ok((handle, data_rx))
    }

    pub async fn request_pty(
        channel: &mut Channel<Msg>,
        cols: u32,
        rows: u32,
    ) -> Result<(), String> {
        channel
            .request_pty(false, "xterm-256color", cols, rows, 0, 0, &[])
            .await
            .map_err(|e| format!("PTY request failed: {}", e))?;

        channel
            .request_shell(false)
            .await
            .map_err(|e| format!("Shell request failed: {}", e))?;

        Ok(())
    }
}
