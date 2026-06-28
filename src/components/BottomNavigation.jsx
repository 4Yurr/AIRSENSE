import { Bell, ChartNoAxesColumnIncreasing, Home } from 'lucide-react';

const items = [
  { label: 'Dashboard', icon: Home, active: true },
  { label: 'Riwayat', icon: ChartNoAxesColumnIncreasing, active: false },
  { label: 'Notifikasi', icon: Bell, active: false },
];

function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 pb-3 pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold transition ${
                item.active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
              key={item.label}
              type="button"
            >
              <Icon aria-hidden="true" size={20} strokeWidth={2.4} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
