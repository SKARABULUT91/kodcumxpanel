import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Media query listesini oluşturuyoruz
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // İlk render'da durumu set ediyoruz (Matches özelliği en güvenilir yoldur)
    setIsMobile(mql.matches);

    // Modern tarayıcılar için event listener
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Dinlemeye başlıyoruz
    mql.addEventListener("change", onChange);
    
    // Temizlik fonksiyonu
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // undefined durumunda (SSR veya ilk mount öncesi) false dönmesi için !! kullanımı uygundur
  return !!isMobile;
}