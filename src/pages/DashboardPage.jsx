import { AlertTriangle, Clock3, Droplets, ShieldAlert, SunMedium, Thermometer, Wind } from 'lucide-react';
import AppHeader from '../components/AppHeader.jsx';
import BottomNavigation from '../components/BottomNavigation.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import SensorCard from '../components/SensorCard.jsx';
import useLatestSensorData from '../hooks/useLatestSensorData.js';

const riskContent = {
  Rendah: {
    tone: 'blue',
    title: 'Risiko Asma Rendah',
    message: 'Kondisi lingkungan berada dalam batas aman untuk aktivitas ringan.',
    panel: 'bg-blue-600',
    icon: 'bg-white/15 text-blue-50',
  },
  Sedang: {
    tone: 'yellow',
    title: 'Risiko Asma Sedang',
    message: 'Perhatikan kualitas udara dan batasi paparan jika mulai terasa tidak nyaman.',
    panel: 'bg-yellow-500',
    icon: 'bg-white/20 text-yellow-50',
  },
  Tinggi: {
    tone: 'red',
    title: 'Risiko Asma Tinggi',
    message: 'Kurangi aktivitas luar ruangan dan gunakan tindakan pencegahan.',
    panel: 'bg-red-600',
    icon: 'bg-white/15 text-red-50',
  },
};

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Belum ada update';
  }

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Format timestamp tidak valid';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getSensorTone(riskLevel) {
  if (riskLevel === 'Tinggi') return 'red';
  if (riskLevel === 'Sedang') return 'yellow';
  return 'blue';
}

function DashboardPage() {
  const { sensorData, error, isLoading, status } = useLatestSensorData();
  const hasData = status === 'ready';
  const isEmpty = status === 'empty';
  const hasError = status === 'error';
  const risk = riskContent[sensorData.riskLevel] ?? riskContent.Rendah;
  const updatedAt = isLoading ? 'Menghubungkan ke Firestore...' : formatTimestamp(sensorData.timestamp);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader />

        <section className={`rounded-lg p-5 text-white shadow-soft sm:p-6 lg:p-7 ${risk.panel}`}>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <div className={`mb-5 grid h-12 w-12 place-items-center rounded-lg ${risk.icon}`}>
                <ShieldAlert aria-hidden="true" size={27} strokeWidth={2.3} />
              </div>
              <p className="text-sm font-bold uppercase text-white/75">Status Risiko Asma</p>
              {isLoading ? (
                <div className="mt-3 space-y-3">
                  <div className="h-8 w-56 animate-pulse rounded-md bg-white/20" />
                  <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-white/20" />
                </div>
              ) : (
                <>
                  <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{risk.title}</h2>
                  <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/85 sm:text-base">
                    {hasError
                      ? 'Dashboard menampilkan data default karena koneksi Firestore belum tersedia.'
                      : risk.message}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-lg bg-white p-4 text-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Level saat ini</p>
                  <div className="mt-2">
                    <RiskBadge level={sensorData.riskLevel} />
                  </div>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <AlertTriangle aria-hidden="true" size={22} strokeWidth={2.3} />
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                <Clock3 aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
                <span>{updatedAt}</span>
              </div>
            </div>
          </div>
        </section>

        {hasError && (
          <section className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-800">
            <h2 className="text-sm font-bold">Gagal membaca data Firestore</h2>
            <p className="mt-1 text-sm leading-6">
              {error?.message ?? 'Periksa konfigurasi Firebase, koneksi internet, dan Firestore rules.'}
            </p>
          </section>
        )}

        {isEmpty && (
          <section className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-800">
            <h2 className="text-sm font-bold">Data sensor belum tersedia</h2>
            <p className="mt-1 text-sm leading-6">
              Buat dokumen <span className="font-semibold">sensor_data/latest</span> di Firestore agar dashboard
              menampilkan data dari ESP32.
            </p>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Sensor Realtime</h2>
              <p className="mt-1 text-sm text-slate-500">DHT22, MQ135, dan GUVA-S12D</p>
            </div>
            <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 sm:inline-flex">
              ESP32
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SensorCard
              icon={Thermometer}
              isLoading={isLoading}
              label="Temperature"
              status={hasData ? 'Normal' : 'Default'}
              tone="blue"
              unit="C"
              value={sensorData.temperature}
            />
            <SensorCard
              icon={Droplets}
              isLoading={isLoading}
              label="Humidity"
              status={hasData ? 'Normal' : 'Default'}
              tone="blue"
              unit="%"
              value={sensorData.humidity}
            />
            <SensorCard
              icon={Wind}
              isLoading={isLoading}
              label="Air Quality"
              status={sensorData.riskLevel === 'Tinggi' ? 'Bahaya' : hasData ? 'Realtime' : 'Default'}
              tone={getSensorTone(sensorData.riskLevel)}
              unit="AQI"
              value={sensorData.airQuality}
            />
            <SensorCard
              icon={SunMedium}
              isLoading={isLoading}
              label="UV Index"
              status={sensorData.uvIndex >= 8 ? 'Tinggi' : hasData ? 'Realtime' : 'Default'}
              tone={sensorData.uvIndex >= 8 ? 'red' : sensorData.uvIndex >= 6 ? 'yellow' : 'blue'}
              unit="UV"
              value={sensorData.uvIndex}
            />
          </div>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
}

export default DashboardPage;
