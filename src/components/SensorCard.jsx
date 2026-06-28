function SensorCard({ icon: Icon, label, value, unit, status, tone = 'blue', isLoading = false }) {
  const tones = {
    blue: {
      icon: 'bg-blue-50 text-blue-700',
      badge: 'bg-blue-50 text-blue-700 ring-blue-100',
      bar: 'bg-blue-500',
    },
    yellow: {
      icon: 'bg-yellow-50 text-yellow-700',
      badge: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
      bar: 'bg-yellow-500',
    },
    red: {
      icon: 'bg-red-50 text-red-700',
      badge: 'bg-red-50 text-red-700 ring-red-100',
      bar: 'bg-red-500',
    },
  };
  const selectedTone = tones[tone] ?? tones.blue;

  return (
    <article className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className={`absolute inset-x-0 top-0 h-1 ${selectedTone.bar}`} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-lg ${selectedTone.icon}`}>
          <Icon aria-hidden="true" size={21} strokeWidth={2.3} />
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${selectedTone.badge}`}>
          {status}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {isLoading ? (
        <div className="mt-3 h-9 w-24 animate-pulse rounded-md bg-slate-100" />
      ) : (
        <div className="mt-1 flex items-end gap-1">
          <span className="text-3xl font-bold text-slate-950">{value}</span>
          <span className="pb-1 text-sm font-semibold text-slate-500">{unit}</span>
        </div>
      )}
    </article>
  );
}

export default SensorCard;
