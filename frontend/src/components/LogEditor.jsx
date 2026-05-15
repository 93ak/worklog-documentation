import React, { useState, useEffect } from 'react';

/**
 * Reusable textarea editor for creating or editing a log entry.
 * Props:
 *   initialContent  – pre-fill for edit mode
 *   onSave(content) – async callback; parent handles API call
 *   onCancel()      – called when user dismisses
 *   label           – button label (default "Save log")
 */
export default function LogEditor({ initialContent = '', onSave, onCancel, label = 'Save log' }) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const charCount = content.trim().length;

  async function handleSave() {
    if (!content.trim()) {
      setError('Log content cannot be empty.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(content.trim());
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.wrap}>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Describe what you worked on today…"
        style={{ marginBottom: 0 }}
        autoFocus
      />
      <div style={styles.footer}>
        <span style={styles.charCount}>{charCount} chars</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {onCancel && (
            <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || charCount === 0}>
            {saving ? (
              <>
                <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                Saving…
              </>
            ) : (
              label
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  charCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
};
