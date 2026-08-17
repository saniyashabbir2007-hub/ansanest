function SectionHead({ 
  eyebrow, 
  title, 
  inline 
}: { 
  eyebrow: string; 
  title: string; 
  inline?: boolean 
}) {
  return (
    <div className={inline ? "" : "text-center"}>
      <div className="text-xs uppercase tracking-[0.25em] text-emerald">
        {eyebrow}
      </div>

      <h2 className="mt-3 font-display text-4xl text-balance text-foreground md:text-5xl">
        {title}
      </h2>
    </div>
  );
}

export default SectionHead;