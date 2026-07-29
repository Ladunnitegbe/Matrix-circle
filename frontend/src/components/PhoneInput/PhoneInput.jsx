import Input from '../Input/Input.jsx';

/**
 * PhoneInput — Input preconfigured for phone numbers: `type="tel"`,
 * the Figma's placeholder format, and light sanitization (strips
 * anything that isn't a digit, space, or leading `+` as the user
 * types). Deliberately not a full input mask — the API only requires
 * a 10–15 character string, no specific format — so this stays simple
 * rather than risking cursor-jumping bugs from a heavier mask.
 */
function sanitizePhone(value) {
  return value.replace(/[^\d+\s]/g, '');
}

export default function PhoneInput({ label = 'Phone Number', onChange, ...rest }) {
  function handleChange(e) {
    e.target.value = sanitizePhone(e.target.value);
    onChange?.(e);
  }

  return (
    <Input
      type="tel"
      inputMode="tel"
      label={label}
      placeholder="+234 xxx xxx xxxx"
      onChange={handleChange}
      {...rest}
    />
  );
}
