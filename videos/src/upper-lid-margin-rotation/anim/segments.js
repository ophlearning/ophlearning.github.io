// ============================================================================
// Segments: narration lines (= burned-in captions), key-point box, sources, and the animation of each panel.
// Every line comes from script-draft.md (sources checked on PubMed). draw(T) returns panel contents.
// ============================================================================
const CHAPTERS = ['片頭', '臨床決策', '為什麼選 PLTR', '術前準備', '手術步驟', '術中狀況', '只講差異', '術後', '跟刀清單', '參考文獻'];
const SAG_P = { title: '矢狀切面（中央）', orient: '左＝前　上＝上' };
const COR_P = { title: '正面觀　右眼 OD', orient: '檢查者面對病人：左＝temporal　右＝nasal' };
const EV_P = { title: '翻開上眼瞼　右眼 OD', orient: '瞼緣翻到上方　左＝temporal　右＝nasal' };

const SEGS = [
// ---------------------------------------------------------------- 片頭
{ id: 'title', ch: 0, layout: 'title', lead: 1.2,
  lines: ['這支影片講上眼瞼 cicatricial entropion 的\nmargin rotation。',
          '主線示範 posterior lamellar tarsal rotation，\n也就是把眼瞼翻開、從結膜面切 tarsus 的做法。'] },

// ---------------------------------------------------------------- 1 臨床決策
{ id: 'c1', chapterCard: 1 },
{ id: '1-1', ch: 1, title: '先分清楚睫毛為什麼碰到眼睛', layout: 'dual', P: [SAG_P, COR_P],
  lines: ['睫毛碰到眼睛有三種機轉，\n而且常常同時存在。',
          '第一種是 entropion：整個瞼緣往內轉，\n睫毛跟著被帶進去。',
          '第二種是 misdirected lashes：\n睫毛長在正常的睫毛線上，只是方向歪了。',
          '第三種是 metaplastic lashes：\n睫毛從原本不該長睫毛的位置長出來。',
          'Margin rotation 處理的是第一種，\n所以開刀前要先確認病人真的有 entropion。',
          '如果瞼緣位置正常、只有幾根歪掉的睫毛，\n破壞毛囊就是合理的選擇，不需要切 tarsus。'],
  keys: [[0, '睫毛碰到眼睛的三種機轉：<b>entropion</b>、<b>misdirected lashes</b>、<b>metaplastic lashes</b>，常常同時存在。'],
         [4, 'Margin rotation 只處理 <b>entropion</b>。\n瞼緣位置正常、只有幾根歪掉的睫毛 → 破壞毛囊就好，不必切 tarsus。']],
  src: [[0, 'Rajak 2012']],
  draw(T) {
    const ent = T.on(1) * (1 - T.on(2)) + T.on(4) * (1 - T.on(5));
    const mis = T.on(2) * (1 - T.on(3)) + T.on(5), meta = T.on(3) * (1 - T.on(4));
    const S = { curl: ent, misdirected: mis, metaplastic: meta };
    const C = { evert: lerp(0, -1, ent), misdirected: mis, metaplastic: meta, section: 1 };
    const tag = (txt, op) => text(304, 30, txt, { anchor: 'middle', size: 18, bold: true, color: COL.amber, op });
    return { L: { sag: S, extra: tag('entropion：瞼緣內轉', T.on(1) * (1 - T.on(2))) + tag('misdirected：睫毛線正常、方向歪', T.on(2) * (1 - T.on(3))) +
                    tag('metaplastic：從後緣長出來', T.on(3) * (1 - T.on(4))) },
             R: { cor: C } };
  } },
{ id: '1-2', ch: 1, title: '檢查：怎麼確認是 entropion', layout: 'dual', P: [SAG_P, COR_P],
  lines: ['先請病人往前看，\n觀察瞼緣有沒有往內轉。',
          'Entropion 久了，posterior lid margin\n原本方正的邊角會變圓。',
          '接著翻開上眼瞼，看 tarsal conjunctiva：',
          '疤痕可以只有幾條細白線，\n也可以是一整片緻密的疤。',
          '最後看 mucocutaneous junction，\n也就是皮膚和結膜交界的那條線。',
          '正常情況下，\n它在 meibomian gland 開口的後面；',
          '疤痕收縮會把它往前拉，\n看起來就像結膜長到瞼緣上。',
          '輕微的 marginal entropion，\n常被誤診成單純的 trichiasis，',
          '所以瞼緣有沒有內轉、邊角有沒有變圓、\n交界線有沒有前移，這三點每次都要看。'],
  keys: [[0, '看三件事：① 瞼緣有沒有<b>內轉</b>　② posterior lid margin 有沒有<b>變圓</b>\n③ 翻瞼看 tarsal conjunctiva 的<b>疤痕</b>'],
         [4, '<b>Mucocutaneous junction</b>（皮膚和結膜交界）：正常在 meibomian gland 開口後面；\n疤痕收縮會把它往前拉。'],
         [7, '輕微的 marginal entropion 常被誤診成 trichiasis。\n內轉、變圓、交界線前移，每次都要看。']],
  src: [[0, 'Rajak 2012'], [7, 'Erdoğan 2015；Rajak 2012']],
  draw(T) {
    const zoom = T.on(4, 0.9) * (1 - T.on(7, 0.9));
    const m = SAG.marginLocal(1, -10, 10), K = 2.6;
    const view = { tx: lerp(244, 290 - m[0] * K, zoom), ty: lerp(34, 170 - m[1] * K, zoom), k: lerp(0.74, K, zoom) };
    const S = { curl: 1, round: T.on(1), mcj: T.on(4), mcjShift: T.on(6, 1.2), labels: zoom < 0.05, view };
    const ev = T.on(2, 0.8) * (1 - T.on(4, 0.8));
    const C = { evert: -1, everted: ev, scar: lerp(0.15, 1, T.p(3, 0.3, 0.9)), section: 1 - ev };
    let extra = '';
    const sg = SEGS_DRAW_CACHE.sagA;
    if (sg) {
      extra += lab('邊角變圓', 380, 300, sg.postMargin, { color: COL.amber, bold: true, op: T.on(1) * (1 - T.on(4)) });
      extra += lab('MCJ', 470, 120, sg.mcj, { color: COL.accent, bold: true, op: zoom });
      extra += lab('meibomian gland 開口', 592, 330, sg.meib, { side: 'R', color: '#9c7a20', bold: true, op: zoom });
      extra += text(592, 26, '放大：瞼緣（左＝前）', { size: 15, color: COL.sub, anchor: 'end', op: zoom });
    }
    const cg = SEGS_DRAW_CACHE.corA;
    let rx = '';
    if (cg && cg.evConj) rx += lab('tarsal conjunctiva 的疤痕', 590, 300, cg.evConj, { side: 'R', bold: true, op: ev }) + lab('瞼緣', 20, 40, cg.evMargin, { op: ev });
    if (cg && cg.lashes) rx += lab('瞼緣內轉、睫毛碰角膜', 20, 40, cg.lashes, { color: COL.amber, bold: true, op: T.on(0) * (1 - ev) * (1 - T.on(7)) });
    return { L: { sag: S, extra }, R: { cor: C, extra: rx, P: ev > 0.5 ? EV_P : COR_P } };
  } },
{ id: '1-3', ch: 1, title: '病因', layout: 'dual', P: [SAG_P, { title: '病因', orient: '' }],
  lines: ['上眼瞼 cicatricial entropion 的共同機轉，\n是後層的結膜和 tarsus 結疤收縮，',
          '把瞼緣往眼球的方向拉。',
          '除了 trachoma，mucous membrane pemphigoid、\nStevens-Johnson syndrome、',
          '化學傷、ocular rosacea，\n都會讓結膜結疤。',
          '長期點抗青光眼藥水也可能引起，\n最常被懷疑的是藥水裡的防腐劑。',
          '一個只收上眼瞼病例的系列裡，最常見的病因是\ntrachoma、之前的上眼瞼手術、',
          'Stevens-Johnson syndrome，\n和 meibomian gland dysfunction。'],
  keys: [[0, '共同機轉：<b>後層（結膜＋tarsus）結疤收縮</b>，把瞼緣往眼球拉。'],
         [2, '會讓結膜結疤的病：trachoma、MMP、SJS、化學傷、ocular rosacea、\n長期點含防腐劑的抗青光眼藥水。']],
  src: [[0, 'Rajak 2012'], [4, 'Singh 2022'], [5, 'Ross 2011']],
  draw(T) {
    const S = { curl: lerp(0.15, 1, T.p(0, 0.2, 1) * 0.5 + T.p(1, 0, 0.9) * 0.5), contract: T.on(0) * (1 - T.on(2)), scar: T.on(0) * (1 - T.on(2)) };
    const items = [['Trachoma', 2], ['Mucous membrane pemphigoid（MMP）', 2], ['Stevens-Johnson syndrome（SJS）', 2], ['化學傷', 3], ['Ocular rosacea', 3], ['抗青光眼藥水（防腐劑）', 4]];
    let svg = '';
    items.forEach(([s, li], i) => { const y = 22 + i * 40, op = T.on(li, 0.5, i * 0.25);
      svg += card(20, y, 566, 32, { op, hl: 0 }) + text(36, y + 22, s, { size: 17, op, bold: i === 5 ? false : false }); });
    const op2 = T.on(5);
    svg += card(20, 270, 566, 74, { op: op2, hl: 1 }) + text(36, 296, '只收上眼瞼的系列（Ross 2011）最常見：', { size: 15.5, color: COL.accent, bold: true, op: op2 }) +
      text(36, 324, 'trachoma、上眼瞼手術後、SJS、meibomian gland dysfunction', { size: 16, op: op2 });
    let extra = '';
    const sg = SEGS_DRAW_CACHE.sagA;
    if (sg) extra += lab('結疤收縮', 430, 140, sg.conj, { color: COL.red, bold: true, op: T.on(0) * (1 - T.on(2)) });
    return { L: { sag: { ...S, labels: true }, extra }, R: { svg } };
  } },
{ id: '1-4', ch: 1, title: '處置階梯', layout: 'full', P: [{ title: '由輕到重', orient: '' }],
  lines: ['處置可以排成一條由輕到重的階梯。',
          '最底層是暫時處置：\n人工淚液、contact lens 和拔睫毛。',
          '如果沒有 entropion、只有幾根歪掉的睫毛，\n可以用 electrolysis、cryotherapy 或 laser 破壞毛囊；',
          '其中 cryotherapy 的併發症率最高到 38%，\n包括 entropion 變嚴重、瞼緣缺角和 symblepharon。',
          '輕微的上眼瞼 entropion、瞼緣沒有角化，\n可以做 anterior lamellar repositioning；',
          '想多轉一點，\n可以再加一刀淺的 grey line 切開。',
          '再往上一階，\n就是這支影片的主角 tarsal rotation。',
          'Kersten 1992 年的系列裡，輕到中度 cicatricial entropion\n做 tarsotomy 的治癒率是 94%，重度只有 55%，',
          '但重做一次之後，\n成功率會再提高。',
          '重度病人的 posterior lamella 明顯縮短，\n有時要用 graft 把它延長；',
          '已經有 lagophthalmos 的眼睛，也不適合只做 rotation，\n因為 BLTR 和 PLTR 都可能讓眼瞼變短。'],
  keys: [[0, '由輕到重：暫時處置 → 破壞毛囊 → anterior lamellar repositioning\n→ <b>tarsal rotation</b> → 加 graft 延長 posterior lamella。'], [1, '暫時處置：人工淚液、contact lens、拔睫毛。'],
         [2, '沒有 entropion、只有幾根歪睫毛 → 破壞毛囊。\nCryotherapy 併發症率最高 38%（entropion 變重、瞼緣缺角、symblepharon）。'],
         [4, '輕微 entropion、瞼緣沒角化 → <b>anterior lamellar repositioning</b>，可加 grey line 切開。'],
         [6, '<b>Tarsal rotation</b>：輕到中度治癒率 94%，重度 55%，重做可再提高（Kersten 1992）。'],
         [9, 'Posterior lamella 明顯縮短 → 用 graft 延長。\n已有 lagophthalmos → 不適合只做 rotation。']],
  src: [[0, 'Ferreira 2010'], [2, 'Rajak 2012'], [7, 'Kersten 1992'], [9, 'Rajak 2012']],
  draw(T) {
    const steps = [[['暫時處置'], ['人工淚液、contact lens、', '拔睫毛'], 1], [['破壞毛囊'], ['electrolysis、cryotherapy、', 'laser'], 2],
      [['Anterior lamellar', 'repositioning'], ['± grey line 切開'], 4], [['Tarsal rotation', '（本片）'], ['輕到中度 94%', '重度 55%'], 6], [['加 graft 延長', 'posterior lamella'], ['後層明顯縮短時'], 9]];
    let cur = 0; steps.forEach((s, i) => { if (T.u >= T.st(s[2]) - 0.2) cur = i; });
    let svg = '';
    steps.forEach(([h, d, li], i) => {
      const x = 30 + i * 238, y = 244 - i * 50, w = 222, op = Math.max(0.3 * T.on(0, 0.8, 0.3 + i * 0.25), T.on(li, 0.5)), hl = (cur === i && T.u >= T.st(1) - 0.2 ? 1 : 0) * op;
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${344 - y}" rx="10" fill="${hl ? 'rgba(14,124,107,0.10)' : '#f3f6f8'}" stroke="${hl ? COL.accent : '#d3dae1'}" stroke-width="${hl ? 2.5 : 1}" opacity="${op}"/>`;
      svg += tblock(x + 14, y + 30, h, { size: 16.5, lh: 22, bold: true, color: hl ? COL.accent : COL.ink, op });
      svg += tblock(x + 14, y + 34 + h.length * 22, d, { size: 14, lh: 20, color: COL.sub, op });
      svg += text(x + w - 12, y + 30, String(i + 1), { size: 24, bold: true, anchor: 'end', color: '#c6d0d8', op });
    });
    const cOp = T.on(3) * (1 - T.on(4));
    svg += `<g opacity="${cOp}"><rect x="30" y="20" width="440" height="44" rx="8" fill="#fff4e5" stroke="${COL.amber}"/>${text(46, 48, 'Cryotherapy 併發症率最高 38%', { size: 16, bold: true, color: COL.amber })}</g>`;
    const kOp = T.on(7) * (1 - T.on(9));
    svg += `<g opacity="${kOp}"><rect x="30" y="20" width="440" height="44" rx="8" fill="#eef7f5" stroke="${COL.accent}"/>${text(46, 48, 'Kersten 1992：輕到中度 94%　重度 55%', { size: 16, bold: true, color: COL.accent })}</g>`;
    const lOp = T.on(10);
    svg += `<g opacity="${lOp}"><rect x="30" y="20" width="440" height="44" rx="8" fill="#fff4e5" stroke="${COL.amber}"/>${text(46, 48, '已有 lagophthalmos：不適合只做 rotation', { size: 16, bold: true, color: COL.amber })}</g>`;
    return { F: { svg } };
  } },
{ id: '1-5', ch: 1, title: 'Mucous membrane pemphigoid 要特別小心', layout: 'full', P: [{ title: 'MMP', orient: '' }],
  lines: ['Mucous membrane pemphigoid 的病人要特別小心，\n因為手術本身可能讓疾病惡化。',
          '一個做 mucous membrane graft 的系列裡，\n26 眼中有 8 眼在術後發炎加劇。',
          '歐洲的 S3 指引建議，炎症完全控制好幾個月之後，\n才做解除疤痕的手術；',
          '疤痕還在進展時，\n要先開始全身免疫抑制。',
          '也有病人在一般 entropion 手術後，\n才發現原來有沒被診斷的 pemphigoid，',
          '所以每個 cicatricial entropion 的病人，\n都要先想到這個可能。'],
  keys: [[0, 'MMP：手術本身可能讓疾病惡化。'], [2, '炎症<b>完全控制好幾個月</b>後才手術；疤痕還在進展 → 先全身免疫抑制。'],
         [4, '每個 cicatricial entropion 都要先想到<b>沒被診斷的 pemphigoid</b>。']],
  src: [[1, 'Heiligenhaus 1993'], [2, 'Schmidt 2021'], [3, 'Wang 2018'], [4, 'Hatton 2008']],
  draw(T) {
    let svg = '';
    const o1 = T.on(1);
    svg += card(30, 24, 370, 300, { op: o1 }) + text(50, 58, '術後發炎加劇', { size: 18, bold: true, color: COL.red, op: o1 }) + text(50, 84, 'mucous membrane graft 系列', { size: 14.5, color: COL.sub, op: o1 });
    for (let i = 0; i < 26; i++) { const x = 70 + (i % 7) * 44, y = 124 + Math.floor(i / 7) * 46, hot = i < 8, op = o1 * ss(T.st(1) + 0.2 + i * 0.05, T.st(1) + 0.5 + i * 0.05, T.u);
      svg += `<ellipse cx="${x}" cy="${y}" rx="17" ry="10" fill="${hot ? '#f6d4d4' : '#eef2f5'}" stroke="${hot ? COL.red : '#aab6c2'}" stroke-width="1.6" opacity="${op}"/><circle cx="${x}" cy="${y}" r="6" fill="${hot ? COL.red : '#7d8a97'}" opacity="${op}"/>`; }
    svg += text(215, 312, '26 眼中 8 眼', { size: 20, bold: true, anchor: 'middle', color: COL.red, op: o1 });
    const o2 = T.on(2), o3 = T.on(3);
    svg += card(420, 24, 380, 140, { op: o2, hl: o2 * (1 - T.on(4)) }) + text(440, 58, '手術時機', { size: 18, bold: true, color: COL.accent, op: o2 }) + tblock(440, 92, ['炎症完全控制好幾個月之後', '才做解除疤痕的手術'], { size: 17, op: o2 });
    svg += card(420, 184, 380, 140, { op: o3, hl: o3 * (1 - T.on(4)) }) + text(440, 218, '疤痕還在進展', { size: 18, bold: true, color: COL.accent, op: o3 }) + tblock(440, 252, ['先開始全身免疫抑制'], { size: 17, op: o3 });
    const o4 = T.on(4);
    svg += card(820, 24, 380, 300, { op: o4, hl: o4 }) + text(840, 58, '沒被診斷的 pemphigoid', { size: 18, bold: true, color: COL.amber, op: o4 }) +
      tblock(840, 96, ['一般 entropion 手術後，', '才發現原來有 pemphigoid', '', '→ 每個 cicatricial entropion', '　都要先想到這個可能'], { size: 17, op: o4 });
    return { F: { svg } };
  } },

// ---------------------------------------------------------------- 2 證據
{ id: 'c2', chapterCard: 2 },
{ id: '2', ch: 2, title: 'PLTR 和 BLTR 的比較', layout: 'full', P: [{ title: '術後倒睫（復發）比例', orient: '全部是 Ethiopia 的 trachoma 病人' }],
  lines: ['比較 PLTR 和 BLTR 的大型研究，\n都是在 Ethiopia 的 trachoma 病人身上做的。',
          'Habtamu 2016 年的 RCT 收了 1000 人，\n一年內復發 BLTR 22%、PLTR 13%；',
          '追蹤到第 4 年，差距還在，\n22.2% 對 13.6%。',
          '但 2024 年的 MTSS trial，\n把 BLTR 的切口高度固定在 3 mm 之後，',
          '兩者的差距就不顯著了，\n15.4% 對 13.1%。',
          '2025 年的真實世界研究，方向和 2016 年的 RCT 一致，\n21.4% 對 8.2%。',
          'WHO 目前的立場是：新手學 PLTR，\n已經熟練 BLTR 的人，繼續用原本的做法。',
          '最後要記得，這些都是 trachoma 病人；\n非 trachoma 的 cicatricial entropion，整體手術結果比較差。'],
  keys: [[1, '兩個 RCT 結果不一：Habtamu 2016 PLTR 較好；MTSS 2024（BLTR 切口固定 3 mm）差異不顯著。'],
         [6, 'WHO：<b>新手學 PLTR</b>，熟練 BLTR 的人繼續用原本做法。'], [7, '限制：全是 trachoma 病人；<b>非 trachoma</b> 的手術結果整體較差。']],
  src: [[1, 'Habtamu 2016'], [2, 'Habtamu 2019'], [3, 'Gower 2024'], [5, 'Kempen 2025'], [7, 'Singh 2024']],
  draw(T) {
    const G = [['Habtamu 2016', 'RCT，12 個月', 22, 13, 1, ''], ['Habtamu 2019', '同一 RCT，4 年', 22.2, 13.6, 2, ''], ['MTSS 2024', 'RCT，12 個月', 15.4, 13.1, 4, '差異不顯著'], ['Kempen 2025', '真實世界，12 個月', 21.4, 8.2, 5, '']];
    let svg = ''; const base = 300, sc = 9;
    svg += `<line x1="40" y1="${base}" x2="1190" y2="${base}" stroke="#aab6c2" stroke-width="1.5"/>`;
    G.forEach(([n, d, b, p, li, note], i) => {
      const x = 70 + i * 285, op = T.on(li, 0.5), gk = ss(T.st(li) + 0.2, T.st(li) + 1.2, T.u);
      svg += text(x + 95, 40, n, { size: 18, bold: true, anchor: 'middle', op }) + text(x + 95, 64, d, { size: 14.5, anchor: 'middle', color: COL.sub, op });
      for (const [j, v, c, nm] of [[0, b, '#9aa7b4', 'BLTR'], [1, p, COL.accent, 'PLTR']]) {
        const h = v * sc * gk, bx = x + 20 + j * 100;
        svg += `<rect x="${bx}" y="${base - h}" width="72" height="${h}" rx="4" fill="${c}" opacity="${op}"/>`;
        svg += text(bx + 36, base - h - 10, v + '%', { size: 17, bold: true, anchor: 'middle', op: op * gk }) + text(bx + 36, base + 24, nm, { size: 15, anchor: 'middle', color: COL.sub, op });
      }
      if (note) svg += `<g opacity="${op}"><rect x="${x + 22}" y="78" width="146" height="30" rx="6" fill="#fff4e5" stroke="${COL.amber}"/>${text(x + 95, 99, note, { size: 15, bold: true, anchor: 'middle', color: COL.amber })}</g>`;
    });
    return { F: { svg } };
  } },

// ---------------------------------------------------------------- 3 術前準備
{ id: 'c3', chapterCard: 3 },
{ id: '3-1', ch: 3, title: '打麻藥前，先標縫線位置', layout: 'dual', P: [COR_P, { title: '縫線間距與眼瞼輪廓異常', orient: 'Habtamu 2017（PLTR）' }],
  lines: ['打麻藥之前，\n先在皮膚上標出三組縫線的位置。',
          'Habtamu 2017 年的分析發現，\n三組縫線的間距左右差超過 2 mm 時，',
          '術後眼瞼輪廓異常的比例是 52.2%，\n間距對稱的只有 23.1%。',
          '作者建議養成打麻藥前先標記的習慣，\n避免縫線位置不對稱。'],
  keys: [[0, '打麻藥前先在皮膚上標三組縫線位置：中央、內側、外側。'], [1, '間距左右差 <b>> 2 mm</b> → 術後眼瞼輪廓異常 52.2%（對稱 23.1%）。']],
  src: [[1, 'Habtamu 2017']],
  draw(T) {
    const C = { evert: -1, marks: T.on(0, 0.6, 0.6), spacing: T.on(1), tarsus: 0.5 };
    let svg = ''; const b1 = ss(T.st(2), T.st(2) + 1.2, T.u), op = T.on(1);
    svg += tblock(30, 40, ['眼瞼輪廓異常比例'], { size: 17, bold: true, op });
    for (const [i, lbl, v, c] of [[0, '間距差 > 2 mm', 52.2, COL.red], [1, '間距對稱', 23.1, COL.accent]]) {
      const y = 80 + i * 90; svg += text(30, y + 22, lbl, { size: 16, op }) + `<rect x="170" y="${y}" width="340" height="34" rx="6" fill="#e6ebef" opacity="${op}"/><rect x="170" y="${y}" width="${340 * v / 100 * b1}" height="34" rx="6" fill="${c}" opacity="${op}"/>` +
        text(520, y + 24, v + '%', { size: 18, bold: true, op: op * b1 }); }
    const o3 = T.on(3); svg += card(30, 268, 546, 60, { op: o3, hl: o3 }) + text(50, 304, '打麻藥前先標記 → 縫線位置不容易跑掉', { size: 17, bold: true, color: COL.accent, op: o3 });
    let ex = ''; const cg = SEGS_DRAW_CACHE.corA;
    if (cg && cg.mark) ex += lab('三個標記：外側、中央、內側', 20, 40, cg.mark, { color: '#5b3fa0', bold: true, op: T.on(0, 0.6, 0.6) });
    return { L: { cor: C, extra: ex }, R: { svg } };
  } },
{ id: '3-2', ch: 3, title: '麻醉與器械', layout: 'dual', P: [COR_P, { title: '準備', orient: '' }],
  lines: ['麻醉用含 adrenaline 的 lidocaine，\n在上眼瞼皮下打 2 到 3 mL；',
          'trial 裡 1% 和 2% 兩種濃度都用過，\n照院內常規就好。',
          'PLTR 的特殊器械是 Trabut plate，\ntrial 裡每一台都用它。'],
  keys: [[0, '上眼瞼<b>皮下</b>：lidocaine with adrenaline 2–3 mL；濃度 1% 或 2%，依院內常規。'], [2, 'PLTR 用 <b>Trabut plate</b>。']],
  src: [[0, 'Habtamu 2016；Rajak 2011'], [2, 'Gower 2019']],
  draw(T) {
    const C = { evert: -1, marks: 1, inject: T.on(0) * (1 - T.on(2)), tarsus: 0.4 };
    let svg = ''; const o1 = T.on(0), o2 = T.on(1), o3 = T.on(2);
    svg += card(24, 22, 558, 132, { op: o1, hl: o1 * (1 - o3) }) + text(44, 56, '局部麻醉', { size: 18, bold: true, color: COL.accent, op: o1 }) +
      tblock(44, 90, ['lidocaine with adrenaline，上眼瞼皮下 2–3 mL'], { size: 17, op: o1 }) + tblock(44, 124, ['濃度：trial 用過 1% 與 2%，依院內常規'], { size: 16, color: COL.sub, op: o2 });
    svg += card(24, 176, 558, 150, { op: o3, hl: o3 }) + text(44, 210, 'Trabut plate', { size: 18, bold: true, color: COL.accent, op: o3 }) +
      tblock(44, 244, ['PLTR 的特殊器械，trial 裡每一台都用', '（放法以 WHO 手冊為準，本片不圖示）'], { size: 16.5, op: o3 });
    let ex = ''; const cg = SEGS_DRAW_CACHE.corA;
    if (cg && cg.skinLid) ex += lab('上眼瞼皮下', 20, 40, cg.skinLid, { color: '#2a7fb8', bold: true, op: T.on(0) * (1 - T.on(2)) });
    return { L: { cor: C, extra: ex }, R: { svg } };
  } },

// ---------------------------------------------------------------- 4 手術步驟
{ id: 'c4', chapterCard: 4 },
{ id: '4-1', ch: 4, title: '翻瞼，切開 posterior lamella', layout: 'dual', P: [SAG_P, EV_P],
  lines: ['把上眼瞼翻開，在 tarsal conjunctiva 上、\n離瞼緣 3 mm 的地方，和瞼緣平行，',
          '切穿結膜和 tarsus，\n也就是 posterior lamella；',
          '另一個 trial 寫的是 3 到 4 mm。',
          '切口要延伸到整個眼瞼的長度，\n內外兩端用剪刀補完；',
          '有作者建議，\n切口總長至少 20 mm。'],
  keys: [[0, '離瞼緣 <b>3 mm</b>、與瞼緣<b>平行</b>，切穿結膜＋tarsus（posterior lamella）。'], [3, '切口延伸到<b>整個眼瞼長度</b>，內外兩端用剪刀補完；有作者建議總長 ≥ 20 mm。']],
  src: [[0, 'Habtamu 2016；Rajak 2011'], [3, 'Gower 2019；Habtamu 2017；Rajak 2011']],
  draw(T) {
    const cut = T.p(0, 0.4, 1) * 0.5 + T.p(1, 0, 0.8) * 0.5;
    const S = { curl: 1, cut };
    const C = { everted: 1, scar: 0.35, incision: cut, ends: T.on(3) * (1 - T.on(4)), lenArrow: T.on(4) };
    let ex = '', rx = ''; const sg = SEGS_DRAW_CACHE.sagA, cg = SEGS_DRAW_CACHE.corA;
    if (sg) ex += lab('切口：離瞼緣 3 mm，只切後層', 380, 260, sg.cut, { color: COL.red, bold: true, op: T.on(0) });
    if (cg && cg.evInc) { rx += lab('切口：離瞼緣 3 mm，平行', 590, 300, cg.evInc, { side: 'R', color: COL.red, bold: true, op: T.on(0) * (1 - T.on(3)) });
      rx += lab('瞼緣', 20, 40, cg.evMargin, {}) + lab('內外兩端用剪刀補完', 590, 300, cg.evEndR, { side: 'R', color: COL.amber, bold: true, op: T.on(3) * (1 - T.on(4)) });
      rx += lab('總長 ≥ 20 mm（建議）', 590, 300, cg.evLen, { side: 'R', color: COL.accent, bold: true, op: T.on(4) }); }
    return { L: { sag: S, extra: ex }, R: { cor: C, extra: rx } };
  } },
{ id: '4-2', ch: 4, title: '分離兩層', layout: 'dual', P: [SAG_P, EV_P],
  lines: ['切開之後，把 posterior lamella 和前面的 orbicularis、皮膚，\n順著組織平面鈍性分離。',
          '前層和瞼緣側那片 tarsus 之間分出來的空間，\n等一下要讓上方那片 tarsus 的下緣塞進來。',
          '內外兩端，特別要做到位：',
          'Habtamu 2017 年的分析發現，用剪刀把切口往內外側延伸得越多，\n術後倒睫越少，odds ratio 是 0.70。',
          '作者也強調，\n訓練時要把周邊的切開和分離教清楚。'],
  keys: [[0, 'Posterior lamella 和前層（orbicularis＋皮膚）<b>鈍性分離</b>。'], [2, '<b>周邊要做到位</b>：剪刀往內外側延伸越多，術後倒睫越少（OR 0.70）。']],
  src: [[0, 'Rajak 2011；Habtamu 2016'], [3, 'Habtamu 2017']],
  draw(T) {
    const S = { curl: 1, cut: 1, plane: T.p(0, 0.3, 1) };
    const C = { everted: 1, scar: 0.35, incision: 1, ends: T.on(2) };
    let ex = '', rx = ''; const sg = SEGS_DRAW_CACHE.sagA, cg = SEGS_DRAW_CACHE.corA;
    if (sg) ex += lab('分離出的空間', 380, 300, sg.plane, { color: COL.accent, bold: true, op: T.on(0, 0.6, 1.5) });
    if (cg && cg.evEndL) rx += lab('周邊做到位', 20, 40, cg.evEndL, { color: COL.amber, bold: true, op: T.on(2) }) + lab('周邊做到位', 590, 40, cg.evEndR, { side: 'R', color: COL.amber, bold: true, op: T.on(2) });
    return { L: { sag: S, extra: ex }, R: { cor: C, extra: rx } };
  } },
{ id: '4-3', ch: 4, title: '放 everting sutures', layout: 'dual', P: [SAG_P, COR_P],
  lines: ['接著放三組 everting sutures。',
          '每一組都從上方那片 tarsus 的切緣進針，往下、往前走，\n從睫毛線正上方的皮膚穿出來。',
          'Trial 用的是 4-0 silk，\n縫線兩端各有一根針；',
          '也有 trial 用可吸收的 5-0 polyglactin，\n一年復發率和 silk 沒有差別。',
          '三組縫線的間距要對稱，\n中央到內側、中央到外側的距離差在 2 mm 以內。'],
  keys: [[0, '三組縫線：上方那片 tarsus 的<b>切緣</b> → 往下、往前 → <b>睫毛線正上方</b>的皮膚。'], [2, '4-0 silk（兩端各一根針）；5-0 polyglactin 一年復發率相同。'],
         [4, '間距對稱：中央–內側 vs 中央–外側，差 <b>≤ 2 mm</b>。']],
  src: [[0, 'Rajak 2011'], [2, 'Habtamu 2016；Rajak 2011'], [4, 'Habtamu 2017']],
  draw(T) {
    const S = { curl: 1, cut: 1, plane: 1, suture: T.p(1, 0.1, 0.9) };
    const C = { evert: -1, tarsus: 1, incision: 1, sutures: T.on(1, 0.8, 0.4), spacing: T.on(4), section: 1 };
    let rx = ''; const cg = SEGS_DRAW_CACHE.corA;
    if (cg && cg.suture) rx += lab('三組縫線', 20, 40, cg.suture, { color: COL.suture, bold: true, op: T.on(1) }) + lab('切口（結膜面）', 590, 300, cg.incision, { side: 'R', color: COL.red, op: 1 }) +
      lab('tarsus 範圍', 590, 270, cg.tarsus, { side: 'R' });
    let ex = '';
    ex += `<text x="592" y="290" fill="${COL.sub}" font-size="13" text-anchor="end" opacity="${T.on(1)}">縫線中段走法為示意</text><text x="592" y="308" fill="${COL.sub}" font-size="13" text-anchor="end" opacity="${T.on(1)}">（文獻只寫起點與出口）</text>`;
    return { L: { sag: S, extra: ex }, R: { cor: C, extra: rx } };
  } },
{ id: '4-4', ch: 4, title: '綁線：瞼緣怎麼轉出來', layout: 'dual', P: [SAG_P, COR_P],
  lines: ['綁線的時候，上方那片 tarsus 的下緣會被往下拉，\n塞進前層和瞼緣側那片 tarsus 之間的空間；',
          '瞼緣側那片就跟著往外轉，\n睫毛離開眼球。',
          '癒合之後，這塊塞進去的組織像楔子一樣，\n持續把瞼緣往外推，讓矯正比較穩定。',
          'WHO 手冊要求每一針，\n都綁到輕微過度矯正，',
          'Habtamu 2017 年的作者，\n甚至建議拿掉「輕微」兩個字。',
          '原因是術後立刻看到中央矯正不足的眼瞼，\n之後倒睫的比例是 36.4%，',
          '矯正足夠的只有 12.5%。'],
  keys: [[0, '綁緊：上方那片 tarsus 的下緣被拉下，塞進<b>前層和瞼緣側那片 tarsus 之間</b>，\n瞼緣側那片跟著<b>往外轉</b>。'],
         [2, '塞進去的 tarsus 癒合後像<b>楔子</b>，持續把瞼緣往外推。'],
         [3, 'WHO 手冊：每一針綁到<b>輕微過度矯正</b>；Habtamu 2017 建議拿掉「輕微」。\n中央矯正不足 → 術後倒睫 36.4%（足夠 12.5%）。']],
  src: [[0, 'Rajak 2011；Habtamu 2016'], [3, 'Habtamu 2017（引 WHO 手冊）']],
  draw(T) {
    const k1 = ss(T.st(0) + 0.6, T.en(1) - 0.4, T.u), k2 = ss(T.st(3) + 0.4, T.en(3) + 0.6, T.u);
    const S = { curl: 1, cut: 1, plane: 1, suture: 1, k: k1, over: 8 * k2, tuck: 0.7 * k1 + 0.3 * k2 };
    const C = { evert: -1 + k1 + 0.45 * k2, tarsus: 1, incision: 1, sutures: 1, tight: k1, section: 1 };
    let ex = ''; const sg = SEGS_DRAW_CACHE.sagA;
    const away = T.on(1) * (1 - T.on(2)), wedge = T.on(2) * (1 - T.on(3)), over = ss(T.en(3) - 0.2, T.en(3) + 0.6, T.u);
    if (sg) { ex += `<g opacity="${wedge}"><circle cx="${sg.wedge[0]}" cy="${sg.wedge[1]}" r="24" fill="none" stroke="${COL.accent}" stroke-width="2.5" stroke-dasharray="6 5"/></g>` + lab('楔子：持續往外推', 400, 120, [sg.wedge[0] + 22, sg.wedge[1] - 10], { color: COL.accent, bold: true, op: wedge }); }
    ex += text(446, 300, '睫毛離開角膜', { size: 17, bold: true, color: COL.accent, anchor: 'middle', op: away }) + text(446, 300, '輕微過度矯正', { size: 17, bold: true, color: COL.accent, anchor: 'middle', op: over });
    const b1 = ss(T.st(5) + 0.3, T.st(5) + 1.5, T.u), b2 = ss(T.st(6), T.st(6) + 1.0, T.u), bo = T.on(5);
    let rx = `<g opacity="${bo}"><rect x="12" y="10" width="262" height="112" rx="8" fill="#fff" stroke="#d3dae1"/>${text(26, 34, '術後倒睫（PLTR）', { size: 14.5, bold: true, color: COL.sub })}
      ${text(26, 66, '中央矯正不足', { size: 14.5 })}<rect x="122" y="54" width="${100 * b1}" height="16" rx="3" fill="#d9645f"/>${text(268, 68, '36.4%', { size: 14.5, bold: true, anchor: 'end', op: b1 })}
      ${text(26, 104, '矯正足夠', { size: 14.5 })}<rect x="122" y="92" width="${34 * b2}" height="16" rx="3" fill="${COL.accent}"/>${text(268, 106, '12.5%', { size: 14.5, bold: true, anchor: 'end', op: b2 })}</g>`;
    return { L: { sag: S, extra: ex }, R: { cor: C, extra: rx } };
  } },

// ---------------------------------------------------------------- 5 術中狀況
{ id: 'c5', chapterCard: 5 },
{ id: '5', ch: 5, title: '術中常見的五個狀況', layout: 'dual', P: [{ title: '五個狀況', orient: '' }, EV_P],
  lines: ['術中常見的狀況有五個。',
          '第一，出血：中等量的出血，\n用力壓住眼瞼幾分鐘就能控制。',
          '第二，不小心切斷瞼緣：\nMTSS trial 裡有一例，用一針 4-0 silk 修補。',
          '第三，中央三分之一的切口不規則或不平行，\n術後 granuloma 的 odds ratio 是 6.72，',
          '所以中央那段，\n要一刀切得平整。',
          '第四，術前睫毛在周邊的眼瞼，\nPLTR 之後倒睫的比例是 36.4%，其他只有 10%；',
          '鼻側的 tarsus 比較短，\n也比較難矯正。',
          '第五，很多人切口切太短，\n是因為怕出血、怕切斷瞼緣；',
          '但切口太短，\n周邊就轉不出來。'],
  keys: [[1, '出血：用力壓住眼瞼幾分鐘。'], [2, '切斷瞼緣：MTSS 有一例，一針 4-0 silk 修補。'], [3, '中央切口不規則 → granuloma（OR 6.72）：中央要<b>一刀切平</b>。'],
         [5, '周邊睫毛 → 術後倒睫 36.4%（其他 10%）；鼻側 tarsus 較短、較難矯正。'], [7, '切口太短（怕出血、怕切斷瞼緣）→ <b>周邊轉不出來</b>。']],
  src: [[1, 'Rajak 2011'], [2, 'Gower 2024'], [3, 'Habtamu 2017'], [6, 'Gower 2019'], [7, 'Gower 2019']],
  draw(T) {
    const items = [['出血', '用力壓住眼瞼幾分鐘', 1], ['切斷瞼緣', '一針 4-0 silk 修補', 2], ['中央切口不規則', 'granuloma OR 6.72', 3], ['周邊睫毛／鼻側', '倒睫 36.4% vs 10%', 5], ['切口太短', '周邊轉不出來', 7]];
    let cur = -1; items.forEach((it, i) => { if (T.u >= T.st(it[2]) - 0.2) cur = i; });
    let svg = '';
    items.forEach(([h, d, li], i) => { const y = 14 + i * 64, op = T.on(li, 0.4) * 0.6 + 0.4 * T.on(0), hl = cur === i ? 1 : 0;
      svg += card(20, y, 566, 56, { op, hl }) + text(40, y + 34, `${i + 1}`, { size: 22, bold: true, color: hl ? COL.accent : '#9aa7b4', op }) + text(76, y + 25, h, { size: 17, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(76, y + 47, d, { size: 14.5, color: COL.sub, op }); });
    const C = { everted: 1, scar: 0.35, incision: 1, bleed: T.on(1) * (1 - T.on(2)), notch: T.on(2) * (1 - T.on(3)), incWavy: T.on(3) * (1 - T.on(5)),
      nasalShort: T.on(6) * (1 - T.on(7)), incShort: T.on(7, 0.8), ends: T.on(5) * (1 - T.on(6)) };
    let rx = ''; const cg = SEGS_DRAW_CACHE.corA;
    if (cg && cg.evBleed) { rx += lab('出血：壓住', 590, 300, cg.evBleed, { side: 'R', color: '#b3122b', bold: true, op: C.bleed }) + lab('切斷瞼緣', 20, 40, cg.evNotch, { color: COL.amber, bold: true, op: C.notch }) +
      lab('中央切口不規則', 590, 300, cg.evCentre, { side: 'R', color: COL.red, bold: true, op: C.incWavy }) + lab('周邊睫毛', 20, 40, cg.evEndL, { color: COL.amber, bold: true, op: C.ends }) +
      lab('鼻側 tarsus 較短', 590, 40, cg.evNasal, { side: 'R', color: COL.amber, bold: true, op: C.nasalShort }) + lab('切口太短：周邊轉不出來', 590, 300, cg.evEndR, { side: 'R', color: '#5b6878', bold: true, op: C.incShort }); }
    return { L: { svg }, R: { cor: C, extra: rx } };
  } },

// ---------------------------------------------------------------- 6 只講差異
{ id: 'c6', chapterCard: 6 },
{ id: '6-1', ch: 6, title: 'BLTR 和 PLTR 差在哪', layout: 'dual', P: [{ title: 'PLTR：只切後層', orient: '左＝前　上＝上' }, { title: 'BLTR：全層切開', orient: '左＝前　上＝上' }],
  lines: ['BLTR 用 clamp 夾住眼瞼，\n從皮膚面離瞼緣 3 mm，全層切開前後兩層，',
          '兩層之間不做分離。',
          '因為切到皮膚和 orbicularis，\n術中和術後的出血、疼痛比較多；',
          '但 Habtamu 2016 年的 trial 裡，\nBLTR 的 granuloma 比較少，odds ratio 是 0.41。'],
  keys: [[0, 'BLTR：clamp 夾住，從<b>皮膚面全層</b>切開（離瞼緣 3 mm），兩層之間<b>不分離</b>。'], [2, 'BLTR 出血、疼痛較多；granuloma 較少（OR 0.41）。']],
  src: [[0, 'Habtamu 2016；Habtamu 2017']],
  draw(T) {
    const L = { curl: 1, cut: 1, plane: 1, labels: false };
    const R = { curl: 1, bltr: T.p(0, 0.3, 1), labels: false };
    const cap = (a, b, op, c) => text(592, 316, a, { size: 16, bold: true, anchor: 'end', color: c || COL.ink, op }) + text(592, 340, b, { size: 16, bold: true, anchor: 'end', color: c || COL.ink, op });
    return { L: { sag: L, extra: cap('只切結膜＋tarsus', '兩層之間要分離', 1, COL.accent) }, R: { sag: R, extra: cap('皮膚到結膜全層切開', '兩層之間不分離', T.on(0), COL.red) } };
  } },
{ id: '6-2', ch: 6, title: '從 lid crease 進去的做法', layout: 'dual', P: [SAG_P, { title: 'Cruz 2015 的做法', orient: '' }],
  lines: ['Cruz 2015 年發表的做法，\n是從 lid crease 進去：',
          '先掀起 pretarsal 的皮膚肌肉瓣，\n露出整片 tarsus，一直到睫毛根部，',
          '再從結膜面離瞼緣 3 mm，\n切穿 tarsus。',
          '三組雙針 6-0 Vicryl，把 tarsus 縫到睫毛線附近的 orbicularis，\n縫線留在眼瞼裡，不用 bolster，也不必回診拆線。',
          '同一個切口，還可以順便處理\nptosis、眼瞼退縮或皮膚鬆弛。',
          '這個系列做了 60 片眼瞼，平均只追蹤 3 個月，\n只有一片還有內側的睫毛碰到角膜。'],
  keys: [[0, 'Lid crease 切開 → 掀起 pretarsal 皮膚肌肉瓣 → 從結膜面離瞼緣 3 mm 切穿 tarsus。'], [3, '6-0 Vicryl <b>埋在眼瞼裡</b>：不用 bolster、不必拆線；可同時處理 ptosis、退縮、皮膚鬆弛。'],
         [5, '60 片眼瞼、平均追蹤僅 3 個月：只有 1 片內側睫毛碰角膜。']],
  src: [[0, 'Cruz 2015（兩篇）']],
  draw(T) {
    const S = { curl: lerp(1, 0.25, T.on(3, 1.5)), flapCut: T.p(0, 0.5, 1), flap: T.on(1, 1.2), cut: T.p(2, 0.2, 0.9), plane: 0, suture: T.p(3, 0.1, 0.5), buried: true,
      k: 0, cutLabels: true };
    let svg = ''; const steps = [['1　Lid crease 切開', 0], ['2　掀起皮膚肌肉瓣，露出 tarsus 到睫毛根', 1], ['3　結膜面離瞼緣 3 mm 切穿 tarsus', 2], ['4　6-0 Vicryl 埋線，不用 bolster、不必拆線', 3], ['5　可同時處理 ptosis、退縮、皮膚鬆弛', 4]];
    let cur = 0; steps.forEach(([, li], i) => { if (T.u >= T.st(li) - 0.2) cur = i; });
    steps.forEach(([s, li], i) => { const op = T.on(li, 0.5); svg += card(20, 14 + i * 56, 566, 48, { op, hl: cur === i && T.u < T.st(5) ? op : 0 }) + text(38, 44 + i * 56, s, { size: 16.5, op }); });
    const o5 = T.on(5); svg += `<g opacity="${o5}"><rect x="20" y="296" width="566" height="44" rx="8" fill="#fff4e5" stroke="${COL.amber}"/>${text(38, 324, '60 片眼瞼、平均追蹤 3 個月：1 片內側睫毛碰角膜', { size: 15.5, bold: true, color: COL.amber })}</g>`;
    let ex = ''; const sg = SEGS_DRAW_CACHE.sagA;
    if (sg) ex += lab('lid crease 切口', 400, 60, sg.crease, { color: COL.red, bold: true, op: T.on(0) * (1 - T.on(2)) }) + lab('皮膚肌肉瓣', 400, 100, sg.flap, { color: COL.accent, bold: true, op: T.on(1) * (1 - T.on(3)) });
    return { L: { sag: S, extra: ex }, R: { svg } };
  } },

// ---------------------------------------------------------------- 7 術後
{ id: 'c7', chapterCard: 7 },
{ id: '7', ch: 7, title: '術後照顧與追蹤', layout: 'full', P: [{ title: '術後時間軸', orient: '各院做法不同處，依院內常規' }],
  lines: ['Trial 裡術後包眼一天，\ntetracycline 藥膏一天兩次、點兩週；',
          '藥膏的選擇，依院內常規。',
          '術後第一天，如果看得到 tarsus 的切緣，\n代表嚴重過度矯正，要再處理。',
          'Silk 縫線在 7 到 14 天之間拆，\n各 trial 的時間不同。',
          '復發最常出現在術後前 6 個月，\n在一個只做 PLTR 的兩年追蹤裡，55% 的復發落在這段時間；',
          '但復發可以晚到術後一年才出現，\n跟用哪種術式無關。',
          '同一個兩年追蹤裡，\ngranuloma 是 5.7%，瞼緣缺角是 13.0%。'],
  keys: [[0, 'Trial：包眼 1 天，tetracycline 藥膏一天兩次、兩週（藥膏依院內常規）。'], [2, '術後第 1 天看得到 tarsus 切緣 = <b>嚴重過度矯正</b>，要再處理。'],
         [4, '復發 55% 在前 6 個月，但可晚到 1 年；granuloma 5.7%、瞼緣缺角 13.0%（PLTR 兩年）。']],
  src: [[0, 'Habtamu 2016'], [2, 'Bayissasse 2020'], [3, 'Habtamu 2016；Rajak 2011'], [4, 'Rajak 2013'], [5, 'Singh 2024']],
  draw(T) {
    const pts = [['第 1 天', ['包眼 1 天', '看得到 tarsus 切緣', '→ 嚴重過度矯正，再處理'], 0], ['7–14 天', ['拆 silk 縫線', '（各 trial 不同）'], 3], ['前 6 個月', ['復發最常出現', '（55% 的復發）'], 4], ['1 年', ['復發可晚到一年', '跟術式無關'], 5]];
    let svg = `<line x1="60" y1="70" x2="1170" y2="70" stroke="#aab6c2" stroke-width="3"/>`;
    pts.forEach(([h, ls, li], i) => { const x = 170 + i * 296, op = T.on(li, 0.5);
      svg += `<circle cx="${x}" cy="70" r="11" fill="${COL.accent}" opacity="${op}"/>` + text(x, 42, h, { size: 19, bold: true, anchor: 'middle', op }) + card(x - 120, 100, 240, 130, { op }) + tblock(x - 104, 136, ls, { size: 16.5, op }); });
    const o6 = T.on(6); svg += `<g opacity="${o6}"><rect x="290" y="260" width="650" height="56" rx="8" fill="#fff4e5" stroke="${COL.amber}"/>${text(615, 296, 'PLTR 兩年追蹤：granuloma 5.7%　瞼緣缺角 13.0%', { size: 18, bold: true, color: COL.amber, anchor: 'middle' })}</g>`;
    return { F: { svg } };
  } },

// ---------------------------------------------------------------- 8 跟刀清單
{ id: 'c8', chapterCard: 8 },
{ id: '8', ch: 8, title: '跟刀時看這八件事', layout: 'full', P: [{ title: '跟刀清單', orient: '' }], tail: 2.5,
  lines: ['跟刀時看這八件事。',
          '一，確認是 entropion，\n不只是幾根歪掉的睫毛。',
          '二，pemphigoid 的病人，\n炎症有沒有控制穩定。',
          '三，打麻藥前，先標好縫線位置。',
          '四，切口離瞼緣 3 mm、和瞼緣平行，\n延伸到整個眼瞼。',
          '五，內外兩端的分離，有沒有做到位。',
          '六，縫線從上方 tarsus 的切緣，\n走到睫毛線正上方的皮膚。',
          '七，中央綁到過度矯正。',
          '八，術後第一天看有沒有過度矯正，\n之後追蹤一年，看有沒有復發。'],
  keys: [[0, '術前 2 件、術中 5 件、術後 1 件。']],
  src: [[0, '本片各章來源']],
  draw(T) {
    const items = ['確認是 entropion，不只是幾根歪睫毛', 'Pemphigoid：炎症控制穩定了嗎', '打麻藥前先標縫線位置', '切口離瞼緣 3 mm、平行、延伸全長', '內外兩端分離做到位', '縫線：上方 tarsus 切緣 → 睫毛線正上方皮膚', '中央綁到過度矯正', '術後第 1 天看過度矯正，追蹤 1 年看復發'];
    let svg = '';
    items.forEach((s, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 30 + col * 600, y = 18 + row * 80, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
      svg += card(x, y, 570, 66, { op, hl: now }) + `<circle cx="${x + 34}" cy="${y + 33}" r="17" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 34, y + 40, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) + text(x + 66, y + 40, s, { size: 18, op }); });
    return { F: { svg } };
  } },

// ---------------------------------------------------------------- 參考文獻
{ id: 'c9', chapterCard: 9 },
{ id: 'refs', ch: 9, title: '參考文獻', layout: 'refs', dur: 32, lines: [] },
];
const SEGS_DRAW_CACHE = {};

const REFS = [
 'Rajak SN, Collin JRO, Burton MJ. Trachomatous trichiasis and its management in endemic countries. Surv Ophthalmol 2012;57(2):105-35.',
 'Habtamu E, et al. Posterior lamellar versus bilamellar tarsal rotation surgery for trachomatous trichiasis in Ethiopia: a randomised controlled trial. Lancet Glob Health 2016;4(3):e175-84.',
 'Habtamu E, et al. Predictors of trachomatous trichiasis surgery outcome. Ophthalmology 2017;124(8):1143-1155.',
 'Habtamu E, et al. Posterior lamellar versus bilamellar tarsal rotation surgery for trachomatous trichiasis: long-term outcomes from a randomised controlled trial. EClinicalMedicine 2019;17:100202.',
 'Gower EW, et al. The impact of modified incision height and surgical procedure on trichiasis surgery outcomes: results of the MTSS randomized trial. PLoS Negl Trop Dis 2024;18(9):e0012034.',
 'Bayissasse B, et al. Maximising trichiasis surgery success (MTSS) trial: rationale and design. BMJ Open 2020;10(3):e036327.',
 'Kempen JH, et al. Outcomes of posterior lamellar tarsal rotation vs bilamellar tarsal rotation for trachomatous trichiasis. PLoS Negl Trop Dis 2025;19(7):e0013152.',
 'Gower EW, et al. Pre-operative trichiatic eyelash pattern predicts post-operative trachomatous trichiasis. PLoS Negl Trop Dis 2019;13(10):e0007637.',
 'Rajak SN, et al. Absorbable versus silk sutures for surgical treatment of trachomatous trichiasis in Ethiopia: a randomised controlled trial. PLoS Med 2011;8(12):e1001137.',
 'Rajak SN, et al. The outcome of trachomatous trichiasis surgery in Ethiopia: risk factors for recurrence. PLoS Negl Trop Dis 2013;7(8):e2392.',
 'Cruz AAV, et al. The versatile lid crease approach to upper eyelid margin rotation. Middle East Afr J Ophthalmol 2015;22(4):407-9.',
 'Cruz AAV, et al. Upper lid crease approach for margin rotation in trachomatous cicatricial entropion without external sutures. Arq Bras Oftalmol 2015;78(6):367-70.',
 'Kersten RC, Kleiner FP, Kulwin DR. Tarsotomy for the treatment of cicatricial entropion with trichiasis. Arch Ophthalmol 1992;110(5):714-7.',
 'Ross AH, et al. Management of upper eyelid cicatricial entropion. Clin Exp Ophthalmol 2011;39(6):526-36.',
 'Erdoğan M, Karadeniz Uğurlu Ş. Marginal entropion: a frequently overlooked eyelid malposition. Turk J Ophthalmol 2015;45(5):203-207.',
 'Ferreira IS, et al. Trichiasis. Semin Ophthalmol 2010;25(3):66-71.',
 'Singh S, et al. Drug induced cicatrizing conjunctivitis: a case series with review. Ocul Surf 2022;24:83-92.',
 'Singh S, Malhotra R, Watson SL. Mucous membrane grafting for cicatricial entropion repair: review of surgical techniques and outcomes. Orbit 2024;43(4):539-548.',
 'Schmidt E, et al. European Guidelines (S3) on diagnosis and management of mucous membrane pemphigoid – Part II. J Eur Acad Dermatol Venereol 2021;35(10):1926-1948.',
 'Heiligenhaus A, et al. Long-term results of mucous membrane grafting in ocular cicatricial pemphigoid. Ophthalmology 1993;100(9):1283-8.',
 'Wang K, Seitzman G, Gonzales JA. Ocular cicatricial pemphigoid. Curr Opin Ophthalmol 2018;29(6):543-551.',
 'Hatton MP, Raizman M, Foster CS. Exacerbation of undiagnosed ocular cicatricial pemphigoid after repair of involutional entropion. Ophthalmic Plast Reconstr Surg 2008;24(2):165-6.',
];
if (typeof module !== 'undefined') module.exports = { SEGS, CHAPTERS };
