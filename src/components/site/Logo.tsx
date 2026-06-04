import logoUrl from "@/assets/zenvia-logo.png";

export function Logo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="Zenvia Living"
      className={`${className} rounded-full object-contain ring-1 ring-gold/40`}
      width={88}
      height={88}
    />
  );
}
