import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config.js';

export const defaultSensorData = {
  temperature: 0,
  humidity: 0,
  airQuality: 0,
  uvIndex: 0,
  riskLevel: 'Rendah',
  timestamp: null,
};

export function subscribeToLatestSensorData(onData, onError) {
  if (!isFirebaseConfigured) {
    const timeoutId = window.setTimeout(() => {
      onError?.(new Error('Konfigurasi Firebase belum lengkap. Periksa file .env.local.'));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }

  const latestSensorRef = doc(db, 'sensor_data', 'latest');

  return onSnapshot(
    latestSensorRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(defaultSensorData, { exists: false });
        return;
      }

      onData({
        ...defaultSensorData,
        ...snapshot.data(),
      }, { exists: true });
    },
    (error) => {
      onError?.(error);
    },
  );
}
