import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout.jsx';
import Input from '../../components/Input/Input.jsx';
import PasswordField from '../../components/PasswordField/PasswordField.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import { login } from '../../api/auth.js';
import { setSession } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Login — matches `login-1.png` (desktop) exactly: "Welcome Back" /
 * "Reconnect with your email and password" / "Login" button. Note:
 * the mobile export (`login.png`) shows different copy entirely
 * ("Welcome to FoodShare" / "Join the community...", a "Continue"
 * button) — that's the Registration frame's text, and appears to be a
 * Figma export mistake (an onboarding message doesn't belong on a
 * returning-user login screen) rather than an intentional
 * mobile/desktop difference. Going with the desktop frame, which is
 * internally consistent and matches what was already implemented here.
 *
 * Admin redirect: `role === 'admin' ? '/admin' : ...` — this was
 * already proposed and reasoned through when the Admin pages were
 * built, but this copy of the file didn't have it (the project was
 * re-uploaded without that specific edit applied). Restored here so
 * an admin logging in actually lands on `/admin` instead of bouncing
 * off `/discover` via `RequireAuth`.
 *
 * Analytics: none of this existed before (zero `trackEvent` calls).
 * Same attempt/outcome trio as Registration, for the same reason — a
 * real API call with real, distinct failure modes (wrong password,
 * rate limiting, network failure) deserves an outcome event, not just
 * a page view. `login_viewed` fires once on mount.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  useEffect(() => {
    trackEvent('login_viewed', {});
  }, []);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    trackEvent('login_attempted', {});
    try {
      const data = await login({ email, password });
      setSession(data.token, data.account);
      trackEvent('login_succeeded', { account_id: data.account.id, role: data.account.role });
      const destination =
        data.account.role === 'vendor' ? '/vendor/dashboard' : data.account.role === 'admin' ? '/admin' : '/discover';
      navigate(destination);
    } catch (err) {
      let message = 'Something went wrong. Please try again.';
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          const next = {};
          err.errors.forEach((fieldErr) => {
            const key = fieldErr.field.replace(/^body\./, '');
            next[key] = fieldErr.message;
          });
          setFieldErrors((prev) => ({ ...prev, ...next }));
          message = 'Please fix the highlighted fields.';
        } else {
          // Covers 401 ("Invalid credentials"), 429, network failure —
          // all plain-`msg` errors per the docs.
          setFormError(err.msg);
          message = err.msg;
        }
      } else {
        setFormError(message);
      }
      trackEvent('login_failed', { reason: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout showBrand={false}>
      <h1 className="mb-1 text-center text-sh1 font-bold text-accent-green">Welcome Back</h1>
      <p className="mb-6 text-center text-body2 text-ink-muted">Reconnect with your email and password</p>

      {formError && (
        <Alert tone="error" className="mb-4">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(fieldErrors.email)}
          caption1={fieldErrors.email}
          autoComplete="email"
          required
        />
        <PasswordField
          label="Password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={Boolean(fieldErrors.password)}
          caption1={fieldErrors.password || 'Minimum of 8 characters'}
          autoComplete="current-password"
          required
        />
        <Button type="submit" color="accent" variant="solid" fullWidth loading={submitting} disabled={!canSubmit}>
          Login
        </Button>
      </form>
    </AuthLayout>
  );
}
