'use client';

import { toast } from '@/lib/toast';

const CONTACT_FIELD_ORDER = [
  'name',
  'phone',
  'email',
  'serviceType',
  'subject',
  'message',
] as const;

export function scrollToFirstInvalidField(
  errors: Record<string, string>,
  fieldOrder: readonly string[],
  idMap?: Record<string, string>
) {
  const firstKey = fieldOrder.find((key) => errors[key]);
  if (!firstKey) return;

  const elementId = idMap?.[firstKey] ?? firstKey;
  const element = document.getElementById(elementId);
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (element instanceof HTMLElement) {
    element.focus({ preventScroll: true });
  }
}

export function showValidationToasts(
  errors: Record<string, string>,
  options?: {
    fieldOrder?: readonly string[];
    idMap?: Record<string, string>;
  }
) {
  const messages = Object.values(errors).filter(Boolean);

  if (messages.length === 0) return;

  if (messages.length === 1) {
    toast.error(messages[0]);
  } else {
    toast.error(
      <div className="validation-toast">
        <p className="validation-toast-title">Please complete the required fields:</p>
        <ul className="validation-toast-list">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>,
      { autoClose: 6000 }
    );
  }

  scrollToFirstInvalidField(
    errors,
    options?.fieldOrder ?? CONTACT_FIELD_ORDER,
    options?.idMap
  );
}
