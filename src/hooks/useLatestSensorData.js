import { useEffect, useState } from 'react';
import { defaultSensorData, subscribeToLatestSensorData } from '../services/sensorService.js';

function useLatestSensorData() {
  const [sensorData, setSensorData] = useState(defaultSensorData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let unsubscribe = () => {};
    const loadingTimeoutId = window.setTimeout(() => {
      setError(new Error('Firestore belum merespons. Periksa koneksi internet dan konfigurasi Firebase.'));
      setSensorData(defaultSensorData);
      setStatus('error');
      setIsLoading(false);
    }, 10000);

    try {
      unsubscribe = subscribeToLatestSensorData(
        (data, meta = { exists: true }) => {
          window.clearTimeout(loadingTimeoutId);
          setSensorData(data);
          setError(null);
          setStatus(meta.exists ? 'ready' : 'empty');
          setIsLoading(false);
        },
        (firebaseError) => {
          window.clearTimeout(loadingTimeoutId);
          setSensorData(defaultSensorData);
          setError(firebaseError);
          setStatus('error');
          setIsLoading(false);
        },
      );
    } catch (firebaseError) {
      window.clearTimeout(loadingTimeoutId);
      setSensorData(defaultSensorData);
      setError(firebaseError);
      setStatus('error');
      setIsLoading(false);
    }

    return () => {
      window.clearTimeout(loadingTimeoutId);
      unsubscribe();
    };
  }, []);

  return { sensorData, error, isLoading, status };
}

export default useLatestSensorData;
