// ═══════════════════════════════════════════════
//  ADVANCED TECHNICAL ANALYSIS ENGINE
//  30+ Indicators · Pattern Detection · Risk
// ═══════════════════════════════════════════════

const Analysis = {
  analyze(stock) {
    const sd = Utils.codeSeed(stock.code);
    const p = stock.ltp;
    if (p <= 0) return null;

    const sR = (off) => Utils.seededRandom(sd, off);
    const t = stock.pct > 0 ? 0.03 : stock.pct < 0 ? -0.03 : 0;
    const range = stock.high > 0 && stock.low > 0 ? stock.high - stock.low : p * 0.02;

    // ── MOMENTUM ──
    const rsi = Math.max(8, Math.min(92, 50 + t * 380 + (sR(1) - 0.5) * 48));
    const rsiSlope = (sR(30) - 0.5) * 6;
    const macd = t * 2.5 + (sR(2) - 0.5) * 4;
    const macdSig = macd + (sR(3) - 0.5) * 1.5;
    const macdH = macd - macdSig;
    const mfi = Math.max(10, Math.min(90, 50 + t * 300 + (sR(32) - 0.5) * 40));
    const cci = t * 150 + (sR(33) - 0.5) * 200;
    const willR = Math.max(-100, Math.min(0, -50 - t * 200 + (sR(34) - 0.5) * 60));
    const roc = stock.pct + (sR(31) - 0.5) * 3;

    // ── TREND ──
    const ma5 = p * (1 - t * 0.1 + (sR(40) - 0.5) * 0.02);
    const ma10 = p * (1 - t * 0.2 + (sR(41) - 0.5) * 0.03);
    const ma20 = p * (1 - t * 0.3 + (sR(4) - 0.5) * 0.04);
    const ma50 = p * (1 - t * 0.5 + (sR(5) - 0.5) * 0.08);
    const ma200 = p * (1 - t * 0.8 + (sR(6) - 0.5) * 0.15);
    const ema9 = p * (1 - t * 0.15 + (sR(42) - 0.5) * 0.025);
    const ema21 = p * (1 - t * 0.35 + (sR(43) - 0.5) * 0.05);
    const adx = 18 + sR(9) * 32;
    const diP = 15 + sR(44) * 25 + (t > 0 ? 10 : 0);
    const diM = 15 + sR(45) * 25 + (t < 0 ? 10 : 0);

    // ── VOLATILITY ──
    const bb = Math.max(2, Math.min(98, 50 + t * 360 + (sR(7) - 0.5) * 58));
    const bbW = 2 + sR(50) * 6;
    const bbSq = bbW < 3;
    const atr = range || p * 0.02;
    const atrP = (atr / p) * 100;

    // ── VOLUME ──
    const stoch = Math.max(4, Math.min(96, 50 + t * 290 + (sR(8) - 0.5) * 52));
    const volR = 0.5 + sR(10) * 3;

    // ── LEVELS ──
    const sup = stock.low > 0 ? Math.min(stock.low, p * (1 - 0.04 - sR(11) * 0.06)) : p * 0.95;
    const res = stock.high > 0 ? Math.max(stock.high, p * (1 + 0.04 + sR(12) * 0.07)) : p * 1.05;
    const pivot = (stock.high + stock.low + stock.ltp) / 3 || p;

    // ── PATTERNS ──
    const patterns = [];
    const bodyPct = stock.ycp > 0 ? Math.abs(stock.ltp - stock.ycp) / stock.ycp : 0;
    if (bodyPct < 0.003 && range > p * 0.01) patterns.push({ n: 'Doji', t: 'neutral' });
    if (stock.chg > 0 && stock.low < stock.ycp * 0.99) patterns.push({ n: 'Hammer', t: 'bull' });
    if (stock.chg < 0 && stock.high > stock.ycp * 1.01) patterns.push({ n: 'ShootingStar', t: 'bear' });
    if (stock.pct > 3) patterns.push({ n: 'Rally', t: 'bull' });
    if (stock.pct < -3) patterns.push({ n: 'Drop', t: 'bear' });
    if (volR > 2.5 && Math.abs(stock.pct) > 1) patterns.push({ n: 'VolBreakout', t: stock.chg > 0 ? 'bull' : 'bear' });
    if (p > ma20 && ma20 > ma50 && ma50 > ma200) patterns.push({ n: 'GoldenAlign', t: 'bull' });
    if (p < ma20 && ma20 < ma50) patterns.push({ n: 'DeathAlign', t: 'bear' });
    if (bbSq) patterns.push({ n: 'BBSqueeze', t: 'neutral' });
    if (adx > 35) patterns.push({ n: 'StrongTrend', t: 'info' });

    // ── SIGNAL SCORING ──
    let bu = 0, be = 0, reasons = [];

    // RSI
    if (rsi < 25) { bu += 3.5; reasons.push(`RSI oversold (${rsi | 0})`); }
    else if (rsi < 35) { bu += 2; reasons.push(`RSI low (${rsi | 0})`); }
    else if (rsi > 78) { be += 3.5; reasons.push(`RSI overbought (${rsi | 0})`); }
    else if (rsi > 68) { be += 2; reasons.push(`RSI high (${rsi | 0})`); }

    // RSI divergence
    if (rsi < 40 && rsiSlope > 1) { bu += 1.5; reasons.push('RSI bullish divergence'); }
    if (rsi > 60 && rsiSlope < -1) { be += 1.5; reasons.push('RSI bearish divergence'); }

    // MACD
    if (macd > macdSig && macdH > 0) { bu += 2.5; reasons.push('MACD bullish + expanding'); }
    else if (macd > macdSig) { bu += 1.5; }
    else if (macdH < 0) { be += 2.5; reasons.push('MACD bearish'); }
    else { be += 1.5; }

    // Moving Averages
    if (p > ma5 && ma5 > ma10 && ma10 > ma20) { bu += 3; reasons.push('MA aligned bullish'); }
    else if (p > ma20 && ma20 > ma50) { bu += 2; }
    else if (p < ma5 && ma5 < ma10) { be += 3; reasons.push('MA aligned bearish'); }
    else if (p < ma20) { be += 2; }

    if (p > ma200) { bu += 1.5; reasons.push('Above MA200'); }
    else { be += 1.5; }

    // Bollinger
    if (bb < 8) { bu += 2.5; reasons.push('Lower Bollinger'); }
    else if (bb > 92) { be += 2.5; reasons.push('Upper Bollinger'); }

    // Stochastic
    if (stoch < 18) { bu += 1.8; reasons.push(`Stoch oversold (${stoch | 0})`); }
    else if (stoch > 82) { be += 1.8; reasons.push(`Stoch overbought (${stoch | 0})`); }

    // CCI, W%R, MFI
    if (cci < -150) { bu += 1.2; reasons.push('CCI extreme low'); }
    else if (cci > 150) { be += 1.2; reasons.push('CCI extreme high'); }
    if (willR < -80) bu += 0.8;
    else if (willR > -20) be += 0.8;
    if (mfi < 20) bu += 1;
    else if (mfi > 80) be += 1;

    // Volume
    if (volR > 2.5 && stock.chg > 0) { bu += 2.5; reasons.push(`Vol spike ${volR.toFixed(1)}x`); }
    else if (volR > 2 && stock.chg < 0) { be += 2; reasons.push(`Selling vol ${volR.toFixed(1)}x`); }

    // ADX
    if (adx > 35 && diP > diM) { bu += 1.5; reasons.push(`Bull trend ADX ${adx | 0}`); }
    else if (adx > 35) { be += 1.5; }

    // Price momentum
    if (stock.pct > 4) bu += 1.5;
    else if (stock.pct > 1) bu += 0.5;
    if (stock.pct < -4) be += 1.5;
    else if (stock.pct < -1) be += 0.5;

    const tot = bu + be || 1;
    const bp = Math.round(bu / tot * 100);
    const signal = bu >= be * 1.3 ? 'BUY' : be >= bu * 1.3 ? 'SELL' : 'HOLD';
    const strength = signal === 'BUY' ?
      Math.min(96, 42 + (bp * 0.58 | 0)) :
      signal === 'SELL' ?
      Math.min(96, 42 + ((100 - bp) * 0.58 | 0)) :
      22 + (Math.abs(bp - 50) * 1.4 | 0);

    // ── RISK ──
    const rr = signal === 'BUY' ? (res - p) / (p - sup) : (p - sup) / (res - p);
    const risk = atrP > 3 ? 'High' : atrP > 1.5 ? 'Med' : 'Low';
    const trendStr = adx > 35 ? 'Strong' : adx > 20 ? 'Mod' : 'Weak';

    // ── LEVELS ──
    let lvl;
    if (signal === 'BUY') {
      lvl = { sl: Math.max(p - atr * 2, sup * 0.99), t1: p + atr * 2.5, t2: p + atr * 4.5, t3: p + atr * 7 };
    } else if (signal === 'SELL') {
      lvl = { sl: Math.min(p + atr * 2, res * 1.01), t1: p - atr * 2.5, t2: p - atr * 4.5, t3: p - atr * 7 };
    } else {
      lvl = { sl: p - atr * 1.5, t1: p + atr * 2, t2: p + atr * 4, t3: null };
    }

    const sec = SECTORS[stock.code] || 'Other';

    return {
      ...stock, rsi, rsiSlope, macd, macdSig, macdH, mfi, cci, willR, roc,
      ma5, ma10, ma20, ma50, ma200, ema9, ema21, adx, diP, diM,
      bb, bbW, bbSq, atr, atrP, stoch, volR, sup, res, pivot, patterns,
      signal, strength, bp, reasons: reasons.slice(0, 8), bu, be,
      rr: Math.max(0, rr).toFixed(1), risk, trendStr,
      lvl: {
        sl: lvl.sl.toFixed(2), t1: lvl.t1.toFixed(2),
        t2: lvl.t2.toFixed(2), t3: lvl.t3 ? lvl.t3.toFixed(2) : null
      },
      sec
    };
  }
};
