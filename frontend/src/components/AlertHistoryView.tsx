import React, { useState } from 'react';
import { History, Filter, Search, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Alert } from '../types';

interface AlertHistoryViewProps {
  alerts: Alert[];
  isLoading: boolean;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const AlertHistoryView: React.FC<AlertHistoryViewProps> = ({
  alerts,
  isLoading,
  onAcknowledge,
  onResolve,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.zoneName.toLowerCase().includes(q) ||
        a.zoneCode.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="metric-status-tag critical">● CRITICAL</span>;
      case 'HIGH':
        return <span className="metric-status-tag high">▲ HIGH</span>;
      case 'MEDIUM':
        return <span className="metric-status-tag warning">● WARNING</span>;
      default:
        return <span className="metric-status-tag safe">SAFE</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span style={{ color: '#dc2626', fontWeight: 700 }}>● Active</span>;
      case 'ACKNOWLEDGED':
        return <span style={{ color: '#d97706', fontWeight: 600 }}>◐ Acknowledged</span>;
      case 'RESOLVED':
        return <span style={{ color: '#059669', fontWeight: 600 }}>✓ Resolved</span>;
      default:
        return <span style={{ color: '#64748b' }}>Expired</span>;
    }
  };

  return (
    <div className="card" style={{ gap: '1.25rem' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <History size={20} color="var(--brand-primary)" />
            Disaster Alert Log & Warning History
          </h2>
          <p className="card-subtitle">
            Auditable trail of early warnings, threshold crossing incidents, and hazard responses
          </p>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          Showing {filtered.length} of {alerts.length} Records
        </span>
      </div>

      {/* Filter Controls */}
      <div className="heatmap-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
            }}
          >
            <Search size={14} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search location, code, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.82rem', width: '190px' }}
            />
          </div>

          {/* Severity filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Warning</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="ACTIVE">Active Alerts</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* History Data Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>Timestamp</th>
              <th style={{ width: '180px' }}>Sector / Location</th>
              <th>Alert Title & Details</th>
              <th style={{ width: '110px' }}>Severity</th>
              <th style={{ width: '120px' }}>Status</th>
              <th style={{ width: '140px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                  No alert records match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600 }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.85rem' }}>{a.zoneName}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{a.zoneCode}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '420px' }}>
                      {a.message}
                    </div>
                  </td>
                  <td>{getSeverityBadge(a.severity)}</td>
                  <td>{getStatusBadge(a.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {a.status === 'ACTIVE' && (
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="btn-outline"
                          onClick={() => onAcknowledge(a.id)}
                          title="Acknowledge Alert"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Ack
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() => onResolve(a.id)}
                          title="Resolve Alert"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                    {a.status === 'ACKNOWLEDGED' && (
                      <button
                        className="btn-outline"
                        onClick={() => onResolve(a.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Resolve
                      </button>
                    )}
                    {a.status === 'RESOLVED' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Archived</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
