import React, { useState } from 'react';
import LogEditor from './LogEditor';

function formatDate(dateStr) {
  // dateStr is YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatEditedAt(ts) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isEdited(log) {
  // updatedAt is > createdAt by more than 2 seconds (mongoose timestamps are close on creation)
  return new Date(log.updatedAt) - new Date(log.createdAt) > 2000;
}

export default function LogCard({ log, onUpdate }) {
  const [editing, setEditing] = useState(false);

  async function handleSave(content) {
    await onUpdate(log._id, content);
    setEditing(false);
  }

  const today = new Date().toISOString().split('T')[0];
  const isToday = log.date === today;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.dateLabel}>{formatDate(log.date)}</span>
          {isToday && <span className="badge badge-green" style={{ fontSize: 10 }}>Today</span>}
        </div>
        {!editing && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12 }}
            onClick={() => setEditing(true)}
          >
            ✎ Edit
          </button>
        )}
      </div>

      {editing ? (
        <LogEditor
          initialContent={log.content}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          label="Update log"
        />
      ) : (
        <>
          <p style={styles.content}>{log.content}</p>
          {isEdited(log) && (
            <p style={styles.editedNote}>
              ✎ Edited on {formatEditedAt(log.updatedAt)}
            </p>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'border-color 0.15s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: '500',
  },
  content: {
    fontSize: '13px',
    lineHeight: '1.75',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
  },
  editedNote: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
};
