export default function Avatar({ name = '', color = '#7C3AED', size = 'md', src }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeMap = {
    xs:  'w-6 h-6 text-[10px]',
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-14 h-14 text-lg',
    xl:  'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-900`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white dark:ring-slate-900 select-none`}
      style={{ backgroundColor: color }}
      aria-label={name}
    >
      {initials || '?'}
    </div>
  );
}
