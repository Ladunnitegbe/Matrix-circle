/**
 * Footer — page/section footer. Accepts either `left`/`right` slots for
 * the common "copyright ... links" layout, or plain `children` for
 * anything else.
 *
 * Accessibility: explicit `role="contentinfo"` rather than relying on
 * the implicit landmark role a bare <footer> gets — that implicit role
 * only applies when the element is a *direct child of body*, which
 * won't be true once this is nested inside AuthLayout/DashboardLayout.
 */
export default function Footer({ left, right, children, className = '' }) {
  const classes = ['border-t border-border px-4 py-6 tablet:px-6 laptop:px-8', className]
    .filter(Boolean)
    .join(' ');

  if (left || right) {
    return (
      <footer role="contentinfo" className={classes}>
        <div className="flex flex-col items-center gap-3 tablet:flex-row tablet:justify-between text-body2 text-ink-muted">
          <div>{left}</div>
          <div className="flex items-center gap-4">{right}</div>
        </div>
      </footer>
    );
  }

  return (
    <footer role="contentinfo" className={classes}>
      {children}
    </footer>
  );
}
