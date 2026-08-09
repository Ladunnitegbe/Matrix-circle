import Input from '../Input/Input.jsx';
function sanitizePhone(value) { return value.replace(/[^\d+\s]/g, ''); }
export default function PhoneInput({ label = 'Phone Number', onChange, ...rest }) {
  function handleChange(e) {
    e.target.value = sanitizePhone(e.target.value);
    onChange?.(e);
  }
  return <Input type="tel" inputMode="tel" label={label} placeholder="+234 xxx xxx xxxx" onChange={handleChange} {...rest} />;
}
