import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo.jsx';
import { ArrowLeftIcon } from '../Icon/Icon.jsx';

/**
 * AuthLayout — centered single-column shell for onboarding/auth flows.
 * `showBrand` defaults to true, but Login/Registration show no logo at
 * all in the Figma — those pages pass `showBrand={false}`.
 *
 * `showBackLink` (default true) renders a "Back to FoodShare" link to
 * `/` above the card — added here rather than in each page, so both
 * Login and Registration get it without duplicating the same markup.
 */
export default function AuthLayout({ children, brand, showBrand = true, showBackLink = true, footerNote, className = '' }) {
  return (
    <div className={['min-h-screen flex flex-col items-center justify-center bg-surface px-4 py-8 tablet:py-12 laptop:py-16', className].filter(Boolean).join(' ')}>
      <div className="w-full max-w-md">
        {showBackLink && (
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 rounded text-body2 font-medium text-ink-muted hover:text-accent-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            <ArrowLeftIcon width={16} height={16} />
            Back to FoodShare
          </Link>
        )}

        {showBrand && <div className="mb-6 flex justify-center tablet:mb-8">{brand || <Logo size="md" withTagline />}</div>}

        <div className="rounded-lg bg-primary-light p-6 tablet:p-8 shadow">{children}</div>
      </div>

      {footerNote && <div className="mt-6 text-body2 text-ink-muted">{footerNote}</div>}
    </div>
  );
}
