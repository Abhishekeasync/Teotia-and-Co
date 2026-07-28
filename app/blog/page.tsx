import Link from 'next/link';
import { HeroReveal } from '@/components/Reveal';
import '../page-styles.css';
import { blogPosts } from '@/lib/blog-posts';
import { BlogSection } from '@/components/blog/BlogSection';

export default function BlogPage() {
  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <HeroReveal delay={0}>
            <h1 className="blog-hero-title">Financial Insights Blog</h1>
          </HeroReveal>
          <HeroReveal delay={0.08}>
            <p className="about-hero-sub">
              Explore expert insights, practical tips, and up-to-date guidance on accounting, taxation, and financial management to help you make informed decisions and stay financially confident.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.16}>
            <nav className="about-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Blog</span>
            </nav>
          </HeroReveal>
        </div>
      </section>

      {/* BLOG EDITORIAL GRID */}
      <BlogSection
        posts={blogPosts}
        title="Financial Insights"
        subtitle="Explore expert perspectives on accounting, taxation, compliance, and strategic financial management for growing businesses."
      />
    </>
  );
}
