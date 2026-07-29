/**
 * SectionHeader — title + optional description + optional right-aligned
 * action, used at the top of a page section.
 *
 * Accessibility: `as` lets the caller choose the correct heading level
 * (h1–h4) for the surrounding document outline. Defaults to `h2` since
 * a page's own `h1` almost always lives elsewhere (page title, layout
 * shell) and a section header is rarely the top-level heading.
 */
export default function SectionHeader({
  title,
  description,
  action,
  as = 'h2',
  className = '',
}) {
  const Heading = as;

  return (
    <div
      className={[
        'flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="min-w-0">
        <Heading className="text-sh2 tablet:text-sh1 font-bold text-ink">{title}</Heading>
        {description && <p className="mt-1 text-body2 text-ink-muted">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
