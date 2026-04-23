import { useState, useCallback, useEffect } from 'react';

/**
 * React state'ini localStorage ile senkronize eder.
 * SSR uyumluluğu ve tip güvenliği eklenmiştir.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  
  // 1. SSR (Server Side Rendering) Kontrolü
  // Sunucu tarafında 'window' objesi bulunmadığı için hata almamak adına kontrol ekliyoruz.
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`LocalStorage okuma hatası ("${key}"):`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 2. State değişimlerini localStorage'a yazan fonksiyon
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const nextValue = value instanceof Function ? value(prev) : value;
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        }
        
        return nextValue;
      });
    } catch (error) {
      console.warn(`LocalStorage yazma hatası ("${key}"):`, error);
    }
  }, [key]);

  // 3. Harici Sekme Senkronizasyonu (Opsiyonel ama Önerilir)
  // Kullanıcı başka bir sekmede veriyi değiştirirse bu sekmenin de güncellenmesini sağlar.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}