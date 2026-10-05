/** League mark: a shield holding a disc in flight. Uses currentColor + accent so it themes. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg className="fr-logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M16 2.5 4.5 7v8.2c0 6.6 4.7 12 11.5 14.3 6.8-2.3 11.5-7.7 11.5-14.3V7L16 2.5Z" fill="var(--primary)" />
      <path d="M8 21.5c2.3-1.1 4.9-3.6 6.2-6.4 1-2.2 3.2-4.1 9.8-5.1" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none" strokeDasharray="0.1 3" />
      <ellipse cx="18.5" cy="17.5" rx="6.2" ry="2.6" transform="rotate(-18 18.5 17.5)" fill="var(--primary-fg)" />
      <ellipse cx="18.5" cy="17.1" rx="3.4" ry="1.2" transform="rotate(-18 18.5 17.1)" fill="none" stroke="var(--primary)" strokeOpacity=".35" strokeWidth=".9" />
    </svg>
  );
}
