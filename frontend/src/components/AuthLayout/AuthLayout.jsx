/**
 * AuthLayout — centered single-column shell for onboarding/auth flows.
 * Deliberately minimal chrome: optional brand mark, one centered card,
 * optional footer note.
 *
 * `showBrand` defaults to true, but some Figma auth screens (e.g.
 * Login) show no logo at all above the form — pass `showBrand={false}`
 * for those rather than forcing every consumer to duplicate this
 * layout's markup just to omit one element.
 */
import Logo from '../Logo/Logo.jsx';

export default function AuthLayout({ children, brand, showBrand = true, footerNote, className = '' }) {
  return (
    <div
      className={[
        'min-h-screen flex flex-col items-center justify-center bg-surface px-4 py-8 tablet:py-12 laptop:py-16',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showBrand && <div className="mb-6 tablet:mb-8">{brand || <Logo size="md" withTagline />}</div>}

      <div className="w-full max-w-md rounded-lg bg-primary-light p-6 tablet:p-8 shadow">{children}</div>

      {footerNote && <div className="mt-6 text-body2 text-ink-muted">{footerNote}</div>}
    </div>
  );
}
