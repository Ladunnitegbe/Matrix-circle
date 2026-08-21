import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout.jsx';
import Input from '../../components/Input/Input.jsx';
import PhoneInput from '../../components/PhoneInput/PhoneInput.jsx';
import LocationField from '../../components/LocationField/LocationField.jsx';
import PasswordField from '../../components/PasswordField/PasswordField.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import { register } from '../../api/auth.js';
import { setSession } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';

const TABS = [
  { value: 'individual', label: 'Individual' },
  { value: 'charity', label: 'Charity Organization' },
  { value: 'vendor', label: 'Vendor' },
];

const NAME_LABEL = {
  individual: 'Full Name/Business Name',
  charity: 'Full Name',
  vendor: 'Business Name',
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

/**
 * Registration — matches `registration_-_individual/charity/vendor(-1).png`
 * across all three roles (each has a desktop + mobile pair, same
 * content). Rebuilt against these; the previous version had drifted
 * from the design in several concrete ways:
 *
 * 1. TAB STRIP, NOT A DROPDOWN. Every screenshot shows three
 *    horizontal tabs ("Individual / Charity Organization / Vendor")
 *    with a green underline on the active one — the previous version
 *    used a `<Select label="Account Type">` dropdown instead, which
 *    doesn't appear anywhere in the Figma. Rebuilt as real tabs.
 *
 * 2. ONE NAME FIELD, NOT TWO. The previous version showed a generic
 *    "Name" input on every tab AND a separate "Business or Vendor
 *    Name" input when Vendor was selected — two name-like fields at
 *    once, which the Figma never shows (Vendor's tab has exactly one:
 *    "Business Name"). Now a single field whose LABEL changes per tab
 *    ("Full Name/Business Name" / "Full Name" / "Business Name",
 *    matching each screenshot's literal copy) bound to one state
 *    value. On submit, that value is sent as `name` always (the
 *    backend's `registerBodySchema` requires it unconditionally,
 *    even for vendors) AND additionally as `businessName` when the
 *    role is vendor — `auth.service.ts`'s register function never
 *    actually reads `name` for a vendor account, only `businessName`,
 *    so sending the same single value under both keys satisfies
 *    validation and stores the meaningful one, without asking a
 *    vendor to type their business name twice.
 *
 * 3. Copy corrected to match the screenshots literally instead of
 *    invented variants: the name placeholder is "Jane Doe" on every
 *    tab (was "Businessname" / "Ma's Kitchen" for non-individual —
 *    not in any screenshot); email placeholder is always
 *    "name@example.com" (was swapping to "businessname@example.com"
 *    outside the Individual tab — also invented); the charity field
 *    is labeled "Reg Number" (was "Registration Number"); and the
 *    submit button always reads "Continue" (was "Verify & Enter" for
 *    Charity — no screenshot shows that; all three show "Continue").
 *
 * Field order per tab now matches each screenshot exactly: Name →
 * Email → Phone → [Reg Number, charity only] → [Location, vendor
 * only] → Password.
 *
 * ADDRESS FIELD — ADDED, NOT IN ANY SCREENSHOT: `auth.service.ts`
 * (commit `b3dd138`) now enforces `address` as required for vendor
 * registration at runtime — `if (!data.businessName ||
 * !data.coordinates || !data.address) throw BadRequestError(...)` —
 * even though `auth.validation.ts`'s Zod schema marks it
 * `.optional()` (the schema is shared across all three roles; the
 * per-role requirement lives in the service layer instead). This page
 * never collected or sent `address` at all before this change, which
 * meant every single vendor registration attempt was failing with
 * that 400, unconditionally — not an edge case, a total block on
 * vendor signup. No Figma frame shows this field since it postdates
 * the registration screenshots this page was built against; placed
 * before Location (a street address logically precedes pinning exact
 * coordinates) as a reasonable default, worth confirming against a
 * real design once one exists. Validated to the same `min(5)` the
 * backend's Zod schema enforces.
 *
 * Analytics: none of this existed before (zero `trackEvent` calls).
 * `registration_viewed` fires once on mount. `registration_role_selected`
 * fires on every tab switch — a real funnel signal (which role people
 * consider before committing), not just decoration. `registration_attempted`
 * / `registration_succeeded` / `registration_failed` mirror the same
 * attempt/outcome trio already used on Claim Food's real API action,
 * for the same reason: a page with a real backend call that can
 * genuinely fail (duplicate email/phone, validation) deserves an
 * outcome event, not just a page-view. None of this is part of the
 * original Event Tracking Plan — same extension caveat as everywhere
 * else in this project.
 */
export default function RegistrationPage() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [charityRegNumber, setCharityRegNumber] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isCharity = accountType === 'charity';
  const isVendor = accountType === 'vendor';

  useEffect(() => {
    trackEvent('registration_viewed', { role: accountType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTabChange(value) {
    setAccountType(value);
    setFieldErrors({});
    setFormError('');
    trackEvent('registration_role_selected', { role: value });
  }

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    password.length > 0 &&
    (!isCharity || charityRegNumber.trim().length > 0) &&
    (!isVendor || (address.trim().length > 0 && location !== null));

  function validate() {
    const next = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your name (min 2 characters).';
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.';

    const phoneDigits = digitsOnly(phoneNumber);
    if (phoneDigits.length < 10 || phoneDigits.length > 15) next.phoneNumber = 'Enter a valid phone number (10–15 digits).';

    if (password.length < 8) next.password = 'Minimum of 8 characters.';

    if (isCharity && charityRegNumber.trim().length < 3) next.charityRegNumber = 'Enter your registration number (min 3 characters).';

    if (isVendor && address.trim().length < 5) next.address = 'Enter your business address (min 5 characters).';
    if (isVendor && !location) next.location = 'Set your location to continue.';

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
      payload.businessName = fullName; // same single field the Figma shows once — see file header comment
      payload.address = address;
      payload.coordinates = [location.lng, location.lat]; // API expects [lng, lat]
    }

    setSubmitting(true);
    trackEvent('registration_attempted', { role: accountType });
    try {
      const data = await register(payload);
      setSession(data.token, data.account);
      trackEvent('registration_succeeded', { role: data.account.role, account_id: data.account.id });
      const destination = data.account.role === 'vendor' ? '/vendor/dashboard' : '/discover';
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
        } else if (err.msg === 'Email already registered') {
          setFieldErrors((prev) => ({ ...prev, email: err.msg }));
          message = err.msg;
        } else if (err.msg === 'Phone number already registered') {
          setFieldErrors((prev) => ({ ...prev, phoneNumber: err.msg }));
          message = err.msg;
        } else {
          setFormError(err.msg);
          message = err.msg;
        }
      } else {
        setFormError(message);
      }
      trackEvent('registration_failed', { role: accountType, reason: message });
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

      <div className="mb-6 flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={[
              'flex-1 border-b-2 pb-2.5 text-center text-body2 font-semibold transition-colors',
              accountType === tab.value
                ? 'border-accent-green text-accent-green'
                : 'border-transparent text-ink-muted hover:text-ink',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {formError && (
        <Alert tone="error" className="mb-4">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={NAME_LABEL[accountType]}
          placeholder="Jane Doe"
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
          placeholder="name@example.com"
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

        {isCharity && (
          <Input
            label="Reg Number"
            placeholder="CH-123456"
            value={charityRegNumber}
            onChange={(e) => setCharityRegNumber(e.target.value)}
            error={Boolean(fieldErrors.charityRegNumber)}
            caption1={fieldErrors.charityRegNumber}
            required
          />
        )}

        {isVendor && (
          <Input
            label="Business Address"
            placeholder="12 Allen Avenue, Ikeja, Lagos"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={Boolean(fieldErrors.address)}
            caption1={fieldErrors.address}
            autoComplete="street-address"
            required
          />
        )}

        {isVendor && (
          <LocationField value={location} onLocate={setLocation} error={Boolean(fieldErrors.location)} caption1={fieldErrors.location} required />
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
          Continue
        </Button>
      </form>
    </AuthLayout>
  );
}
  