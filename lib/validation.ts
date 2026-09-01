const EMAIL_REGEX =
  /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length < 3) return 'Name must be at least 3 characters.';
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
  if (
    trimmed.includes('..') ||
    trimmed.startsWith('.') ||
    trimmed.endsWith('.') ||
    trimmed.includes('@.') ||
    trimmed.includes('.@') ||
    !EMAIL_REGEX.test(trimmed)
  ) {
    return 'Please enter a valid email.';
  }
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
  if (!trimmed) return 'Please enter your current location.';
  if (trimmed.length < 3) return 'Please enter a valid current location.';
  if (trimmed.length > 255) return 'Location must be less than 255 characters';
  return null;
}

export function sanitizeExperienceYearsInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const dotIndex = cleaned.indexOf('.');
  let whole = dotIndex === -1 ? cleaned : cleaned.slice(0, dotIndex);
  const hasDot = dotIndex !== -1;
  const frac = hasDot
    ? cleaned.slice(dotIndex + 1).replace(/\./g, '').slice(0, 1)
    : '';

  whole = whole.replace(/^0+(?=\d)/, '').slice(0, 2);
  if (hasDot) {
    return `${whole || '0'}.${frac}`;
  }
  return whole;
}

export function validateExperienceYears(value: string): string | null {
  const trimmed = value.trim().endsWith('.')
    ? value.trim().slice(0, -1)
    : value.trim();
  if (!trimmed) return 'Years of experience is required';
  if (!/^\d{1,2}(\.\d)?$/.test(trimmed)) {
    return 'Enter years of experience with at most one decimal place.';
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 80) {
    return 'Enter years of experience between 0 and 80.';
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

/** Job description (About this role) — stored as LONGTEXT. */
export const JOB_ABOUT_ROLE_MIN = 20;
export const JOB_ABOUT_ROLE_MAX = 10_000;

/** Key responsibilities — optional LONGTEXT. */
export const JOB_RESPONSIBILITIES_MIN = 20;
export const JOB_RESPONSIBILITIES_MAX = 10_000;

/** Requirements — optional LONGTEXT. */
export const JOB_REQUIREMENTS_MIN = 20;
export const JOB_REQUIREMENTS_MAX = 10_000;

/** Required skills — optional LONGTEXT. */
export const JOB_REQUIRED_SKILLS_MIN = 10;
export const JOB_REQUIRED_SKILLS_MAX = 2_000;

function validateOptionalJobText(
  value: string,
  min: number,
  max: number,
  label: string,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length < min) {
    return `${label} must be at least ${min} characters.`;
  }
  if (trimmed.length > max) {
    return `${label} must be less than ${max} characters.`;
  }
  return null;
}

export function validateJobAboutRole(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter about this role.';
  if (trimmed.length < JOB_ABOUT_ROLE_MIN) {
    return `About this role must be at least ${JOB_ABOUT_ROLE_MIN} characters.`;
  }
  if (trimmed.length > JOB_ABOUT_ROLE_MAX) {
    return `About this role must be less than ${JOB_ABOUT_ROLE_MAX} characters.`;
  }
  return null;
}

export function validateJobResponsibilities(value: string): string | null {
  return validateOptionalJobText(
    value,
    JOB_RESPONSIBILITIES_MIN,
    JOB_RESPONSIBILITIES_MAX,
    'Key responsibilities',
  );
}

export function validateJobRequirements(value: string): string | null {
  return validateOptionalJobText(
    value,
    JOB_REQUIREMENTS_MIN,
    JOB_REQUIREMENTS_MAX,
    'Requirements',
  );
}

export function validateJobRequiredSkills(value: string): string | null {
  return validateOptionalJobText(
    value,
    JOB_REQUIRED_SKILLS_MIN,
    JOB_REQUIRED_SKILLS_MAX,
    'Required skills',
  );
}
