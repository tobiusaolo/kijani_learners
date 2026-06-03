/** Subtle indicator when cached data is refreshing in the background. */
export default function CacheStatus({ revalidating }) {
  if (!revalidating) return null;
  return (
    <span
      className="cache-status"
      style={{
        fontSize: '0.75rem',
        color: 'var(--grey-400)',
        marginLeft: '0.5rem',
      }}
      aria-live="polite"
    >
      Updating…
    </span>
  );
}
