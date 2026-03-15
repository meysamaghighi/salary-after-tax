export default function Flag({
  code,
  size = 20,
  className = "",
}: {
  code: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={code}
      className={`inline-block ${className}`}
      loading="lazy"
    />
  );
}
