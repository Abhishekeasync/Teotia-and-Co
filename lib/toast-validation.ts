import { toast } from 'sonner';

export function showValidationToasts(errors: Record<string, string>) {
  const messages = Object.values(errors).filter(Boolean);

  if (messages.length === 0) return;

  if (messages.length === 1) {
    toast.error(messages[0]);
    return;
  }

  toast.error('Please fix the following errors', {
    description: messages.map((message) => `• ${message}`).join('\n'),
  });
}
