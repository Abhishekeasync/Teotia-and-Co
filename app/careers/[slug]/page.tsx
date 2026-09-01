import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { publicApi } from '@/lib/api/client';
import { ApiJob } from '@/lib/api/types';
import { JobApplyForm } from '../JobApplyForm';
import '../../page-styles.css';
import '../careers.css';

type Props = { params: Promise<{ slug: string }> };

async function getJob(slug: string): Promise<ApiJob | null> {
  try {
    const res = await publicApi.jobs.getBySlug(slug);
    const data = res as { data: ApiJob };
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const job = await getJob(resolvedParams.slug);
  if (!job) return { title: 'Job Not Found | TEOTIA & CO.' };
  return {
    title: `${job.title} | Careers at TEOTIA & CO.`,
    description: `Apply for the ${job.title} position at TEOTIA & CO. ${job.department ? `Department: ${job.department}.` : ''} ${job.location ? `Location: ${job.location}.` : ''}`,
  };
}

export const revalidate = 60;

function jobFacts(job: ApiJob) {
  return [
    { label: 'Location', value: job.location },
    { label: 'Work mode', value: job.workMode },
    { label: 'Experience', value: job.experienceRequired },
    { label: 'Employment', value: job.employmentType },
    { label: 'Salary / CTC', value: job.salaryCtc },
    {
      label: 'Openings',
      value: job.numberOfOpenings ? String(job.numberOfOpenings) : null,
    },
    { label: 'Team', value: job.department },
  ].filter((fact) => Boolean(fact.value));
}

/** Convert plain-text (with \n line breaks) to safe HTML paragraphs. */
function plainTextToHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/) // blank line → new paragraph
    .map((para) =>
      `<p>${para
        .trim()
        .split('\n')
        .map((line) => line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
        .join('<br />')}</p>`
    )
    .join('');
}

function RichContent({ html, title }: { html: string | null; title: string }) {
  if (!html?.trim()) return null;

  // If it already looks like HTML (contains tags), render as-is.
  // Otherwise convert plain text newlines to <p>/<br> markup.
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  const rendered = isHtml ? html : plainTextToHtml(html);

  return (
    <section className="job-read-block">
      <h2 className="job-read-title">{title}</h2>
      <div
        className="job-read-body"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </section>
  );
}

export default async function JobDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const job = await getJob(resolvedParams.slug);
  if (!job) notFound();

  const facts = jobFacts(job);

  return (
    <>
      <a className="job-skip" href="#apply">
        Skip to application
      </a>

      <section className="job-masthead">
        <div className="job-masthead-inner">
          <nav className="job-crumb" aria-label="Breadcrumb">
            <Link href="/careers">
              <ArrowLeft size={14} weight="bold" aria-hidden="true" />
              All openings
            </Link>
            <span className="job-crumb-sep" aria-hidden="true">
              /
            </span>
            <span className="job-crumb-current">{job.title}</span>
          </nav>

          <h1 className="job-masthead-title">{job.title}</h1>

          {facts.length > 0 && (
            <dl className="job-facts">
              {facts.map((fact) => (
                <div key={fact.label} className="job-fact">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <a className="job-masthead-cta" href="#apply">
            Apply for this role
            <span className="job-masthead-cta-icon" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </a>
        </div>
      </section>

      <div className="job-stage">
        <div className="job-stage-inner">
          <article className="job-brief" aria-labelledby="job-brief-heading">
            <h2 id="job-brief-heading" className="visually-hidden">
              Role details
            </h2>
            <RichContent html={job.description} title="About this role" />
            <RichContent html={job.responsibilities} title="Key Responsibilities" />
            <RichContent html={job.requirements} title="What we look for" />
            <RichContent html={job.requiredSkills} title="Required skills" />
          </article>

          <aside className="job-apply-aside" id="apply">
            <div className="job-apply-shell">
              <div className="job-apply-card">
                <JobApplyForm job={job} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
