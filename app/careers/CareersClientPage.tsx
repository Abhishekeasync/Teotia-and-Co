'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiJob } from '@/lib/api/types';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Scales,
  TrendUp,
  UsersThree,
  GlobeHemisphereWest,
  MapPin,
  ArrowRight,
  Briefcase,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import {
  filterJobs,
  getJobFilterOptions,
  hasActiveJobFilters,
  parseJobFilters,
  sanitizeJobFilters,
  jobFiltersToQueryString,
} from '@/lib/careers/jobFilters';
import { JobFiltersBar } from './JobFiltersBar';
import './careers.css';
import '../page-styles.css';

function CareersJobListings({ jobs }: { jobs: ApiJob[] }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawFilters = parseJobFilters(searchParams);
  const filterOptions = useMemo(() => getJobFilterOptions(jobs), [jobs]);
  const filters = useMemo(
    () => sanitizeJobFilters(rawFilters, filterOptions),
    [rawFilters, filterOptions],
  );
  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const hasFilters = hasActiveJobFilters(filters);

  useEffect(() => {
    const rawQuery = jobFiltersToQueryString(rawFilters);
    const sanitizedQuery = jobFiltersToQueryString(filters);
    if (rawQuery !== sanitizedQuery) {
      router.replace(sanitizedQuery ? `/careers?${sanitizedQuery}` : '/careers', {
        scroll: false,
      });
    }
  }, [rawFilters, filters, router]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <section className="section bg-[#f8fafc]">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          style={{ marginBottom: '2.5rem', textAlign: 'center' }}
        >
          <h2 className="careers-section-heading">Current Openings</h2>
          <p className="careers-section-subtext">
            {jobs.length === 0
              ? "We don't have any open positions at the moment. Check back soon."
              : hasFilters
                ? 'Refine the list below to find roles that match your interests.'
                : `We have ${jobs.length} open position${jobs.length !== 1 ? 's' : ''} across our teams.`}
          </p>
        </motion.div>

        {jobs.length > 0 && (
          <JobFiltersBar
            options={filterOptions}
            filters={filters}
            resultCount={filteredJobs.length}
            totalCount={jobs.length}
          />
        )}

        {jobs.length > 0 && filteredJobs.length === 0 && hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="careers-empty-state"
            role="status"
          >
            <MagnifyingGlass size={40} weight="light" aria-hidden />
            <p className="careers-empty-state-title">
              No job openings match your selected filters.
            </p>
            <p className="careers-empty-state-desc">
              Try adjusting or clearing your filters to see more opportunities.
            </p>
          </motion.div>
        )}

        {filteredJobs.length > 0 && (
          <motion.ul
            key={jobFiltersToQueryString(filters) || 'all-jobs'}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="careers-job-list"
          >
            {filteredJobs.map((job) => (
              <motion.li key={job.id} variants={itemAnim} layout={!reduce}>
                <Link href={`/careers/${job.slug}`} className="careers-job-card-link">
                  <div className="careers-job-card group">
                    <div className="careers-job-main">
                      <h3 className="careers-job-title">{job.title}</h3>
                      <div className="careers-job-meta">
                        {job.department && (
                          <span className="careers-job-tag">
                            <Briefcase size={14} weight="bold" />
                            {job.department}
                          </span>
                        )}
                        <span className="careers-job-tag careers-job-tag--mode">{job.workMode}</span>
                        {job.location && (
                          <span className="careers-job-tag">
                            <MapPin size={14} weight="bold" />
                            {job.location}
                          </span>
                        )}
                        {job.employmentType && (
                          <span className="careers-job-tag">{job.employmentType}</span>
                        )}
                        {job.experienceRequired && (
                          <span className="careers-job-tag">{job.experienceRequired} exp.</span>
                        )}
                      </div>
                    </div>
                    <div className="careers-job-arrow group-hover:translate-x-1 group-hover:text-[#08085e] transition-all">
                      <ArrowRight size={24} weight="bold" />
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}

function JobListingsFallback() {
  return (
    <section className="section bg-[#f8fafc]">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h2 className="careers-section-heading">Current Openings</h2>
          <p className="careers-section-subtext">Loading openings…</p>
        </div>
      </div>
    </section>
  );
}

export function CareersClientPage({ jobs }: { jobs: ApiJob[] }) {
  const reduce = useReducedMotion();

  const whyJoinUsItems = [
    {
      icon: <Scales size={32} weight="light" />,
      title: 'Meaningful Work',
      desc: "Help businesses navigate India's most complex regulatory frameworks with real impact.",
    },
    {
      icon: <TrendUp size={32} weight="light" />,
      title: 'Career Growth',
      desc: 'Clear paths for advancement with mentorship from senior legal professionals.',
    },
    {
      icon: <UsersThree size={32} weight="light" />,
      title: 'Collaborative Culture',
      desc: 'Work alongside a tight-knit team that values expertise, precision, and integrity.',
    },
    {
      icon: <GlobeHemisphereWest size={32} weight="light" />,
      title: 'Diverse Clientele',
      desc: 'Exposure to diverse sectors — startups, MNCs, and everything in between.',
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="careers-hero-section">
        <div className="careers-hero-container">
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="careers-hero-title">Build Your Career with TEOTIA &amp; CO.</h1>
            <p className="careers-hero-sub">
              Join a team of dedicated legal and compliance professionals helping businesses navigate
              complex regulatory landscapes across India.
            </p>
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<JobListingsFallback />}>
        <CareersJobListings jobs={jobs} />
      </Suspense>

      {/* WHY JOIN US */}
      <section className="section bg-white border-t border-[#e2e8f0]">
        <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 className="careers-section-heading">Why Join TEOTIA &amp; CO.?</h2>
            <p className="careers-section-subtext" style={{ maxWidth: '600px', margin: '0 auto' }}>
              We offer a collaborative environment where your expertise shapes real business outcomes.
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="careers-bento-grid"
          >
            {whyJoinUsItems.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
                  },
                }}
                className="careers-bento-card"
              >
                <div className="careers-bento-icon">{icon}</div>
                <h4 className="careers-bento-title">{title}</h4>
                <p className="careers-bento-desc">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
