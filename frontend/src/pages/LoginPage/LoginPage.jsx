import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout.jsx';
import Input from '../../components/Input/Input.jsx';
import PasswordField from '../../components/PasswordField/PasswordField.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import { login } from '../../api/auth.js';
import { setSession } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

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
    try {
      const data = await login({ email, password });
      setSession(data.token, data.account);
      const destination = data.account.role === 'vendor' ? '/vendor/dashboard' : '/discover';
      navigate(destination);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          const next = {};
          err.errors.forEach((fieldErr) => {
            const key = fieldErr.field.replace(/^body\./, '');
            next[key] = fieldErr.message;
          });
          setFieldErrors((prev) => ({ ...prev, ...next }));
        } else {
          // Covers 401 ("Invalid credentials"), 429, network failure —
          // all plain-`msg` errors per the docs.
          setFormError(err.msg);
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
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
