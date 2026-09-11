export const MAX_VISIBLE_TOASTS = 3;
export const DEFAULT_TOAST_AUTO_CLOSE_MS = 4000;

export const TOAST_UI_REQUEST_EVENT = 'teotia:toast-ui-request';

let resolveToastUiReady: (() => void) | undefined;
export const toastUiReady = new Promise<void>((resolve) => {
  resolveToastUiReady = resolve;
});

export function markToastUiReady() {
  resolveToastUiReady?.();
  resolveToastUiReady = undefined;
}

export function requestToastUi() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(TOAST_UI_REQUEST_EVENT));
  }
}
