import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Activity, 
  Monitor, 
  Download, 
  Upload,
  Database,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Session } from '../lib/types';

interface ConnectionStats {
  bytesReceived: number;
  bytesSent: number;
  latency: number;
  uptime: number;
  encoding: string;
  terminalSize: { cols: number; rows: number };
}

interface EnhancedStatusBarProps {
  session?: Session;
}

export function EnhancedStatusBar({ session }: EnhancedStatusBarProps) {
  const [stats, setStats] = useState<ConnectionStats>({
    bytesReceived: 0,
    bytesSent: 0,
    latency: 0,
    uptime: 0,
    encoding: 'UTF-8',
    terminalSize: { cols: 80, rows: 24 }
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update connection stats (mock data for now - would be real in production)
  useEffect(() => {
    if (!session) return;

    const updateStats = () => {
      setStats(prev => ({
        ...prev,
        bytesReceived: prev.bytesReceived + Math.floor(Math.random() * 100),
        bytesSent: prev.bytesSent + Math.floor(Math.random() * 50),
        latency: 15 + Math.floor(Math.random() * 30), // 15-45ms
        uptime: session.connectedAt ? Date.now() - session.connectedAt : 0,
        terminalSize: { cols: 120, rows: 30 } // Would get from terminal
      }));
    };

    // Update stats every 5 seconds
    const statsTimer = setInterval(updateStats, 5000);
    updateStats(); // Initial update

    return () => clearInterval(statsTimer);
  }, [session]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUptime = (ms: number): string => {
    if (ms === 0) return '00:00:00';
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    if (!session) return <Database size={14} className="status-icon" />;
    
    switch (session.status) {
      case 'connected':
        return <CheckCircle size={14} className="status-icon connected" />;
      case 'connecting':
        return <Activity size={14} className="status-icon connecting" />;
      case 'disconnected':
        return <AlertCircle size={14} className="status-icon disconnected" />;
      default:
        return <WifiOff size={14} className="status-icon" />;
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 20) return 'var(--success)';
    if (latency < 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="enhanced-status-bar">
      <div className="status-section connection-info">
        {getStatusIcon()}
        {session ? (
          <>
            <span className="session-name">{session.profileName}</span>
            <span className="separator">•</span>
            <span className="host-info">{session.username}@{session.host}</span>
          </>
        ) : (
          <span className="no-session">No active session</span>
        )}
      </div>

      {session && session.status === 'connected' && (
        <>
          <div className="status-section uptime">
            <Clock size={14} />
            <span>{formatUptime(stats.uptime)}</span>
          </div>

          <div className="status-section latency">
            <Zap size={14} />
            <span style={{ color: getLatencyColor(stats.latency) }}>
              {stats.latency}ms
            </span>
          </div>

          <div className="status-section data-transfer">
            <div className="transfer-item">
              <Download size={12} />
              <span>{formatBytes(stats.bytesReceived)}</span>
            </div>
            <div className="transfer-item">
              <Upload size={12} />
              <span>{formatBytes(stats.bytesSent)}</span>
            </div>
          </div>

          <div className="status-section terminal-info">
            <Monitor size={14} />
            <span>{stats.terminalSize.cols}×{stats.terminalSize.rows}</span>
          </div>

          <div className="status-section encoding">
            <span className="encoding-label">{stats.encoding}</span>
          </div>
        </>
      )}

      <div className="status-section time">
        <Clock size={14} />
        <span>{currentTime.toLocaleTimeString()}</span>
      </div>

    </div>
  );
}