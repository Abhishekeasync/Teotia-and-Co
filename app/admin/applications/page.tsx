'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@/lib/toast';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminAction, AdminActions } from '@/components/admin/AdminActions';
import { IconEye } from '@/components/admin/AdminIcons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { adminApi } from '@/lib/api/client';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  ApiJobApplication,
  ApiJobApplicationJobHeader,
  ApiJobApplicationListResponse,
  ApiJobApplicationSummariesResponse,
  ApiJobApplicationSummary,
  ApplicationPipeline,
  ApplicationStatus,
  CLOSED_APPLICATION_STATUSES,
} from '@/lib/api/types';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function dateRangeForPreset(preset: string, customFrom: string, customTo: string) {
  const now = new Date();
  if (preset === 'today') {
    return { dateFrom: startOfDay(now).toISOString(), dateTo: endOfDay(now).toISOString() };
  }
  if (preset === '7d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { dateFrom: from.toISOString(), dateTo: endOfDay(now).toISOString() };
  }
  if (preset === '30d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 29);
    return { dateFrom: from.toISOString(), dateTo: endOfDay(now).toISOString() };
  }
  if (preset === 'custom') {
    return {
      dateFrom: customFrom ? startOfDay(new Date(`${customFrom}T00:00:00`)).toISOString() : undefined,
      dateTo: customTo ? endOfDay(new Date(`${customTo}T00:00:00`)).toISOString() : undefined,
    };
  }
  return { dateFrom: undefined, dateTo: undefined };
}

