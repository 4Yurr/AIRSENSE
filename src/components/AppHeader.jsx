import logo from '../assets/airsense-mark.svg';

function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <img className="h-12 w-12 rounded-lg shadow-soft" src={logo} alt="AIRSENSE" />
        <div>
          <p className="text-xs font-bold uppercase text-brand-700">AIRSENSE</p>
          <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Dashboard</h1>
        </div>
      </div>
      <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
        Realtime
      </div>
    </header>
  );
}

export default AppHeader;
