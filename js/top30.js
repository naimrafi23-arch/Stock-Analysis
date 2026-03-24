// ═══════════════════════════════════════════════
//  TOP 30 PANEL
// ═══════════════════════════════════════════════

const Top30 = {
  done: false,

  run() {
    UI.hide('temp');
    UI.show('tlo', 'flex');
    UI.el('agrid').innerHTML = '';
    UI.hide('tdisc');
    UI.hide('scgrid');

    const msgs = [
      `25+ indicators on ${App.stocks.length} stocks…`,
      'Pattern detection…', 'Risk scoring…',
      'Selecting top 30 with sector diversity…'
    ];
    const iv = UI.animateMessages('tmsg', msgs, 800);

    requestAnimationFrame(() => setTimeout(() => {
      const result = Scoring.selectTop30(App.stocks);
      clearInterval(iv);
      UI.hide('tlo');

      UI.el('asub').textContent = `${App.stocks.length} stocks → Top 30 · ${result.sectors} sectors`;
      UI.el('cb').textContent = 'BUY: ' + result.buy;
      UI.el('cs').textContent = 'SELL: ' + result.sell;
      UI.el('ch').textContent = 'HOLD: ' + result.hold;
      UI.show('tdisc');

      // Charts
      UI.show('scgrid', 'grid');
      Charts.breadth('cSig', result.buy, result.sell, result.hold);

      const t12 = result.stocks.slice(0, 12);
      Charts.horizontalBar('cStr',
        t12.map(r => r.code),
        t12.map(r => r.strength),
        t12.map(r => r.signal === 'BUY' ? 'rgba(0,229,160,0.6)' : r.signal === 'SELL' ? 'rgba(255,59,107,0.6)' : 'rgba(255,176,32,0.6)'),
        100
      );

      const rL = result.stocks.filter(r => r.risk === 'Low').length;
      const rM = result.stocks.filter(r => r.risk === 'Med').length;
      const rH = result.stocks.filter(r => r.risk === 'High').length;
      Charts.upsert('cRsk', {
        type: 'doughnut',
        data: {
          labels: [`Low ${rL}`, `Med ${rM}`, `High ${rH}`],
          datasets: [{ data: [rL, rM, rH], backgroundColor: ['#00e5a0', '#ffb020', '#ff3b6b'], borderColor: '#060810', borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 8 } } } } }
      });

      // Cards (single innerHTML for efficiency)
      UI.el('agrid').innerHTML = result.stocks.map((r, i) => this.buildCard(r, i)).join('');

      requestAnimationFrame(() => {
        document.querySelectorAll('.cf[data-w]').forEach(e => { e.style.width = e.dataset.w; });
      });
      this.done = true;
    }, 100));
  },

  buildCard(r, i) {
    const cc = r.chg >= 0 ? 'pos' : 'neg';
    const cs = (r.chg >= 0 ? '+' : '') + r.chg.toFixed(2) + ' (' + (r.pct >= 0 ? '+' : '') + r.pct.toFixed(2) + '%)';
    const rc = Utils.indClass(r.rsi, 40, 65);
    const mc = r.macdH > 0 ? 'bu' : 'be';

    return `<div class="ac ${r.signal.toLowerCase()}" style="animation-delay:${i * 0.02}s">
      <div class="ach"><div class="acs">
        <h3>${r.code} <span style="font-weight:400;font-size:0.65rem;color:var(--muted2)">${r.sec}</span> <span class="badge${i < 10 ? ' top' : ''}">Score ${r.score}</span></h3>
        <div><span class="ap">${Utils.formatPrice(r.ltp)}</span><span class="ac2 ${cc}">${cs}</span></div>
      </div><div class="st ${r.signal}">${r.signal}</div></div>
      <div class="ig">
        <div class="ib"><div class="il">RSI</div><div class="iv ${rc}">${r.rsi | 0}</div></div>
        <div class="ib"><div class="il">MACD</div><div class="iv ${mc}">${r.macdH > 0 ? '▲' : '▼'}${Math.abs(r.macdH).toFixed(1)}</div></div>
        <div class="ib"><div class="il">Stoch</div><div class="iv ${Utils.indClass(r.stoch, 30, 70)}">${r.stoch | 0}</div></div>
        <div class="ib"><div class="il">BB%</div><div class="iv ${Utils.indClass(r.bb, 20, 80)}">${r.bb | 0}</div></div>
        <div class="ib"><div class="il">ADX</div><div class="iv in">${r.adx | 0}</div></div>
        <div class="ib"><div class="il">MFI</div><div class="iv ${Utils.indClass(r.mfi, 30, 70)}">${r.mfi | 0}</div></div>
        <div class="ib"><div class="il">CCI</div><div class="iv ${Utils.indClass(r.cci, -100, 100)}">${r.cci | 0}</div></div>
        <div class="ib"><div class="il">ATR%</div><div class="iv in">${r.atrP.toFixed(1)}</div></div>
      </div>
      <div class="rr">
        <div class="rb"><div class="rl">Risk</div><div class="rv ${r.risk === 'Low' ? 'lo' : r.risk === 'High' ? 'hi' : 'md'}">${r.risk}</div></div>
        <div class="rb"><div class="rl">R:R</div><div class="rv ${parseFloat(r.rr) > 1.5 ? 'lo' : 'md'}">${r.rr}</div></div>
        <div class="rb"><div class="rl">Trend</div><div class="rv inf">${r.trendStr}</div></div>
        <div class="rb"><div class="rl">Vol×</div><div class="rv ${r.volR > 1.5 ? 'lo' : 'md'}">${r.volR.toFixed(1)}</div></div>
      </div>
      <div class="lvls">
        <div class="lb"><div class="ll">SL</div><div class="lv sl">৳${r.lvl.sl}</div></div>
        <div class="lb"><div class="ll">T1</div><div class="lv tg">৳${r.lvl.t1}</div></div>
        <div class="lb"><div class="ll">T2</div><div class="lv tg">৳${r.lvl.t2}</div></div>
        ${r.lvl.t3 ? `<div class="lb"><div class="ll">T3</div><div class="lv tg">৳${r.lvl.t3}</div></div>` : ''}
      </div>
      ${r.patterns.length ? `<div style="margin-bottom:6px">${r.patterns.slice(0, 4).map(p => `<span class="pt ${p.t}">${p.n}</span>`).join('')}</div>` : ''}
      <div class="acm"><div class="acmh">📋 Signals</div>${r.reasons.slice(0, 4).map(x => '• ' + x).join('<br>')}</div>
      <div class="cr"><span class="cl">Str</span><div class="ct"><div class="cf ${r.signal}" data-w="${r.strength}%"></div></div><span class="cp">${r.strength}%</span></div>
    </div>`;
  }
};
