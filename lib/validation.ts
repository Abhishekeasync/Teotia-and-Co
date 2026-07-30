const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 255) return 'Name must be less than 255 characters';
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return 'Name can only contain letters, spaces, and basic punctuation';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required';
  if (trimmed.length > 255) return 'Email must be less than 255 characters';
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address';
  return null;
}

export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return 'Phone number is required';
  const normalized = trimmed.replace(/[\s\-()]/g, '');
  if (/^\+91[6-9]\d{9}$/.test(normalized) || /^[6-9]\d{9}$/.test(normalized)) {
    return null;
  }
  return 'Please enter a valid 10-digit mobile number';
}

export function validateComment(comment: string): string | null {
  const trimmed = comment.trim();
  if (!trimmed) return 'Comment is required';
  if (trimmed.length < 2) return 'Comment must be at least 2 characters';
  if (trimmed.length > 1000) return 'Comment must be less than 1000 characters';
  return null;
}
