interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald">
            {eyebrow}
          </p>
        )}

        <h2 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}