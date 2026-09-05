'use client';

import { useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Funnel, X } from '@phosphor-icons/react';
import {
  JobFilterOptions,
  JobFilters,
  countActiveJobFilterFields,
  hasActiveJobFilters,
  jobFiltersToQueryString,
} from '@/lib/careers/jobFilters';

type JobFiltersBarProps = {
  options: JobFilterOptions;
  filters: JobFilters;
  resultCount: number;
  totalCount: number;
};

function FilterSelect({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="careers-filter-field">
      <label htmlFor={id} className="careers-filter-label">
        {label}
      </label>
      <select
        id={id}
        className="careers-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function JobFiltersBar({ options, filters, resultCount, totalCount }: JobFiltersBarProps) {
  const router = useRouter();
  const baseId = useId();
  const activeCount = countActiveJobFilterFields(filters);
  const hasFilters = hasActiveJobFilters(filters);

  const hasAnyOptions =
    options.employmentTypes.length > 0 ||
    options.locations.length > 0 ||
    options.experiences.length > 0 ||
    options.workModes.length > 0;

  const updateFilters = useCallback(
    (next: JobFilters) => {
      const query = jobFiltersToQueryString(next);
      router.replace(query ? `/careers?${query}` : '/careers', { scroll: false });
    },
    [router],
  );

  const setFilter = <K extends keyof JobFilters>(key: K, value: string) => {
    const next: JobFilters = { ...filters };
    if (value) {
      next[key] = value as NonNullable<JobFilters[K]>;
    } else {
      delete next[key];
    }
    updateFilters(next);
  };

  const clearFilters = () => {
    updateFilters({});
  };

  const removeFilter = (key: keyof JobFilters) => {
    const next = { ...filters };
    delete next[key];
    updateFilters(next);
  };

  if (!hasAnyOptions) return null;

  const resultLabel =
    resultCount === 1 ? '1 Job Found' : `${resultCount} Jobs Found`;

  return (
    <section className="careers-filters" aria-labelledby={`${baseId}-heading`}>
      <div className="careers-filters-header">
        <div className="careers-filters-title-wrap">
          <Funnel size={20} weight="bold" aria-hidden />
          <h3 id={`${baseId}-heading`} className="careers-filters-title">
            Filter Jobs
          </h3>
          {activeCount > 0 && (
            <span className="careers-filters-active-count" aria-hidden>
              {activeCount}
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            type="button"
            className="careers-filters-clear"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="careers-filters-grid">
        <FilterSelect
          id={`${baseId}-type`}
          label="Job Type"
          value={filters.employmentType ?? ''}
          options={options.employmentTypes}
          placeholder="All job types"
          onChange={(value) => setFilter('employmentType', value)}
        />
        <FilterSelect
          id={`${baseId}-location`}
          label="Location"
          value={filters.location ?? ''}
          options={options.locations}
          placeholder="All locations"
          onChange={(value) => setFilter('location', value)}
        />
        <FilterSelect
          id={`${baseId}-experience`}
          label="Experience"
          value={filters.experience ?? ''}
          options={options.experiences}
          placeholder="All experience levels"
          onChange={(value) => setFilter('experience', value)}
        />
        <FilterSelect
          id={`${baseId}-work-mode`}
          label="Work Mode"
          value={filters.workMode ?? ''}
          options={options.workModes}
          placeholder="All work modes"
          onChange={(value) => setFilter('workMode', value)}
        />
      </div>

      {hasFilters && (
        <div className="careers-filters-pills" aria-label="Active filters">
          {filters.employmentType && (
            <button
              type="button"
              className="careers-filter-pill"
              onClick={() => removeFilter('employmentType')}
            >
              Job Type: {filters.employmentType}
              <X size={14} weight="bold" aria-hidden />
              <span className="visually-hidden">Remove job type filter</span>
            </button>
          )}
          {filters.location && (
            <button
              type="button"
              className="careers-filter-pill"
              onClick={() => removeFilter('location')}
            >
              Location: {filters.location}
              <X size={14} weight="bold" aria-hidden />
              <span className="visually-hidden">Remove location filter</span>
            </button>
          )}
          {filters.experience && (
            <button
              type="button"
              className="careers-filter-pill"
              onClick={() => removeFilter('experience')}
            >
              Experience: {filters.experience}
              <X size={14} weight="bold" aria-hidden />
              <span className="visually-hidden">Remove experience filter</span>
            </button>
          )}
          {filters.workMode && (
            <button
              type="button"
              className="careers-filter-pill"
              onClick={() => removeFilter('workMode')}
            >
              Work Mode: {filters.workMode}
              <X size={14} weight="bold" aria-hidden />
              <span className="visually-hidden">Remove work mode filter</span>
            </button>
          )}
        </div>
      )}

      <p className="careers-filters-result" aria-live="polite" aria-atomic="true">
        {hasFilters ? (
          <>
            <strong>{resultLabel}</strong>
            {totalCount > 0 && resultCount !== totalCount && (
              <span className="careers-filters-result-meta">
                {' '}
                of {totalCount} open position{totalCount !== 1 ? 's' : ''}
              </span>
            )}
          </>
        ) : (
          <strong>
            {totalCount === 0
              ? 'No open positions'
              : totalCount === 1
                ? '1 open position'
                : `${totalCount} open positions`}
          </strong>
        )}
      </p>
    </section>
  );
}
