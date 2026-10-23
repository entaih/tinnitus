export const fmtHz = (hz: number) => (hz >= 1000 ? `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 1)} kHz` : `${Math.round(hz)} Hz`);
export const fmtMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} sa ${m % 60 ? `${m % 60} dk` : ''}`.trim() : `${m} dk`);
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const todayKey = () => new Date().toISOString().slice(0, 10);
