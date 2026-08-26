'use client';

import { useState, useRef, useEffect, FormEvent, DragEvent } from 'react';
import Link from 'next/link';
import {
  Check,
  FilePdf,
  UploadSimple,
  ArrowRight,
} from '@phosphor-icons/react';
import { publicApi, ApiClientError } from '@/lib/api/client';
import { ApiJob } from '@/lib/api/types';
import { toast } from '@/lib/toast';
import { validateName, validateEmail, validatePhone, validateLocation, validateExperienceYears } from '@/lib/validation';

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MIN_RESUME_SIZE = 10 * 1024;

type Props = { job: ApiJob };

export function JobApplyForm({ job }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentLocation: '',
    experienceYears: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [barVisible, setBarVisible] = useState(true);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const experienceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const target = formRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting),
      { threshold: 0.18 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [submitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    setErrors((prev) => {
      if (digits.length === 10) {
        return { ...prev, phone: validatePhone(digits) ?? '' };
      }
      if (prev.phone) return { ...prev, phone: '' };
      return prev;
    });
  };

  const acceptResume = (file: File | null) => {
    setResumeError(null);
    setErrors((prev) => ({ ...prev, resume: '' }));
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      const msg = 'Only PDF files are accepted.';
      setResumeError(msg);
      setResumeFile(null);
      toast.error(msg);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }
    if (file.size < MIN_RESUME_SIZE) {
      const msg = 'Resume is too small. Please upload a PDF of at least 10KB.';
      setResumeError(msg);
      setResumeFile(null);
      toast.error(msg);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      const msg = 'Resume is larger than 5MB. Please upload a smaller PDF.';
      setResumeError(msg);
      setResumeFile(null);
      toast.error(msg);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }
    setResumeFile(file);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptResume(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    acceptResume(e.dataTransfer.files?.[0] ?? null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const locationErr = validateLocation(formData.currentLocation);
    if (locationErr) newErrors.currentLocation = locationErr;
    const yearsErr = validateExperienceYears(formData.experienceYears);
    if (yearsErr) newErrors.experienceYears = yearsErr;
    if (!resumeFile) newErrors.resume = 'Please upload your resume (PDF, max 5MB).';
    setErrors(newErrors);
    return newErrors;
  };

  const focusFirstError = (errs: Record<string, string>) => {
    if (errs.name) nameRef.current?.focus();
    else if (errs.email) emailRef.current?.focus();
    else if (errs.phone) phoneRef.current?.focus();
    else if (errs.currentLocation) locationRef.current?.focus();
    else if (errs.experienceYears) experienceRef.current?.focus();
    else if (errs.resume) resumeInputRef.current?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      toast.error(Object.values(errs)[0]);
      focusFirstError(errs);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('email', formData.email.trim().toLowerCase());
      fd.append('phone', `+91${formData.phone}`);
      fd.append('currentCompany', formData.currentLocation.trim());
      fd.append('experienceYears', formData.experienceYears.trim());
      fd.append('resume', resumeFile!);

      await publicApi.jobs.apply(job.id, fd);
      setSubmitted(true);
      toast.success('Application received. We will be in touch.');
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Could not submit the application. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="job-success" role="status">
        <div className="job-success-icon" aria-hidden="true">
          <Check size={16} weight="bold" />
        </div>
        <h2>Application received</h2>
        <p>
          Thank you for applying for the <strong>{job.title}</strong> position.
          Your application has been successfully submitted.
        </p>
        <p>
          We’ll review your profile and contact you at{' '}
          <strong className="job-success-email">{formData.email}</strong> if
          you’re shortlisted for the next stage.
        </p>
        <Link href="/careers" className="job-success-link">
          View other openings
          <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="job-apply-form"
        noValidate
      >
        <h2 className="job-apply-title">Apply</h2>
        <p className="job-apply-required">All fields are required.</p>
        <div className="job-apply-fields">
          <div className="form-group job-field-span">
            <label htmlFor="apply-name">Full name</label>
            <input
              id="apply-name"
              ref={nameRef}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              maxLength={255}
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'apply-name-error' : undefined}
              className={errors.name ? 'field-invalid' : undefined}
            />
            {errors.name && (
              <span id="apply-name-error" className="form-field-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="apply-email">Email</label>
            <input
              id="apply-email"
              ref={emailRef}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="rahul@gmail.com"
              maxLength={255}
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'apply-email-error' : undefined}
              className={errors.email ? 'field-invalid' : undefined}
            />
            {errors.email && (
              <span id="apply-email-error" className="form-field-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="apply-phone">Mobile number</label>
            <div
              className={`job-phone${errors.phone ? ' is-invalid' : ''}`}
            >
              <span className="job-phone-prefix" aria-hidden="true">
                +91
              </span>
              <input
                id="apply-phone"
                ref={phoneRef}
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={() => {
                  if (!formData.phone && !errors.phone) return;
                  const phoneErr = validatePhone(formData.phone);
                  setErrors((prev) => ({ ...prev, phone: phoneErr ?? '' }));
                }}
                placeholder="98765 43210"
                maxLength={10}
                minLength={10}
                autoComplete="tel-national"
                required
                aria-required="true"
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? 'apply-phone-error' : 'apply-phone-hint'}
                className={errors.phone ? 'field-invalid' : undefined}
              />
              <span id="apply-phone-hint" className="visually-hidden">
                Ten-digit Indian mobile number, country code plus 91
              </span>
            </div>
            {errors.phone && (
              <span id="apply-phone-error" className="form-field-error">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="apply-currentLocation">Current location</label>
            <input
              id="apply-currentLocation"
              ref={locationRef}
              name="currentLocation"
              type="text"
              value={formData.currentLocation}
              onChange={handleChange}
              placeholder="Noida"
              maxLength={255}
              autoComplete="address-level2"
              required
              aria-required="true"
              aria-invalid={errors.currentLocation ? true : undefined}
              aria-describedby={errors.currentLocation ? 'apply-location-error' : undefined}
              className={errors.currentLocation ? 'field-invalid' : undefined}
            />
            {errors.currentLocation && (
              <span id="apply-location-error" className="form-field-error">
                {errors.currentLocation}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="apply-experienceYears">Years of experience</label>
            <input
              id="apply-experienceYears"
              ref={experienceRef}
              name="experienceYears"
              type="number"
              min="0"
              max="60"
              step="0.5"
              inputMode="decimal"
              value={formData.experienceYears}
              onChange={handleChange}
              placeholder="e.g. 3"
              required
              aria-required="true"
              aria-invalid={errors.experienceYears ? true : undefined}
              aria-describedby={errors.experienceYears ? 'apply-years-error' : undefined}
              className={errors.experienceYears ? 'field-invalid' : undefined}
            />
            {errors.experienceYears && (
              <span id="apply-years-error" className="form-field-error">
                {errors.experienceYears}
              </span>
            )}
          </div>

          <div className="form-group job-field-span">
            <span className="job-drop-label" id="apply-resume-label">
              Resume
            </span>
            <label
              htmlFor="apply-resume"
              className={`job-dropzone${dragging ? ' is-dragging' : ''}${
                errors.resume || resumeError ? ' is-invalid' : ''
              }${resumeFile && !resumeError ? ' is-ready' : ''}`}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                id="apply-resume"
                ref={resumeInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleResumeChange}
                className="job-dropzone-input"
                aria-required="true"
                aria-labelledby="apply-resume-label"
                aria-invalid={errors.resume || resumeError ? true : undefined}
                aria-describedby={
                  resumeError || errors.resume ? 'apply-resume-error' : 'apply-resume-hint'
                }
              />
              {resumeFile && !resumeError ? (
                <>
                  <FilePdf size={22} weight="light" aria-hidden="true" />
                  <span className="job-dropzone-name">{resumeFile.name}</span>
                  <span className="job-dropzone-meta">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB · replace
                  </span>
                </>
              ) : (
                <>
                  <UploadSimple size={22} weight="light" aria-hidden="true" />
                  <span className="job-dropzone-name">Drop a PDF or browse</span>
                  <span className="job-dropzone-meta" id="apply-resume-hint">
                    PDF only · max 5MB
                  </span>
                </>
              )}
            </label>
            {(resumeError || errors.resume) && (
              <span id="apply-resume-error" className="form-field-error">
                {resumeError || errors.resume}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-consult job-submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Submitting' : 'Submit application'}
          <span className="btn-consult-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7h8M7 3l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </form>

      {barVisible && (
        <a className="job-mobile-bar" href="#apply">
          Apply for this role
          <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </a>
      )}
    </>
  );
}