function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get('jobId');
  const jobId = jobIdParam ? Number(jobIdParam) : undefined;

  const [applications, setApplications] = useState<ApiJobApplication[]>([]);
  const [summaries, setSummaries] = useState<ApiJobApplicationSummary[]>([]);
  const [jobHeader, setJobHeader] = useState<ApiJobApplicationJobHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pipeline, setPipeline] = useState<ApplicationPipeline>('active');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [datePreset, setDatePreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const dateRange = useMemo(
    () => dateRangeForPreset(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo],
  );

  const hasFilters = Boolean(
    search || jobId || status || pipeline !== 'active' || datePreset !== 'all',
  );

  const loadSummaries = async () => {
    try {
      const res = await adminApi.applications.summaries();
      const data = res as { data: ApiJobApplicationSummariesResponse };
      setSummaries(data.data.summaries);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load job summaries');
    }
  };

  const loadApplications = async (pageNum = page) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.applications.list({
        page: pageNum,
        limit: 20,
        jobId: jobId && Number.isFinite(jobId) ? jobId : undefined,
        search: search || undefined,
        status: status || undefined,
        pipeline: status ? 'all' : pipeline,
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
      });
      if (requestId !== requestIdRef.current) return;
      const data = res as { data: ApiJobApplicationListResponse };
      setApplications(data.data.applications);
      setJobHeader(data.data.job);
      setTotalPages(data.data.meta.totalPages);
      setTotal(data.data.meta.total);
      setPage(data.data.meta.page);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to load applications';
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, []);

  useEffect(() => {
    loadApplications(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, jobId, pipeline, status, dateRange.dateFrom, dateRange.dateTo]);

  const setJobFilter = (nextJobId?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextJobId) params.set('jobId', String(nextJobId));
    else params.delete('jobId');
    const query = params.toString();
    router.replace(query ? `/admin/applications?${query}` : '/admin/applications');
    setPage(1);
  };

  const showClosedColumns =
    pipeline === 'closed' ||
    (status !== '' && (CLOSED_APPLICATION_STATUSES as string[]).includes(status));

  const emptyTitle = search
    ? 'No applications match your search'
    : jobId
      ? 'No applications have been received for this position yet'
      : pipeline === 'closed'
        ? 'No closed applications'
        : 'No applications found';

  const emptyDescription = search
    ? 'Try a different name, email, mobile number, job title, or job ID.'
    : jobId
      ? 'Candidates who apply for this role will appear here.'
      : pipeline === 'active' && !hasFilters
        ? 'When candidates apply for jobs, their applications will appear here.'
        : 'Try adjusting the filters to see more results.';

  return (
    <>
      <AdminPageHeader
        title="Applications"
        description={
          jobHeader
            ? `${jobHeader.title} · Job ID ${jobHeader.id} · ${jobHeader.total} total`
            : 'Review and manage candidate applications'
        }
        actions={
          jobHeader ? (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setJobFilter(undefined)}
            >
              All jobs
            </button>
          ) : undefined
        }
      />
      <div className="admin-content">


        <div className="admin-panel">
          <div className="admin-app-toolbar">
            <label className="admin-app-search">
              <span className="visually-hidden">Search applications</span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search applications..."
              />
            </label>
            <div className="admin-filters">
              <select
                value={jobId && Number.isFinite(jobId) ? String(jobId) : ''}
                onChange={(e) => setJobFilter(e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filter by job"
              >
                <option value="">All jobs</option>
                {summaries.map((summary) => (
                  <option key={summary.jobId} value={summary.jobId}>
                    {summary.jobTitle}
                  </option>
                ))}
                {jobHeader && !summaries.some((item) => item.jobId === jobHeader.id) && (
                  <option value={jobHeader.id}>{jobHeader.title}</option>
                )}
              </select>
              <select
                value={pipeline}
                onChange={(e) => {
                  setPipeline(e.target.value as ApplicationPipeline);
                  setStatus('');
                  setPage(1);
                }}
                aria-label="Filter by pipeline"
              >
                <option value="active">Active applications</option>
                <option value="closed">Closed applications</option>
                <option value="all">All applications</option>
              </select>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ApplicationStatus | '');
                  setPage(1);
                }}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {APPLICATION_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {APPLICATION_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
              <select
                value={datePreset}
                onChange={(e) => {
                  setDatePreset(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by date"
              >
                <option value="all">Any date</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>
              {datePreset === 'custom' && (
                <>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => {
                      setCustomFrom(e.target.value);
                      setPage(1);
                    }}
                    aria-label="From date"
                  />
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => {
                      setCustomTo(e.target.value);
                      setPage(1);
                    }}
                    aria-label="To date"
                  />
                </>
              )}
            </div>
          </div>

          {error ? (
            <div className="admin-app-state">
              <p className="admin-error">{error}</p>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => loadApplications(page)}
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div style={{ padding: '1.25rem' }}>
              <AdminTableSkeleton rows={6} cols={showClosedColumns ? 8 : 7} />
            </div>
          ) : applications.length === 0 ? (
            <AdminEmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job</th>
                    <th>Experience</th>
                    <th>Applied</th>
                    <th>Status</th>
                    {showClosedColumns && <th>Closed</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <Link href={`/admin/applications/${app.id}`}>
                          <strong>{app.name}</strong>
                        </Link>
                        <div className="admin-cell-muted">{app.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{app.jobTitle}</div>
                        <div className="admin-cell-muted">#{app.jobId}</div>
                      </td>
                      <td>
                        {app.experienceYears !== null ? `${app.experienceYears} yrs` : '—'}
                      </td>
                      <td>{formatDate(app.createdAt)}</td>
                      <td>
                        <span className={`admin-badge admin-badge-status-${app.status}`}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      {showClosedColumns && (
                        <td>
                          {formatDate(app.closedAt)}
                          {app.closedByName ? (
                            <div className="admin-cell-muted">{app.closedByName}</div>
                          ) : null}
                        </td>
                      )}
                      <td>
                        <AdminActions>
                          <AdminAction
                            label="View"
                            icon={<IconEye />}
                            href={`/admin/applications/${app.id}`}
                          />
                        </AdminActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && !error && applications.length > 0 && (
          <p className="admin-app-count">
            {total} {total === 1 ? 'application' : 'applications'}
            {jobHeader ? ` for ${jobHeader.title}` : ''}
          </p>
        )}

        <AdminPagination
          page={page}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense
      fallback={
        <>
          <AdminPageHeader title="Applications" description="Review and manage candidate applications" />
          <div className="admin-content">
            <div className="admin-panel">
              <div style={{ padding: '1.25rem' }}>
                <AdminTableSkeleton rows={6} cols={7} />
              </div>
            </div>
          </div>
        </>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}
