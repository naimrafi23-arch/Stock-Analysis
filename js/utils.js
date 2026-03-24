// ═══════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════

const Utils = {
  // Memoized seeded random
  _cache: new Map(),

  seededRandom(seed, offset = 0) {
    const key = seed * 1000 + offset;
    if (this._cache.has(key)) return this._cache.get(key);
    const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 803;
    const val = x - Math.floor(x);
    this._cache.set(key, val);
    return val;
  },

  clearCache() {
    this._cache.clear();
  },

  // Clean number from DSE HTML
  cleanNumber(text) {
    if (!text) return 0;
    const v = text.replace(/,/g, '').replace(/--/g, '0').replace(/[^\d.\-]/g, '');
    return parseFloat(v) || 0;
  },

  // Format volume
  formatVolume(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return (v / 1e3 | 0) + 'K';
    return v.toString();
  },

  // Format price
  formatPrice(p) {
    return '৳' + p.toFixed(2);
  },

  // Change class
  chgClass(v) {
    return v > 0 ? 'pos' : v < 0 ? 'neg' : 'neu';
  },

  // Indicator color class
  indClass(val, low, high) {
    return val < low ? 'bu' : val > high ? 'be' : 'ne';
  },

  // Get seed from stock code
  codeSeed(code) {
    return code.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
  },

  // Debounce
  debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  // BDT time formatter (cached)
  _bdtFmt: new Intl.DateTimeFormat('en-BD', {
    timeZone: 'Asia/Dhaka', hour: '2-digit',
    minute: '2-digit', second: '2-digit', hour12: false
  }),
  _bdtDay: new Intl.DateTimeFormat('en-BD', { timeZone: 'Asia/Dhaka', weekday: 'short' }),
  _bdtH: new Intl.DateTimeFormat('en-BD', { timeZone: 'Asia/Dhaka', hour: '2-digit', hour12: false }),
  _bdtM: new Intl.DateTimeFormat('en-BD', { timeZone: 'Asia/Dhaka', minute: '2-digit' }),

  getBDT() {
    const n = new Date();
    return {
      time: this._bdtFmt.format(n),
      day: this._bdtDay.format(n),
      hour: parseInt(this._bdtH.format(n)),
      min: parseInt(this._bdtM.format(n))
    };
  },

  isMarketOpen() {
    const { day, hour, min } = this.getBDT();
    const mins = hour * 60 + min;
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(day) && mins >= 600 && mins < 870;
  }
};
