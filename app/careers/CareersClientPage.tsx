'use client';

import Link from 'next/link';
import { ApiJob } from '@/lib/api/types';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Scales, 
  TrendUp, 
  UsersThree, 
  GlobeHemisphereWest,
  MapPin,
  ArrowRight,
  Briefcase
} from '@phosphor-icons/react';
import './careers.css';
import '../page-styles.css';

export function CareersClientPage({ jobs }: { jobs: ApiJob[] }) {
  const reduce = useReducedMotion();

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 }
    }
  };

  const whyJoinUsItems = [
    { 
      icon: <Scales size={32} weight="light" />, 
      title: 'Meaningful Work', 
      desc: 'Help businesses navigate India\'s most complex regulatory frameworks with real impact.' 
    },
    { 
      icon: <TrendUp size={32} weight="light" />, 
      title: 'Career Growth', 
      desc: 'Clear paths for advancement with mentorship from senior legal professionals.' 
    },
    { 
      icon: <UsersThree size={32} weight="light" />, 
      title: 'Collaborative Culture', 
      desc: 'Work alongside a tight-knit team that values expertise, precision, and integrity.' 
    },
    { 
      icon: <GlobeHemisphereWest size={32} weight="light" />, 
      title: 'Diverse Clientele', 
      desc: 'Exposure to diverse sectors — startups, MNCs, and everything in between.' 
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
              Join a team of dedicated legal and compliance professionals helping businesses navigate complex regulatory landscapes across India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* OPENINGS */}
      <section className="section bg-[#f8fafc]">
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div 
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            style={{ marginBottom: '3.5rem', textAlign: 'center' }}
          >
            <h2 className="careers-section-heading">Current Openings</h2>
            <p className="careers-section-subtext">
              {jobs.length === 0
                ? "We don't have any open positions at the moment. Check back soon."
                : `We have ${jobs.length} open position${jobs.length !== 1 ? 's' : ''} across our teams.`}
            </p>
          </motion.div>

          {jobs.length > 0 && (
            <motion.ul 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="careers-job-list"
            >
              {jobs.map((job) => (
                <motion.li key={job.id} variants={itemAnim}>
                  <Link
                    href={`/careers/${job.slug}`}
                    className="careers-job-card-link"
                  >
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
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="careers-bento-grid"
          >
            {whyJoinUsItems.map(({ icon, title, desc }) => (
              <motion.div key={title} variants={itemAnim} className="careers-bento-card">
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
