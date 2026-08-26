'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { toast } from '@/lib/toast';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { adminApi } from '@/lib/api/client';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  ApiJobApplicationDetail,
  ApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/api/types';
import {
  IconArrowLeft,
  IconDownload,
  IconEdit,
  IconExternal,
  IconFileText,
  IconSpinner,
} from '@/components/admin/AdminIcons';
import {
  useAdminNavigationGuard,
  useRegisterNavigationGuard,
} from '@/lib/hooks/AdminNavigationGuard';
import { useDeleteDialog } from '@/lib/hooks/useDeleteDialog';

function formatTimelineDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatShortDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatExperience(years: number | null) {
  if (years === null) return null;
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  applied: 'under_review',
  under_review: 'shortlisted',
  shortlisted: 'interview',
  interview: 'selected',
};

type SpecItem = { label: string; value: ReactNode };

function SpecGrid({ items }: { items: SpecItem[] }) {
  return (
    <dl className="admin-app-spec">
      {items.map((item) => (
        <div key={item.label} className="admin-app-spec-item">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const { requestNavigation } = useAdminNavigationGuard();
  const { requestDelete, deleteDialog } = useDeleteDialog();
  const [app, setApp] = useState<ApiJobApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState<'view' | 'download' | null>(null);
  const [resumeOpened, setResumeOpened] = useState(false);
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [notesEditing, setNotesEditing] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const notesDirty = notes !== savedNotes;

  const revertNotes = useCallback(() => {
    setNotes(savedNotes);
    setNotesEditing(!savedNotes.trim());
  }, [savedNotes]);

  useRegisterNavigationGuard({
    enabled: Boolean(app),
    isDirty: () => notes !== savedNotes,
    reset: revertNotes,
    discard: revertNotes,
  });

  const loadApplication = useCallback(async () => {
    const id = Number(params.id);
    if (isNaN(id)) throw new Error('Invalid Application ID');
    const res = await adminApi.applications.getById(id);
    const data = res as { data: ApiJobApplicationDetail };
    setApp(data.data);
    const nextNotes = data.data.adminNotes ?? '';
    setNotes(nextNotes);
    setSavedNotes(nextNotes);
    setNotesEditing(!nextNotes.trim());
  }, [params.id]);

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadApplication();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load application';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [loadApplication]);

  const openResume = async (download: boolean) => {
    if (!app) return;
    setResumeLoading(download ? 'download' : 'view');
    try {
      const res = await adminApi.applications.getResumeUrl(app.id, download);
      const data = res as { data: { url: string } };
      window.open(data.data.url, '_blank', 'noopener,noreferrer');
      if (!download) setResumeOpened(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resume is currently unavailable');
    } finally {
      setResumeLoading(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!app || !notesDirty) return;
    setSavingNotes(true);
    try {
      await adminApi.applications.updateNotes(app.id, notes);
      setSavedNotes(notes);
      setNotesEditing(!notes.trim());
      toast.success('Notes saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelNotes = () => {
    setNotes(savedNotes);
    setNotesEditing(!savedNotes.trim());
  };

  const handleStartNotesEdit = () => {
    setNotes(savedNotes);
    setNotesEditing(true);
  };

  const changeStatus = async (status: ApplicationStatus, reason?: string) => {
    if (!app) return;
    setStatusBusy(true);
    try {
      const res = await adminApi.applications.updateStatus(app.id, { status, reason });
      const data = res as { data: ApiJobApplicationDetail };
      setApp(data.data);
      toast.success(`Status updated to ${APPLICATION_STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update status');
    } finally {
      setStatusBusy(false);
    }
  };

  const requestNotShortlisted = () => {
    if (!app) return;
    requestDelete({
      title: 'Mark Application as Not Shortlisted?',
      confirmLabel: 'Mark as Not Shortlisted',
      loadingLabel: 'Closing…',
      variant: 'warning',
      description: (
        <>
          This application will be closed and removed from the active application pipeline.
          The application will remain available in closed applications for historical reference.
        </>
      ),
      onConfirm: async () => {
        setStatusBusy(true);
        try {
          const res = await adminApi.applications.updateStatus(app.id, {
            status: 'not_shortlisted',
            reason: 'Marked as not shortlisted',
          });
          const data = res as { data: ApiJobApplicationDetail };
          setApp(data.data);
          toast.success('Application marked as not shortlisted and closed');
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Could not update status');
          throw err;
        } finally {
          setStatusBusy(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Application" description="Loading candidate details" />
        <div className="admin-content">
          <div className="admin-app-layout" aria-busy="true" aria-label="Loading application">
            <div className="admin-app-sheet">
              <div className="admin-app-spec">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="admin-app-spec-item">
                    <div className="admin-skeleton admin-skeleton-label" />
                    <div className="admin-skeleton admin-skeleton-cell" />
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-app-sheet admin-app-sheet--aside">
              <div className="admin-app-aside-section">
                <div className="admin-skeleton admin-skeleton-cell" style={{ height: 36 }} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !app) {
    return (
      <>
        <AdminPageHeader
          title="Application"
          description="Could not load this application"
          actions={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => requestNavigation('/admin/applications')}
            >
              <IconArrowLeft />
              Applications
            </button>
          }
        />
        <div className="admin-content">
          <div className="admin-panel">
            <div className="admin-app-state">
              <p className="admin-error">{error || 'Application not found'}</p>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setLoading(true);
                  loadApplication()
                    .catch((err) => {
                      const message = err instanceof Error ? err.message : 'Failed to load application';
                      setError(message);
                    })
                    .finally(() => setLoading(false));
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const experience = formatExperience(app.experienceYears);
  const closed = isClosedApplicationStatus(app.status);
  const nextStatus = NEXT_STATUS[app.status];

  const profileItems: SpecItem[] = [
    {
      label: 'Email',
      value: (
        <a className="admin-app-link" href={`mailto:${app.email}`}>
          {app.email}
        </a>
      ),
    },
    {
      label: 'Phone',
      value: (
        <a className="admin-app-link" href={`tel:${app.phone}`}>
          {app.phone}
        </a>
      ),
    },
    ...(app.currentCompany ? [{ label: 'Location', value: app.currentCompany }] : []),
    ...(experience ? [{ label: 'Experience', value: experience }] : []),
    ...(app.linkedinUrl
      ? [
          {
            label: 'LinkedIn',
            value: (
              <a
                className="admin-app-link"
                href={app.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View profile
                <IconExternal size={13} />
              </a>
            ),
          },
        ]
      : []),
    ...(app.portfolioUrl
      ? [
          {
            label: 'Portfolio',
            value: (
              <a
                className="admin-app-link"
                href={app.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open site
                <IconExternal size={13} />
              </a>
            ),
          },
        ]
      : []),
  ];

  const applicationItems: SpecItem[] = [
    { label: 'Job', value: app.jobTitle },
    { label: 'Job ID', value: `#${app.jobId}` },
    { label: 'Applied', value: formatShortDate(app.createdAt) },
    { label: 'Last updated', value: formatShortDate(app.updatedAt) },
    ...(app.closedAt ? [{ label: 'Closed', value: formatShortDate(app.closedAt) }] : []),
    ...(app.closedByName ? [{ label: 'Closed by', value: app.closedByName }] : []),
  ];

  return (
    <>
      <AdminPageHeader
        title={app.name}
        description={app.jobTitle}
        actions={
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => requestNavigation(`/admin/applications?jobId=${app.jobId}`)}
          >
            <IconArrowLeft />
            Applications
          </button>
        }
      />
      <div className="admin-content">
        <div className="admin-app-layout">
          <section className="admin-app-sheet" aria-label="Candidate profile">
            <div className="admin-app-sheet-head">
              <span className={`admin-badge admin-badge-status-${app.status}`}>
                {APPLICATION_STATUS_LABELS[app.status]}
              </span>
            </div>

            <SpecGrid items={profileItems} />

            <div className="admin-app-sheet-split" role="presentation" />

            <SpecGrid items={applicationItems} />

            {app.statusHistory.length > 0 && (
              <>
                <div className="admin-app-sheet-split" role="presentation" />
                <ol className="admin-app-timeline">
                  {app.statusHistory.map((entry) => (
                    <li key={entry.id} className="admin-app-timeline-item">
                      <div className="admin-app-timeline-marker" aria-hidden="true" />
                      <div className="admin-app-timeline-body">
                        <div className="admin-app-timeline-row">
                          <span className={`admin-badge admin-badge-status-${entry.newStatus}`}>
                            {APPLICATION_STATUS_LABELS[entry.newStatus]}
                          </span>
                          <time dateTime={entry.changedAt}>{formatTimelineDate(entry.changedAt)}</time>
                        </div>
                        {(entry.changedByName || entry.reason) && (
                          <p className="admin-app-timeline-note">
                            {[entry.changedByName, entry.reason].filter(Boolean).join(' - ')}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          <aside className="admin-app-sheet admin-app-sheet--aside" aria-label="Application actions">
            <div className="admin-app-aside-section">
              <p className="admin-app-aside-label">Status</p>

              <div className="admin-app-aside-actions">
                {nextStatus && !closed && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    disabled={statusBusy}
                    onClick={() => changeStatus(nextStatus)}
                  >
                    {nextStatus === 'selected'
                      ? 'Mark selected'
                      : `Move to ${APPLICATION_STATUS_LABELS[nextStatus]}`}
                  </button>
                )}
                {closed && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    disabled={statusBusy}
                    onClick={() => changeStatus('under_review', 'Reopened')}
                  >
                    Reopen
                  </button>
                )}
                {!closed && (
                  <>
                    <div className="admin-field admin-app-status-field">
                      <label htmlFor="admin-app-status-select">Set status</label>
                      <select
                        id="admin-app-status-select"
                        value={app.status}
                        disabled={statusBusy}
                        onChange={(e) => {
                          const next = e.target.value as ApplicationStatus;
                          if (next === 'not_shortlisted') {
                            requestNotShortlisted();
                            return;
                          }
                          changeStatus(next);
                        }}
                      >
                        {APPLICATION_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {APPLICATION_STATUS_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="admin-app-text-action"
                      disabled={statusBusy}
                      onClick={requestNotShortlisted}
                    >
                      Mark as not shortlisted
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="admin-app-sheet-split" role="presentation" />

            <div className="admin-app-aside-section">
              <p className="admin-app-aside-label">Resume</p>
              {app.hasResume ? (
                <>
                  <div className="admin-app-inline-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => openResume(false)}
                      disabled={resumeLoading !== null}
                      aria-busy={resumeLoading === 'view'}
                    >
                      {resumeLoading === 'view' ? <IconSpinner /> : <IconFileText size={15} />}
                      View
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => openResume(true)}
                      disabled={resumeLoading !== null}
                      aria-busy={resumeLoading === 'download'}
                    >
                      {resumeLoading === 'download' ? <IconSpinner /> : <IconDownload size={15} />}
                      Download
                    </button>
                  </div>
                  {resumeOpened && (
                    <p className="admin-field-hint">Opened in a new tab. Link expires in 15 minutes.</p>
                  )}
                </>
              ) : (
                <p className="admin-app-muted">No resume attached.</p>
              )}
            </div>

            <div className="admin-app-sheet-split" role="presentation" />

            <div className="admin-app-aside-section">
              <div className="admin-app-aside-label-row">
                <p className="admin-app-aside-label">Notes</p>
                {notesEditing && notesDirty && <span className="admin-app-unsaved">Unsaved</span>}
              </div>

              {notesEditing || !savedNotes.trim() ? (
                <>
                  <div className="admin-field admin-app-notes-field">
                    <label htmlFor="admin-app-notes-field" className="visually-hidden">
                      Internal notes
                    </label>
                    <textarea
                      id="admin-app-notes-field"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Interview impressions, follow-ups, or next steps"
                      rows={4}
                      autoFocus={Boolean(savedNotes.trim())}
                    />
                    <p className="admin-field-hint">Visible only to administrators.</p>
                  </div>
                  <div className="admin-app-note-actions">
                    {savedNotes.trim() && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={handleCancelNotes}
                        disabled={savingNotes}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={handleSaveNotes}
                      disabled={savingNotes || !notesDirty}
                      aria-busy={savingNotes}
                    >
                      {savingNotes ? 'Saving' : 'Save note'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="admin-app-note-readout">{savedNotes}</div>
                  <button
                    type="button"
                    className="admin-app-note-edit"
                    onClick={handleStartNotesEdit}
                  >
                    <IconEdit />
                    Edit note
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
      {deleteDialog}
    </>
  );
}
