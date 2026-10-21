export function Brand({
  junior = false
}: {
  junior?: boolean;
}) {
  return (
    <span className="brand">
      <img
        src="/favicon.svg"
        alt=""
      />
      <span>
        moby
        <span className="brand-suffix">
          {
            junior
              ? 'junior'
              : 'моя семья'
          }
        </span>
      </span>
    </span>
  );
}
