import logoAsset from "@/assets/ansa-nest-logo.jpeg.asset.json";

export function Logo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Ansa Nest — Crafted for Comfort"
      className={`${className} rounded-full object-cover ring-1 ring-gold/40`}
      width={88}
      height={88}
      loading="eager"
      decoding="async"
    />
  );
}
