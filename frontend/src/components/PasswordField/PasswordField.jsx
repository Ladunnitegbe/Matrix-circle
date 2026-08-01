import { useState } from 'react';
import Input from '../Input/Input.jsx';
import { EyeIcon, EyeOffIcon } from '../Icon/Icon.jsx';
export default function PasswordField({ label, ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      type={visible ? 'text' : 'password'}
      label={label}
      trailingAction={
        <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}
          className="rounded text-ink-faint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange">
          {visible ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
        </button>
      }
      {...rest}
    />
  );
}
