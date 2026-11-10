/**
 * Progressive form handling for every <form data-form>.
 * - basic validation (required, email, minlength) with inline messages
 * - honeypot (_gotcha): bots get a fake success and nothing is sent
 * - POSTs FormData to the form's action (Formspree) with fetch
 * - inline success / error states
 */

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type State = 'idle' | 'submitting' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setStatus(form: HTMLFormElement, state: State, message: string) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) return;
  status.dataset.state = state;
  status.textContent = message;
}

function fieldMessage(field: Field): string {
  const value = field.value.trim();
  if (field.required && !value) return 'This field is required.';
  if (field instanceof HTMLInputElement && field.type === 'email' && value && !EMAIL_RE.test(value)) {
    return 'Please enter a valid email address.';
  }
  const min = Number(field.getAttribute('minlength') ?? 0);
  if (min > 0 && value && value.length < min) return `Please enter at least ${min} characters.`;
  return '';
}

function showFieldError(form: HTMLFormElement, field: Field, message: string) {
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  const error = form.querySelector<HTMLElement>(`[data-error-for="${field.name}"]`);
  if (error) error.textContent = message;
}

function validate(form: HTMLFormElement): boolean {
  let firstInvalid: Field | null = null;
  form.querySelectorAll<Field>('[data-validate]').forEach((field) => {
    const message = fieldMessage(field);
    showFieldError(form, field, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    (firstInvalid as Field).focus();
    setStatus(form, 'error', 'Please fix the highlighted fields.');
    return false;
  }
  return true;
}

async function submit(form: HTMLFormElement) {
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const successMessage = form.dataset.successMessage || 'Thanks — your message has been sent.';

  // Honeypot filled → silently pretend it worked.
  const honeypot = form.querySelector<HTMLInputElement>('input[name="_gotcha"]');
  if (honeypot && honeypot.value) {
    form.reset();
    setStatus(form, 'success', successMessage);
    return;
  }

  if (!validate(form)) return;

  const endpoint = form.getAttribute('action') ?? '';
  if (!/^https?:\/\//i.test(endpoint)) {
    setStatus(
      form,
      'error',
      'This form is not connected yet. Please use the email address instead.',
    );
    return;
  }

  const urlField = form.querySelector<HTMLInputElement>('input[name="url"]');
  if (urlField && !urlField.value) urlField.value = window.location.href;

  setStatus(form, 'submitting', 'Sending…');
  if (submitButton) submitButton.disabled = true;
  form.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      form.reset();
      form.querySelectorAll<Field>('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
      setStatus(form, 'success', successMessage);
      return;
    }

    let message = 'Something went wrong. Please try again, or email directly.';
    try {
      const data = (await response.json()) as { errors?: Array<{ message?: string }> };
      if (data?.errors?.length) {
        message = data.errors.map((e) => e.message).filter(Boolean).join(' ');
      }
    } catch {
      /* non-JSON error body */
    }
    setStatus(form, 'error', message);
  } catch {
    setStatus(form, 'error', 'Network error. Please check your connection and try again.');
  } finally {
    if (submitButton) submitButton.disabled = false;
    form.removeAttribute('aria-busy');
  }
}

function init() {
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    if (form.dataset.formReady) return;
    form.dataset.formReady = 'true';
    form.noValidate = true;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void submit(form);
    });

    // Re-validate a field once it has been flagged, so errors clear as the user types.
    form.querySelectorAll<Field>('[data-validate]').forEach((field) => {
      field.addEventListener('blur', () => showFieldError(form, field, fieldMessage(field)));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          showFieldError(form, field, fieldMessage(field));
        }
      });
    });
  });
}

init();

export {};
