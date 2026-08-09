import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout.jsx';
import Input from '../../components/Input/Input.jsx';
import PhoneInput from '../../components/PhoneInput/PhoneInput.jsx';
import LocationField from '../../components/LocationField/LocationField.jsx';
import PasswordField from '../../components/PasswordField/PasswordField.jsx';
import Select from '../../components/Select/Select.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import { register } from '../../api/auth.js';
import { setSession } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'charity', label: 'Charity Organization' },
  { value: 'vendor', label: 'Vendor' },
];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

export default function RegistrationPage() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [charityRegNumber, setCharityRegNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isCharity = accountType === 'charity';
  const isVendor = accountType === 'vendor';
  const submitLabel = isCharity ? 'Verify & Enter' : 'Continue';
  const namePlaceholder = accountType === 'individual' ? 'Jane Doe' : 'Businessname';

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    password.length > 0 &&
    (!isCharity || charityRegNumber.trim().length > 0) &&
    (!isVendor || (businessName.trim().length > 0 && location !== null));

  function validate() {
    const next = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your name (min 2 characters).';
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.';

    const phoneDigits = digitsOnly(phoneNumber);
    if (phoneDigits.length < 10 || phoneDigits.length > 15) next.phoneNumber = 'Enter a valid phone number (10–15 digits).';

    if (password.length < 8) next.password = 'Minimum of 8 characters.';

    if (isCharity && charityRegNumber.trim().length < 3) next.charityRegNumber = 'Enter your registration number (min 3 characters).';

    if (isVendor) {
      if (businessName.trim().length < 2) next.businessName = 'Enter your business or vendor name (min 2 characters).';
      if (!location) next.location = 'Set your location to continue.';
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    const payload = { email, phoneNumber, password, role: accountType, name: fullName };
    if (isCharity) payload.charityRegNumber = charityRegNumber;
    if (isVendor) {
      payload.businessName = businessName;
      payload.coordinates = [location.lng, location.lat]; // API expects [lng, lat]
    }

    setSubmitting(true);
    try {
      const data = await register(payload);
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
        } else if (err.msg === 'Email already registered') {
          setFieldErrors((prev) => ({ ...prev, email: err.msg }));
        } else if (err.msg === 'Phone number already registered') {
          setFieldErrors((prev) => ({ ...prev, phoneNumber: err.msg }));
        } else {
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
      <h1 className="mb-1 text-center text-sh1 font-bold text-accent-green">Welcome to FoodShare</h1>
      <p className="mb-6 text-center text-body2 text-ink-muted">
        Join the community to share surplus meals or find available food nearby.
      </p>

      {formError && (
        <Alert tone="error" className="mb-4">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Name"
          placeholder={namePlaceholder}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={Boolean(fieldErrors.fullName)}
          caption1={fieldErrors.fullName}
          autoComplete="name"
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder={accountType === 'individual' ? 'name@example.com' : 'businessname@example.com'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(fieldErrors.email)}
          caption1={fieldErrors.email}
          autoComplete="email"
          required
        />

        <PhoneInput
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={Boolean(fieldErrors.phoneNumber)}
          caption1={fieldErrors.phoneNumber}
          autoComplete="tel"
          required
        />

        <Select label="Account Type" value={accountType} onChange={(e) => setAccountType(e.target.value)} options={ACCOUNT_TYPE_OPTIONS} required />

        {isCharity && (
          <Input
            label="Registration Number"
            placeholder="CH-123456"
            value={charityRegNumber}
            onChange={(e) => setCharityRegNumber(e.target.value)}
            error={Boolean(fieldErrors.charityRegNumber)}
            caption1={fieldErrors.charityRegNumber}
            required
          />
        )}

        {isVendor && (
          <>
            <Input
              label="Business or Vendor Name"
              placeholder="Ma's Kitchen"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={Boolean(fieldErrors.businessName)}
              caption1={fieldErrors.businessName}
              required
            />
            <LocationField value={location} onLocate={setLocation} error={Boolean(fieldErrors.location)} caption1={fieldErrors.location} required />
          </>
        )}

        <PasswordField
          label="Password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={Boolean(fieldErrors.password)}
          caption1={fieldErrors.password || 'Minimum of 8 characters'}
          autoComplete="new-password"
          required
        />

        <Button type="submit" color="accent" variant="solid" fullWidth loading={submitting} disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </form>
    </AuthLayout>
  );
}
