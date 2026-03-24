// ═══════════════════════════════════════════════
//  UI MANAGER — DOM Manipulation
// ═══════════════════════════════════════════════

const UI = {
  // ── Element cache ──
  _els: {},
  el(id) {
    if (!this._els[id]) this._els[id] = document.getElementById(id);
    return this._els[id];
  },

  // ── Clock ──
  updateClock() {
    const bdt = Utils.getBDT();
    this.el('clock').textContent = bdt.time + ' BDT';
    const open = Utils.isMarketOpen();
    this.el('dot').className = 'dot' + (open ? '' : ' off');
    this.el('mst').textContent = open ? 'OPEN' : 'CLOSED';
  },

  // ── Stats ──
  updateStats(stocks) {
    const adv = stocks.filter(s => s.chg > 0).length;
    const dec = stocks.filter(s => s.chg < 0).length;
    const unc = stocks.length - adv - dec;
    const vol = stocks.reduce((a, s) => a + s.volume, 0);
    const trd = stocks.reduce((a, s) => a + s.trade, 0);

    this.el('v-adv').textContent = adv;
    this.el('s-dec').textContent = `▼ ${dec} · = ${unc}`;
    this.el('v-vol').textContent = Utils.formatVolume(vol);
    this.el('v-trd').textContent = trd.toLocaleString();

    const sentRatio = adv / (adv + dec || 1) * 100;
    const sentEl = this.el('v-sent');
    sentEl.textContent = sentRatio > 60 ? 'Bullish' : sentRatio < 40 ? 'Bearish' : 'Neutral';
    sentEl.className = 'v ' + (sentRatio > 60 ? 'g' : sentRatio < 40 ? 'r' : 'go');
    this.el('s-sent').textContent = `A/D: ${(adv / (dec || 1)).toFixed(2)}`;

    this.el('upd').textContent = new Date().toLocaleTimeString('en-BD', {
      timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false
    }) + ' BDT';

    return { adv, dec, unc };
  },

  // ── DSEX ──
  updateDSEX(val) {
    if (!val) return;
    const formatted = val.toLocaleString('en-BD', { minimumFractionDigits: 2 });
    this.el('v-dsex').textContent = formatted;
    this.el('hdsex').textContent = formatted;
  },

  // ── Loading states ──
  showLoading(id, show = true) {
    this.el(id).classList.toggle('show', show);
  },

  show(id, display = 'block') {
    this.el(id).style.display = display;
  },

  hide(id) {
    this.el(id).style.display = 'none';
  },

  // ── Loading messages ──
  animateMessages(elId, messages, interval = 700) {
    let i = 0;
    const el = this.el(elId);
    return setInterval(() => { el.textContent = messages[i++ % messages.length]; }, interval);
  }
};
