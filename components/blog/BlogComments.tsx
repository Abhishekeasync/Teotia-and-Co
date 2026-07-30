/**
 * Blog Comments Component
 * Displays approved comments and allows users to submit new ones
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { publicApi, ApiClientError } from '@/lib/api/client';
import { ApiComment } from '@/lib/api/types';
import { validateName, validateEmail, validateComment } from '@/lib/validation';
import { showValidationToasts } from '@/lib/toast-validation';

interface BlogCommentsProps {
  slug: string;
}

export function BlogComments({ slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await publicApi.comments.list(slug, { page: 1, limit: 100 });
        const data = response as any;
        // API returns { success: true, data: { comments: [...], pagination: {...} }, message: '' }
        setComments(data.data?.comments || []);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        setComments([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [slug]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const commentError = validateComment(comment);
    if (commentError) newErrors.comment = commentError;

    setErrors(newErrors);
    return newErrors;
  };

  const handleFieldChange = (
    field: 'name' | 'email' | 'comment',
    value: string,
    setter: (value: string) => void
  ) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      showValidationToasts(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      await publicApi.comments.create(slug, {
        name: name.trim(),
        email: email.trim(),
        comment: comment.trim(),
      });

      toast.success(
        'Thank you for your comment! It has been received and will appear on the blog after review.'
      );

      // Clear form
      setName('');
      setEmail('');
      setComment('');
      setErrors({});
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : 'Failed to submit comment. Please try again.';

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="blog-comments" aria-labelledby="blog-comments-heading">
      <h2 id="blog-comments-heading">Comments ({comments?.length || 0})</h2>

      {/* Display existing comments */}
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No comments yet. Be the first to comment!</p>
      ) : (
        <div className="comments-list" style={{ marginBottom: '2rem' }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                borderLeft: '3px solid var(--green)',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {c.name}
              </div>
              <p style={{ margin: '0.5rem 0', color: '#374151' }}>{c.comment}</p>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {new Date(c.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment submission form */}
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Leave a Comment</h3>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label
              htmlFor="comment-name"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Name *
            </label>
            <input
              type="text"
              id="comment-name"
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value, setName)}
              maxLength={100}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '1rem',
              }}
            />
            {errors.name && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.name}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="comment-email"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Email *
            </label>
            <input
              type="email"
              id="comment-email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
              maxLength={255}
              placeholder="your.email@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '1rem',
              }}
            />
            {errors.email && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.email}
              </span>
            )}
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Your email will not be published
            </small>
          </div>

          <div>
            <label
              htmlFor="comment-text"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Comment *
            </label>
            <textarea
              id="comment-text"
              value={comment}
              onChange={(e) => handleFieldChange('comment', e.target.value, setComment)}
              maxLength={1000}
              rows={5}
              placeholder="Share your thoughts..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.comment ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '1rem',
                resize: 'vertical',
              }}
            />
            {errors.comment && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.comment}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.75rem 2rem',
            background: submitting ? '#9ca3af' : 'var(--green)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </section>
  );
}
