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

    async fn channel_open_confirmation(
        &mut self,
        _channel: russh::ChannelId,
        _max_packet_size: u32,
        _window_size: u32,
        _session: &mut client::Session,
    ) -> Result<(), Self::Error> {
        log::debug!("Channel open confirmed");
        Ok(())
    }

    async fn data(
        &mut self,
        _channel: russh::ChannelId,
        data: &[u8],
        _session: &mut client::Session,
    ) -> Result<(), Self::Error> {
        log::debug!("SSH data received: {} bytes", data.len());
        let _ = self.data_tx.send(data.to_vec());
        Ok(())
    }

    async fn extended_data(
        &mut self,
        _channel: russh::ChannelId,
        _ext: u32,
        data: &[u8],
        _session: &mut client::Session,
    ) -> Result<(), Self::Error> {
        log::debug!("SSH extended data received: {} bytes", data.len());
        // Send stderr data as well
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
        // Request PTY and wait for confirmation
        channel
            .request_pty(true, "xterm-256color", cols, rows, 0, 0, &[])
            .await
            .map_err(|e| format!("PTY request failed: {}", e))?;

        // Request shell and wait for confirmation  
        channel
            .request_shell(true)
            .await
            .map_err(|e| format!("Shell request failed: {}", e))?;

        Ok(())
    }
}
