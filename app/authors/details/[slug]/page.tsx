import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { publicApi } from '@/lib/api/client';
import { ApiAuthorDetail, ApiBlogListResponse } from '@/lib/api/types';
import { BlogCard } from '@/components/blog/BlogCard';
import { Stagger } from '@/components/Reveal';
import { mapApiBlogsToPost } from '@/lib/api/mappers';
import { normalizeApiBlogs } from '@/lib/api/normalize';
import '../../../page-styles.css';

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

const getAuthor = cache(async (slug: string) => {
  try {
    const res = await publicApi.authors.getBySlug(slug);
    const data = res as unknown as { data: { author: ApiAuthorDetail } };
    return data.data.author;
  } catch (err) {
    console.error('Failed to fetch author:', err);
    return null;
  }
});

async function getAuthorBlogs(authorSlug: string) {
  try {
    const res = await publicApi.blogs.list({ author: authorSlug, limit: 50, sort: 'latest' });
    const data = res as unknown as { data: ApiBlogListResponse };
    const blogs = normalizeApiBlogs((data.data?.blogs ?? []) as Parameters<typeof normalizeApiBlogs>[0]);
    return mapApiBlogsToPost(blogs);
  } catch (err) {
    console.error('Failed to fetch author blogs:', err);
    return [];
  }
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return { title: 'Author Not Found' };

  return {
    title: `${author.name} | TEOTIA & CO.`,
    description: author.bio || `Articles by ${author.name}`,
    openGraph: {
      title: `${author.name} | TEOTIA & CO.`,
      description: author.bio || `Articles by ${author.name}`,
      images: author.profileImageUrl || undefined,
      type: 'profile',
    },
  };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthor(slug);

  if (!author) notFound();

  const authorBlogs = await getAuthorBlogs(slug);

  return (
    <>
      <section className="section bg-white pt-24 lg:pt-32 pb-16 lg:pb-24 border-b border-gray-100">
        <div className="container-narrow">
          <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-brand transition-colors">
              Blog
            </Link>
            <span className="mx-2 text-gray-300" aria-hidden="true">
              /
            </span>
            <span className="text-gray-700">{author.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {author.profileImageUrl ? (
              <Image
                src={author.profileImageUrl}
                alt={author.name}
                width={160}
                height={160}
                className="rounded-full object-cover shadow-sm ring-4 ring-gray-50 flex-shrink-0"
                style={{ width: 160, height: 160 }}
              />
            ) : (
              <div
                className="rounded-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400 flex-shrink-0"
                style={{ width: 160, height: 160 }}
              >
                {author.name.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">
                {author.name}
              </h1>
              {author.designation && (
                <p className="text-xl text-brand font-medium mb-4">{author.designation}</p>
              )}
              {author.bio && (
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mb-6">
                  {author.bio}
                </p>
              )}

              <div className="flex gap-4">
                {author.linkedinUrl && (
                  <a
                    href={author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-brand transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {author.twitterUrl && (
                  <a
                    href={author.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-brand transition-colors"
                  >
                    Twitter
                  </a>
                )}
                {author.facebookUrl && (
                  <a
                    href={author.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-brand transition-colors"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-narrow">
          <h2 className="text-2xl font-display font-bold mb-8">Articles by {author.name}</h2>

          {authorBlogs.length > 0 ? (
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {authorBlogs.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </Stagger>
          ) : (
            <p className="text-gray-500 text-lg">No articles published yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
