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
  if (!trimmed) return 'Mobile number is required';
  const normalized = trimmed.replace(/[\s\-()]/g, '');
  const local = normalized.startsWith('+91')
    ? normalized.slice(3)
    : normalized.startsWith('91') && normalized.length === 12
      ? normalized.slice(2)
      : normalized;
  if (!/^\d{10}$/.test(local)) {
    return 'Enter a 10-digit mobile number';
  }
  if (!/^[6-9]/.test(local)) {
    return 'Indian mobile numbers start with 6, 7, 8, or 9';
  }
  return null;
}

export function validateLocation(location: string): string | null {
  const trimmed = location.trim();
  if (!trimmed) return 'Current location is required';
  if (trimmed.length < 2) return 'Enter a valid location';
  if (trimmed.length > 255) return 'Location must be less than 255 characters';
  return null;
}

export function validateExperienceYears(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Years of experience is required';
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 60 || !/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return 'Enter years of experience between 0 and 60';
  }
  return null;
}

export function validateComment(comment: string): string | null {
  const trimmed = comment.trim();
  if (!trimmed) return 'Comment is required';
  if (trimmed.length < 2) return 'Comment must be at least 2 characters';
  if (trimmed.length > 1000) return 'Comment must be less than 1000 characters';
  return null;
}
