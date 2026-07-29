/**
 * FormSection — groups related form controls under a title and
 * optional description.
 *
 * Accessibility: uses native <fieldset>/<legend> rather than a div +
 * heading. This gives every contained input an implicit group label
 * for assistive tech, and — as a bonus — setting `disabled` on a
 * <fieldset> natively disables every form control inside it, so a
 * whole section can be disabled in one place instead of prop-drilling
 * `disabled` to each field individually.
 */
export default function FormSection({
  title,
  description,
  children,
  disabled = false,
  className = '',
}) {
  return (
    <fieldset
      disabled={disabled}
      className={['border-0 p-0 m-0 disabled:opacity-50', className].filter(Boolean).join(' ')}
    >
      {title && <legend className="w-full mb-1 text-sh2 font-bold text-ink">{title}</legend>}
      {description && <p className="mb-4 text-body2 text-ink-muted">{description}</p>}
      <div className="flex flex-col gap-4 tablet:gap-5">{children}</div>
    </fieldset>
  );
}
