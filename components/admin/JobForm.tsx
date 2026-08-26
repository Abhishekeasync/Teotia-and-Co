'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { scrollToFirstInvalidField } from '@/lib/toast-validation';

import { adminApi } from '@/lib/api/client';
import { ApiJob } from '@/lib/api/types';
import { IconSpinner } from './AdminIcons';

type JobFormProps = {
  initialData?: ApiJob | null;
};

type JobFieldErrors = {
  title?: string;
  description?: string;
};

const JOB_FIELD_ORDER = ['title', 'description'] as const;

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;

export function JobForm({ initialData }: JobFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [department, setDepartment] = useState(initialData?.department ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [workMode, setWorkMode] = useState<'On-site' | 'Hybrid' | 'Remote'>(
    initialData?.workMode ?? 'On-site'
  );
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType ?? '');
  const [experienceRequired, setExperienceRequired] = useState(initialData?.experienceRequired ?? '');
  const [salaryCtc, setSalaryCtc] = useState(initialData?.salaryCtc ?? '');
  const [numberOfOpenings, setNumberOfOpenings] = useState(
    initialData?.numberOfOpenings?.toString() ?? ''
  );
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [responsibilities, setResponsibilities] = useState(initialData?.responsibilities ?? '');
  const [requirements, setRequirements] = useState(initialData?.requirements ?? '');
  const [requiredSkills, setRequiredSkills] = useState(initialData?.requiredSkills ?? '');
  const [status, setStatus] = useState<'draft' | 'published' | 'closed'>(
    initialData?.status ?? 'draft'
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<JobFieldErrors>({});

  const clearError = (field: keyof JobFieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const save = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;

    const nextErrors: JobFieldErrors = {};
    if (!title.trim()) nextErrors.title = 'Please enter the job title.';
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      nextErrors.description = 'Please enter the job description.';
    } else if (trimmedDescription.length < 20) {
      nextErrors.description = 'Job description must be at least 20 characters.';
    }

    if (nextErrors.title || nextErrors.description) {
      setErrors(nextErrors);
      toast.error(nextErrors.title ?? nextErrors.description ?? '');
      scrollToFirstInvalidField(nextErrors, JOB_FIELD_ORDER);
      return;
    }

    setErrors({});

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        department: department.trim() || null,
        location: location.trim() || null,
        workMode,
        employmentType: employmentType.trim() || null,
        experienceRequired: experienceRequired.trim() || null,
        salaryCtc: salaryCtc.trim() || null,
        numberOfOpenings: numberOfOpenings ? parseInt(numberOfOpenings, 10) : null,
        description: trimmedDescription,
        responsibilities: responsibilities.trim() || null,
        requirements: requirements.trim() || null,
        requiredSkills: requiredSkills.trim() || null,
        status,
      };

      if (isEdit && initialData?.id) {
        await adminApi.jobs.update(initialData.id, payload);
        toast.success('Job updated successfully');
      } else {
        await adminApi.jobs.create(payload);
        toast.success('Job created successfully');
      }

      router.push('/admin/jobs');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="admin-form" noValidate>
      <div className="admin-form-grid">
        <div className="admin-field">
          <label htmlFor="title">Job Title *</label>
          <input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title');
            }}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'job-title-error' : undefined}
            className={errors.title ? 'field-invalid' : undefined}
            placeholder="e.g. Senior Corporate Lawyer"
          />
          {errors.title && (
            <span id="job-title-error" className="admin-field-error">
              {errors.title}
            </span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="department">Department</label>
          <input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Corporate Law"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. New Delhi, India"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="workMode">Work Mode *</label>
          <select
            id="workMode"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value as any)}
            required
          >
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="employmentType">Employment Type</label>
          <select
            id="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option value="">Select employment type</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            {employmentType &&
              !(EMPLOYMENT_TYPES as readonly string[]).includes(employmentType) && (
                <option value={employmentType}>{employmentType}</option>
              )}
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="experienceRequired">Experience Required</label>
          <input
            id="experienceRequired"
            value={experienceRequired}
            onChange={(e) => setExperienceRequired(e.target.value)}
            placeholder="e.g. 3-5 Years"
          />
        </div>
        
        <div className="admin-field">
          <label htmlFor="salaryCtc">Salary / CTC</label>
          <input
            id="salaryCtc"
            value={salaryCtc}
            onChange={(e) => setSalaryCtc(e.target.value)}
            placeholder="e.g. Not Disclosed or ₹10-15 LPA"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="numberOfOpenings">Number of Openings</label>
          <input
            id="numberOfOpenings"
            type="number"
            min="1"
            value={numberOfOpenings}
            onChange={(e) => setNumberOfOpenings(e.target.value)}
            placeholder="e.g. 2"
          />
        </div>

        <div className="admin-field">
          <label>Status *</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="status" 
                value="draft" 
                checked={status === 'draft'} 
                onChange={(e) => setStatus(e.target.value as any)} 
              />
              Draft
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="status" 
                value="published" 
                checked={status === 'published'} 
                onChange={(e) => setStatus(e.target.value as any)} 
              />
              Published
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="status" 
                value="closed" 
                checked={status === 'closed'} 
                onChange={(e) => setStatus(e.target.value as any)} 
              />
              Closed
            </label>
          </div>
        </div>
      </div>

      <div className="admin-field" style={{ marginTop: '2rem' }}>
        <label htmlFor="description">Job Description *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError('description');
          }}
          rows={6}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? 'job-description-error' : undefined}
          className={errors.description ? 'field-invalid' : undefined}
          placeholder="Detailed job description..."
        />
        {errors.description && (
          <span id="job-description-error" className="admin-field-error">
            {errors.description}
          </span>
        )}
      </div>

      <div className="admin-field" style={{ marginTop: '2rem' }}>
        <label htmlFor="responsibilities">Key Responsibilities (Optional)</label>
        <textarea
          id="responsibilities"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          rows={6}
          placeholder="Key responsibilities..."
        />
      </div>

      <div className="admin-field" style={{ marginTop: '2rem' }}>
        <label htmlFor="requirements">Requirements (Optional)</label>
        <textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={6}
          placeholder="Requirements..."
        />
      </div>

      <div className="admin-field" style={{ marginTop: '2rem' }}>
        <label htmlFor="requiredSkills">Required Skills (Optional)</label>
        <textarea
          id="requiredSkills"
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          rows={4}
          placeholder="Required skills..."
        />
      </div>

      <div className="admin-form-actions" style={{ marginTop: '2rem' }}>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={saving}
        >
          {saving ? (
            <>
              <IconSpinner />
              Saving...
            </>
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Job'
          )}
        </button>
      </div>
    </form>
  );
}
