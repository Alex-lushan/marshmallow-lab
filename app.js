'use strict';

const SOURCES = [
  "Kidd, Palmeri & Aslin (2013). \"Rational snacking: Young children's decision-making on the marshmallow task is moderated by beliefs about environmental reliability.\" Cognition, 126(1), 109–114. doi:10.1016/j.cognition.2012.08.004. 免費睇全文：https://pmc.ncbi.nlm.nih.gov/articles/PMC3730121/ ｜ 重點數字：唔可信組平均等咗 3 分 02 秒 vs 可信組 12 分 02 秒（p < 0.0005）；等足 15 分鐘嘅比例 1/14 vs 9/14。",
  "Watts, Duncan & Quan (2018). Psychological Science, 29(7), 1159–1177. doi:10.1177/0956797618761661. 免費睇全文：https://europepmc.org/articles/PMC6050075 ｜ 重點數字：等候同 15 歲成就嘅相關，大約係原研究一半；計埋家庭背景、早期認知同家庭環境後，再減少三分之二；大部分差異嚟自可唔可以等到至少 20 秒。",
  "Shoda, Mischel & Peake (1990). \"Predicting adolescent cognitive and self-regulatory competencies from preschool delay of gratification.\" Developmental Psychology, 26(6), 978–986. ｜ 重點數字：等得耐啲嘅小朋友，SAT 總分平均高約 210 分。",
  "Mischel & Ebbesen (1970). \"Attention in delay of gratification.\" Journal of Personality and Social Psychology, 16(2), 329–337. ｜ 重點：睇唔到獎勵／轉移咗注意力嘅小朋友，會等得耐好多。",
  "Bandura & Mischel (1965). \"Modification of self-imposed delay of reward through exposure to live and symbolic models.\" Journal of Personality and Social Psychology, 31(4), 698–705. ｜ 重點：見到榜樣示範，小朋友會傾向揀延遲獎勵。",
  "Metcalfe & Mischel (1999). \"A hot/cool-system analysis of delay of gratification.\" Psychological Review, 106(1), 3–19. doi:10.1037/0033-295X.106.1.3 ｜ 重點：冷／熱系統；「將棉花糖諗成雲朵」可以減低誘惑。",
  "Gollwitzer (1999). \"Implementation intentions: Strong effects of simple plans.\" American Psychologist, 54(7), 493–503. ｜ 重點：「如果—就咁做」嘅執行意圖。",
  "Moffitt et al. (2011). \"A gradient of childhood self-control predicts health, wealth, and public safety.\" PNAS, 108(7), 2693–2698. doi:10.1073/pnas.1010076108. 免費睇全文：https://pmc.ncbi.nlm.nih.gov/articles/PMC3041102/ ｜ 重點：達尼丁千人追蹤研究；計埋 IQ 同家庭社會階層後，梯度效應仍然成立。",
  "Schlam et al. (2013). \"Preschoolers' delay of gratification predicts their body mass 30 years later.\" Journal of Pediatrics, 162(1), 90–93. doi:10.1016/j.jpeds.2012.06.049 ｜ 重點數字：每等多 1 分鐘，30 年後 BMI 低約 0.2。",
  "Haushofer & Fehr (2014). \"On the psychology of poverty.\" Science, 344(6186), 862–867. doi:10.1126/science.1232491 ｜ 重點：貧困同不確定性會加強現時偏好；將來唔可靠，等候就未必合理。",
  "Schultz, Dayan & Montague (1997). \"A neural substrate of prediction and reward.\" Science, 275(5306), 1593–1599. ｜ 重點：多巴胺獎賞預測誤差，即時獎賞嘅神經機制。",
  "Ainslie (1975). \"Specious reward: A behavioral theory of impulsiveness and impulse control.\" Psychological Bulletin, 82(4), 463–496.；Laibson (1997). \"Golden eggs and hyperbolic discounting.\" Quarterly Journal of Economics, 112(2), 443–477. ｜ 重點：雙曲貼現，人會將近期嘅得益同損失睇得特別重。",
  "畫風參考：Tim Urban, \"Why Procrastinators Procrastinate\"（Wait But Why, 2013）：https://waitbutwhy.com/2013/10/why-procrastinators-procrastinate.html 同佢嘅 TED 演講 https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator ｜ 畫風只作參考，角色獨立創作。中文科普補充：https://iepsy.com/article/247"
];

// 存储失败时仍更新内存，使隐私模式下的完整流程可继续。
const memory = Object.create(null);
const KEYS = { sprint: 'mlab_v1', lives: 'mlab_v2', trust: 'mlab_v3', board: 'mlab_board', nick: 'mlab_nick' };
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) memory[key] = JSON.parse(raw);
  } catch { /* 继续使用当前会话的数据。 */ }
  return memory[key] ?? fallback;
}
function write(key, value) {
  memory[key] = value;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 本机会话继续可玩。 */ }
}
let nick = memory[KEYS.nick];
try { nick = localStorage.getItem(KEYS.nick); } catch { /* 首次生成会话昵称。 */ }
if (!nick) {
  nick = '匿名棉花糖 #' + String(Math.floor(Math.random() * 100)).padStart(2, '0');
  try { localStorage.setItem(KEYS.nick, nick); } catch { /* 使用会话昵称。 */ }
}
memory[KEYS.nick] = nick;

const $ = (selector) => document.querySelector(selector);
const icon = (name, className = 'character') => '<svg class="' + className + '" aria-hidden="true"><use href="#' + name + '"/></svg>';
function mallows(count, className = 'mallow-pile') {
  return '<span class="' + className + '" role="img" aria-label="' + count + ' 粒棉花糖">' +
    Array.from({ length: count }, () => icon('mallow', 'mallow-token')).join('') + '</span>';
}
const sprintData = () => read(KEYS.sprint, { totalCoins: 0, rounds: [], percentile: null });
const trustData = () => read(KEYS.trust, { samples: [] });
const lifeData = () => read(KEYS.lives, { runs: [] });
const boardData = () => read(KEYS.board, { totalWaiters: 0, totalSprintSec: [] });
// 新玩法的奖励和等待时长集中定义，界面、结算与统计共用。
const RULES_VERSION = 2;
const IMMEDIATE_REWARD = 2;
const REWARDS = [5, 5, 5];
const WAIT_SECONDS = [20, 25, 30];
const TRUST_WAIT_SECONDS = 25;
const TASK_REWARD = 2;
const STRATEGIES = [
  { name: '收埋佢', description: '遮住誘惑，等自己睇唔到獎勵。', why: '睇唔到誘惑，等落就冇咁辛苦。', source: 3 },
  { name: '轉移注意力', description: '撳吓泡泡，將注意力放去第二度。', why: '專心做第二樣嘢，可以幫你等耐啲。', source: 3 },
  { name: '換個諗法', description: '將棉花糖諗成嚿雲，幫衝動降吓溫。', why: '換個冷靜啲嘅諗法，誘惑就冇咁大。', source: 5 },
  { name: '如果—就咁做', description: '預先諗好：衝動一嚟，我就咁做。', why: '預先寫低點做，衝動一嚟就有辦法。', source: 6 },
];
const TEMPTATIONS = [
  '而家撳，2 粒即刻到手！', '人哋都撳咗，得你仲等緊～', '等咁耐，好攰喇啩？',
  '2 粒棉花糖都好吸引㗎！', '你肯定等陣真係有 5 粒？', '（急急猴搖尾巴）快～啲～撳啦～',
];

let screen = 'home';
let timer = 0;
let later = 0;
let active = null;
let currentCard = null;
let toastTimer = 0;
let shareURL = null;
const charts = new Map();

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000);
}
function stopClock() {
  cancelAnimationFrame(timer);
  clearTimeout(later);
}
function removeCharts() {
  charts.forEach((chart) => chart.destroy());
  charts.clear();
}
function replace(container, content) {
  removeCharts();
  $(container).innerHTML = content;
}
function chart(id, type, labels, datasets, options = {}, plugins = []) {
  if (charts.has(id)) charts.get(id).destroy();
  const instance = new Chart($('#' + id), {
    type, data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      color: '#2D2A26', font: { family: '"PingFang HK","PingFang TC","PingFang SC","Microsoft YaHei",sans-serif', size: 13 },
      plugins: { legend: { labels: { boxWidth: 12, padding: 14 } } },
      scales: { y: { beginAtZero: true, ticks: { maxTicksLimit: 6 } }, x: { grid: { display: false } } },
      ...options,
    }, plugins,
  });
  charts.set(id, instance);
  return instance;
}
function whyCard(conclusion, indexes, assumption = '') {
  return '<article class="card why-card"><h2>點解？科學係咁講</h2><p>' + conclusion + '</p>' +
    (assumption ? '<p class="fine">' + assumption + '</p>' : '') +
    indexes.map((index) => '<p class="citation">' + SOURCES[index] + '</p>').join('') + '</article>';
}
function confetti() {
  return '<div class="confetti" aria-hidden="true">' + Array.from({ length: 20 }, (_, index) =>
    '<span style="left:' + index * 5 + '%;background:' + ['#7FC8A9', '#F2A0A0', '#F5C542', '#5B8DEF'][index % 4] +
    ';animation-delay:' + (index % 7) * .15 + 's"></span>').join('') + '</div>';
}

function go(destination) {
  if (destination === screen) return;
  if (active?.type === 'trust') {
    finishTrust(true);
    toast('實驗做完，我哋會同你解釋清楚。');
    return;
  }
  if (active?.type === 'sprint') {
    abandonSprint();
  }
  active = null;
  stopClock();
  removeCharts();
  screen = destination;
  document.querySelectorAll('.screen').forEach((section) => {
    const show = section.id === 'screen-' + destination;
    section.hidden = !show;
    section.classList.toggle('active', show);
  });
  document.querySelectorAll('.tab-bar button').forEach((button) => {
    if (button.dataset.screen === destination) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  $('#home-qr').hidden = destination !== 'home';
  if (destination === 'sprint') sprintIntro();
  if (destination === 'lives') lifeIntro();
  if (destination === 'trust') trustIntro();
  if (destination === 'board') renderBoard();
  window.scrollTo(0, 0);
}
document.addEventListener('click', (event) => {
  const navigation = event.target.closest('[data-screen]');
  if (navigation) go(navigation.dataset.screen);
});

// 每帧读取时间戳；回到前台立即补偿后台经过的时间。
function clock(update) {
  stopClock();
  function tick() {
    if (!active) return;
    update(Date.now());
    if (active?.update === update) timer = requestAnimationFrame(tick);
  }
  tick();
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && active?.update) active.update(Date.now());
});

function roundGroups(rounds) {
  const groups = [];
  let group = [];
  rounds.filter((round) => round.rulesVersion === RULES_VERSION).forEach((round) => {
    if (round.round === 1) group = [];
    if (round.giveup || round.round !== group.length + 1) return;
    group.push(round);
    if (group.length === 3) groups.push(group.slice());
  });
  return groups;
}
function waitingPercentile(value, samples) {
  return samples.length ? Math.round(samples.filter((sample) => sample < value).length / samples.length * 100) : 0;
}
function sprintProgress() {
  const rounds = sprintData().rounds.filter((round) => round.rulesVersion === RULES_VERSION);
  if (!rounds.length || (rounds.at(-1).round === 3 && !rounds.at(-1).giveup)) return { round: 1, strategy: null };
  const last = rounds.at(-1);
  return { round: last.giveup ? last.round : last.round + 1, strategy: last.strategy };
}

function sprintIntro() {
  const progress = sprintProgress();
  const duration = WAIT_SECONDS[progress.round - 1];
  const name = ['直接試吓', '帶住策略', '信守承諾'][progress.round - 1];
  replace('#sprint-content', '<div class="game-heading"><h1>棉花糖等候挑戰</h1><span class="round-chip">第 ' + progress.round + ' / 3 回合</span></div>' +
    '<div class="card game-intro"><div><h2>' + name + '</h2><p>即刻享受，拎到 ' + IMMEDIATE_REWARD +
    ' 粒棉花糖；等足 ' + duration + ' 秒，拎到 ' + REWARDS[progress.round - 1] + ' 粒棉花糖。</p>' +
    '<p class="fine">等一等，獎勵就有 2.5 倍。三回合分別等 20、25、30 秒。</p>' +
    '<button class="button" id="sprint-start">開始呢個回合</button></div>' + icon('mallow', 'character bounce') + '</div>');
  $('#sprint-start').onclick = () => progress.round === 2 ? pickStrategy() : startSprint(progress.round, null);
}
function pickStrategy() {
  replace('#sprint-content', '<div class="page-intro"><h1>幫等候揀件裝備。</h1><p>第 2 / 3 回合 · 揀張策略卡，玩法即刻唔同。</p></div>' +
    '<div class="strategy-grid">' + STRATEGIES.map((strategy, index) =>
      '<button class="strategy" data-strategy="' + index + '"><strong>' + strategy.name + '</strong><small>' + strategy.description + '</small></button>').join('') + '</div>');
  document.querySelectorAll('[data-strategy]').forEach((button) => {
    button.onclick = () => {
      const strategy = Number(button.dataset.strategy);
      if (strategy === 3) {
        replace('#sprint-content', '<div class="card"><h1>如果—就咁做</h1><label for="plan">先揀一句計劃</label>' +
          '<select class="plan-select" id="plan"><option>如果我好想撳掣，我就深呼吸 3 次</option><option>如果我好想撳掣，我就望吓第二度</option></select>' +
          '<button class="button" id="plan-start">帶住計劃開始</button></div>');
        $('#plan-start').onclick = () => startSprint(2, strategy, $('#plan').value);
      } else startSprint(2, strategy);
    };
  });
}

function arena(title, reward, strategy, plan, duration, isTrust = false) {
  const cloud = strategy === 2;
  return '<div class="game-heading"><h1>' + title + '</h1><span class="round-chip">等足 ' + duration + ' 秒：' + reward + ' 粒棉花糖</span></div>' +
    '<div class="promise">延遲享受，獎勵有 2.5 倍' + (isTrust ? '' : ' · 講到做到') + '</div>' +
    '<div class="card game-arena"><div class="countdown" role="timer"><span id="remaining">' + duration + '</span><small> 秒</small></div>' +
    '<div class="delayed-offer">' + mallows(reward) + '<p>等足就拎到 ' + reward + ' 粒棉花糖</p></div>' +
    '<div class="challenge-stage"><div class="reward-slot">' +
    '<button class="reward-button glow" id="tempt-button"' + (strategy === 0 ? ' disabled tabindex="-1" aria-hidden="true"' : '') + '>' +
    (cloud ? '<span class="candy">☁️</span>' : mallows(IMMEDIATE_REWARD)) +
    '<span>即刻享受</span><small>拎 ' + IMMEDIATE_REWARD + ' 粒棉花糖</small></button>' +
    (strategy === 0 ? '<div class="cover">' + icon('mallow') + '</div>' : '') +
    '</div><div class="monkey-temptation">' + icon('monkey', 'wiggle') + '<p class="temptation" id="temptation">' + TEMPTATIONS[0] + '</p></div></div>' +
    (cloud ? '<p>佢只係一團空氣</p>' : '') +
    '<div class="progress" aria-hidden="true"><span id="wait-progress"></span></div>' +
    '<p class="cheer bounce" id="cheer" hidden>' + icon('mallow', '') + '頂住呀！棉花糖君幫你打氣 🎈</p>' +
    (strategy === 1 ? '<p>撳泡泡 · <span id="pop-count">0</span></p><div class="bubbles">' + Array.from({length: 8}, (_, i) => '<button aria-label="撳爆第 ' + (i + 1) + ' 個泡泡"></button>').join('') + '</div>' : '') +
    (plan ? '<p class="fine">' + plan + '</p><div class="breath" id="breath" hidden></div>' : '') +
    '</div><div class="actions"><button class="button secondary" id="abandon">' + (isTrust ? '結束實驗，睇返解說' : '放棄呢個回合') + '</button></div>';
}
function startSprint(round, strategy, plan = '') {
  const data = sprintData();
  if (data.rounds.at(-1)?.rulesVersion === RULES_VERSION && data.rounds.at(-1).giveup && data.rounds.at(-1).round === round) data.rounds.pop();
  const index = data.rounds.length;
  data.rounds.push({ round, rulesVersion: RULES_VERSION, duration: WAIT_SECONDS[round - 1], waitSec: 0, success: false, giveup: true, strategy: strategy === null ? null : STRATEGIES[strategy].name });
  write(KEYS.sprint, data);
  replace('#sprint-content', arena('第 ' + round + ' 回合 · ' + ['直接試吓', '帶住策略', '信守承諾'][round - 1], REWARDS[round - 1], strategy, plan, WAIT_SECONDS[round - 1]));
  active = { type: 'sprint', start: Date.now(), round, strategy, index, duration: WAIT_SECONDS[round - 1] };
  $('#tempt-button').onclick = () => finishSprint(false);
  $('#abandon').onclick = () => { abandonSprint(); sprintIntro(); };
  if (strategy === 1) {
    let count = 0;
    document.querySelectorAll('.bubbles button').forEach((button) => {
      button.onclick = () => {
        if (button.disabled) return;
        button.disabled = true;
        button.classList.add('popped');
        $('#pop-count').textContent = ++count;
        setTimeout(() => { if (button.isConnected) { button.disabled = false; button.classList.remove('popped'); } }, 650);
      };
    });
  }
  runWaiting(() => finishSprint(true));
}
function updateArena(elapsed) {
  $('#remaining').textContent = Math.ceil(Math.max(0, active.duration - elapsed));
  $('#wait-progress').style.width = Math.min(100, elapsed / active.duration * 100) + '%';
  $('#temptation').textContent = TEMPTATIONS[Math.floor(elapsed / 8) % TEMPTATIONS.length];
  $('#tempt-button').style.setProperty('--tempt-scale', 1 + Math.min(2, Math.floor(elapsed / (active.duration / 3))) * .04);
  $('#cheer').hidden = elapsed < active.duration - 5;
  if (active.strategy === 3 && elapsed >= 1) {
    const container = $('#breath');
    container.hidden = false;
    container.innerHTML = [1].map((begin) => {
      const passed = elapsed - begin;
      if (passed < 0 || passed >= 19) return '';
      const label = passed < 4 ? '吸氣 · 4 秒' : passed < 11 ? '閉氣 · 7 秒' : '呼氣 · 8 秒';
      return '<div>' + label + '<div class="progress"><span style="width:' + Math.min(100, passed / 19 * 100) + '%"></span></div></div>';
    }).join('');
    container.hidden = container.innerHTML === '';
  }
}
function runWaiting(onSuccess) {
  const update = (now) => {
    if (!active) return;
    const elapsed = Math.min(active.duration, Math.max(0, (now - active.start) / 1000));
    updateArena(elapsed);
    if (elapsed >= active.duration) onSuccess();
  };
  active.update = update;
  clock(update);
}
function abandonSprint() {
  stopClock();
  active = null;
}
function finishSprint(success) {
  if (active?.type !== 'sprint') return;
  const { index, round, strategy, start, duration } = active;
  const elapsed = Math.max(0, (Date.now() - start) / 1000);
  success = success || elapsed >= duration;
  const waitSec = success ? duration : Math.min(duration, Math.round(elapsed * 10) / 10);
  const data = sprintData();
  const coins = success ? REWARDS[round - 1] : IMMEDIATE_REWARD;
  data.rounds[index] = { round, rulesVersion: RULES_VERSION, duration, waitSec, success, giveup: false, strategy: strategy === null ? null : STRATEGIES[strategy].name };
  data.totalCoins = data.rounds.filter((entry) => entry.rulesVersion === RULES_VERSION && !entry.giveup).reduce((sum, entry) => sum + (entry.success ? REWARDS[entry.round - 1] : IMMEDIATE_REWARD), 0);
  active = null;
  stopClock();
  if (round === 3) {
    const group = data.rounds.slice(-3);
    const total = group.reduce((sum, entry) => sum + entry.waitSec, 0);
    const board = boardData();
    board.totalSprintSec.push(total);
    board.totalWaiters = board.totalSprintSec.length;
    data.percentile = waitingPercentile(total, roundGroups(data.rounds).map((entries) => entries.reduce((sum, entry) => sum + entry.waitSec, 0)));
    write(KEYS.board, board);
  }
  write(KEYS.sprint, data);
  const source = round === 2 ? STRATEGIES[strategy].source : round === 3 ? 0 : 11;
  const conclusion = round === 2 ? STRATEGIES[strategy].why : round === 3 ? '環境夠安全、承諾信得過，等候先有穩陣嘅基礎。' : '眼前嘅獎勵特別吸引，識用策略可以幫我哋練習等候。';
  let settlement = '<div class="card result-card bounce">' + (success ? confetti() : '') +
    '<h2>' + (success ? '等到喇，講到做到。' : '呢個回合，拎住 2 粒先。') + '</h2><p class="big-number">' + coins + ' 粒棉花糖</p><p>等咗 ' + waitSec.toFixed(1) + ' 秒</p></div>';
  if (round === 3) settlement = sprintSettlement(data);
  replace('#sprint-content', settlement + whyCard(conclusion, [source]) +
    '<div class="actions">' + (round < 3 ? '<button class="button" id="next-round">下一個回合</button>' : '<button class="button" data-share="sprint">整張成績卡</button>') +
    '<button class="button secondary" data-screen="home">返主頁</button></div>');
  if (round < 3) $('#next-round').onclick = sprintIntro;
  if (round === 3) {
    const group = data.rounds.slice(-3);
    chart('sprint-chart', 'bar', ['直接試吓', '帶住策略', '信守承諾'], [{ label: '等候秒數', data: group.map((r) => r.waitSec), backgroundColor: ['#E8A75D', '#7FC8A9', '#5B8DEF'], borderColor: '#2D2A26', borderWidth: 2, borderRadius: 7 }], { scales: { y: { beginAtZero: true, max: Math.max(...WAIT_SECONDS) }, x: { grid: { display: false } } } });
  }
}
function sprintSettlement(data) {
  const group = data.rounds.slice(-3);
  const wins = group.filter((r) => r.success).length;
  const coins = group.reduce((sum, r) => sum + (r.success ? REWARDS[r.round - 1] : IMMEDIATE_REWARD), 0);
  const message = wins === 3 ? '你已經將等候策略用得好順手喇！🎉' : !group[0].success && group.slice(1).some((r) => r.success) ? '見到啦，等候係可以練返嚟㗎。' : '等候有策略，承諾亦要信得過。';
  currentCard = { module: '棉花糖等候挑戰', score: coins + ' 粒棉花糖', detail: '三個回合等咗 ' + group.map((r) => r.waitSec.toFixed(1)).join(' / ') + ' 秒', percentile: data.percentile, quote: message };
  return '<div class="card result-card bounce">' + (wins ? confetti() : '') + '<h2>' + message + '</h2>' +
    '<div class="result-stats"><div>棉花糖總數<strong>' + coins + ' 粒</strong></div><div>三個回合成功率<strong>' + Math.round(wins / 3 * 100) + '%</strong></div></div>' +
    '<p>你比呢部機 ' + data.percentile + '% 嘅完成紀錄等得耐</p><p class="fine">只比較呢部機用同一套規則完成嘅紀錄。</p><div class="chart-wrap"><canvas id="sprint-chart" aria-label="三個回合嘅等候柱狀圖" role="img"></canvas></div></div>';
}


const ASSUMPTION = '教學假設：每年即刻享受可拎 2 粒棉花糖，延遲享受可累積 5 粒；之前累積嘅數量每年增長 7%。圖表係數學模擬，棉花糖係虛擬獎勵。';
function annualValue(balance, save) {
  return balance * 1.07 + (save ? REWARDS[0] : 0);
}
function fullValue(years) {
  return REWARDS[0] * (Math.pow(1.07, years) - 1) / .07;
}
function roundedValue(number) {
  return number.toLocaleString('zh-HK', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}
function lifeIntro() {
  replace('#lives-content', '<div class="card game-intro"><div><h1>兩種人生</h1><p>每次即刻食 2 粒，定係留低累積 5 粒？</p>' +
    '<p class="fine">快轉 30 年。每年揀即刻食 2 粒，或者留低累積 5 粒；4 秒內未揀就會儲起佢。揀好後，夠 1 秒就到下一年。</p>' +
    '<button class="button mint" id="life-start">開始快轉人生</button></div>' + icon('mallow', 'character bounce') + '</div>');
  $('#life-start').onclick = startLife;
}
function startLife() {
  replace('#lives-content', '<div class="game-heading"><h1>兩種人生</h1><span class="round-chip">第 <span id="life-year">1</span> / 30 年</span></div>' +
    '<div class="card"><div class="chart-wrap"><canvas id="life-chart" role="img" aria-label="兩種人生即時累積圖"></canvas></div>' +
    '<div class="life-choices"><button class="button milk" id="buy-tea">即刻享受 <span>拎 2 粒棉花糖</span></button><button class="button mint" id="save-year">延遲享受 <span>累積 5 粒棉花糖</span></button></div>' +
    '<p class="life-choice-status" id="life-status" role="status">呢一年，你點揀？</p><div class="progress"><span id="life-progress"></span></div></div>');
  active = { type: 'lives', rulesVersion: RULES_VERSION, year: 1, start: Date.now(), selected: null, choices: [], spent: 0, saved: 0, spending: [0], saving: [0] };
  const lifeChart = chart('life-chart', 'line', [0], [
    { label: '即刻享受', data: [0], borderColor: '#FF6B6B', backgroundColor: '#FF6B6B', borderWidth: 3, pointRadius: 0, tension: .2 },
    { label: '延遲累積', data: [0], borderColor: '#7FC8A9', backgroundColor: '#7FC8A9', borderWidth: 3, pointRadius: 0, tension: .2 },
  ]);
  function choose(save) {
    if (active?.type !== 'lives' || active.selected !== null) return;
    active.selected = save;
    $('#buy-tea').disabled = true;
    $('#save-year').disabled = true;
    $('#life-status').textContent = save ? '呢一年，留低 5 粒，畀將來慢慢累積。' : '呢一年，即刻食咗 2 粒，圖表已記低。';
    advance(Date.now());
  }
  function advance(now) {
    if (active?.type !== 'lives') return;
    const elapsed = now - active.start;
    if (active.selected === null && elapsed < 4000) return;
    if (elapsed < 1000) return;
    const saving = active.selected ?? true;
    active.choices.push(saving ? 1 : 0);
    if (!saving) active.spent += IMMEDIATE_REWARD;
    active.saved = annualValue(active.saved, saving);
    active.spending.push(active.spent);
    active.saving.push(Math.round(active.saved * 10) / 10);
    lifeChart.data.labels.push(active.year);
    lifeChart.data.datasets[0].data = active.spending.slice();
    lifeChart.data.datasets[1].data = active.saving.slice();
    lifeChart.update('none');
    $('#life-progress').style.width = active.year / 30 * 100 + '%';
    if (active.year === 30) { finishLife(); return; }
    active.year += 1;
    active.start = now;
    active.selected = null;
    $('#life-year').textContent = active.year;
    $('#buy-tea').disabled = false;
    $('#save-year').disabled = false;
    $('#life-status').textContent = '呢一年，你點揀？';
  }
  $('#buy-tea').onclick = () => choose(false);
  $('#save-year').onclick = () => choose(true);
  active.update = advance;
  clock(advance);
}
function finishLife() {
  if (active?.type !== 'lives') return;
  const run = active;
  active = null;
  stopClock();
  const data = lifeData();
  data.runs.push({ rulesVersion: RULES_VERSION, yearChoices: run.choices, coinsSpent: run.spent, coinsSaved: Math.round(run.saved * 10) / 10 });
  write(KEYS.lives, data);
  const percentile = waitingPercentile(run.choices.reduce((sum, c) => sum + c, 0), data.runs.filter((entry) => entry.rulesVersion === RULES_VERSION).map((entry) => entry.yearChoices.reduce((sum, c) => sum + c, 0)));
  currentCard = { module: '兩種人生', score: roundedValue(run.saved) + ' 粒棉花糖', detail: '儲咗 ' + run.choices.filter(Boolean).length + ' 年 · 食咗 ' + run.spent.toLocaleString('zh-HK') + ' 粒棉花糖', percentile, quote: '等候嘅累積效果，可以用數學計出嚟。' };
  replace('#lives-content', '<div class="card result-card bounce">' + confetti() + '<h2>30 年過咗，你嘅選擇變成咗條曲線。</h2>' +
    '<p class="big-number">' + roundedValue(run.saved) + ' 粒</p><p>你累積嘅棉花糖 · 模擬值</p>' +
    '<div class="chart-wrap"><canvas id="life-result-chart" role="img" aria-label="你嘅累積圖同全部儲起、全部即食嘅對照"></canvas></div>' +
    '<div class="truth"><p>每年延遲享受可累積 5 粒棉花糖，假設每年增長 7%：10 年約 ' + roundedValue(fullValue(10)) + ' 粒，20 年約 ' + roundedValue(fullValue(20)) + ' 粒，30 年約 ' + roundedValue(fullValue(30)) + ' 粒。</p>' +
    '<p>每年都即刻享受 2 粒，30 年合共食咗 60 粒棉花糖。</p></div>' +
    '<p class="fine">諗唔掂就先儲起佢。將等候設做預設選項，可以幫將來嘅自己留低多個選擇。</p></div>' +
    whyCard('等候嘅累積效果，可以用數學計出嚟。', [11], ASSUMPTION) +
    '<div class="actions"><button class="button" data-share="lives">整張成績卡</button><button class="button secondary" id="life-retry">再玩一次快轉人生</button><button class="button secondary" data-screen="home">返主頁</button></div>');
  const years = Array.from({ length: 31 }, (_, year) => year);
  chart('life-result-chart', 'line', years, [
    { label: '你嘅延遲累積', data: run.saving, borderColor: '#7FC8A9', borderWidth: 3, pointRadius: 0 },
    { label: '你嘅即刻享受', data: run.spending, borderColor: '#FF6B6B', borderWidth: 3, pointRadius: 0 },
    { label: '全部儲起嘅對照', data: years.map(fullValue), borderColor: '#5B8DEF', borderDash: [5, 5], pointRadius: 0 },
    { label: '全部即食嘅對照', data: years.map((year) => IMMEDIATE_REWARD * year), borderColor: '#E8A75D', borderDash: [5, 5], pointRadius: 0 },
  ]);
  $('#life-retry').onclick = lifeIntro;
}

function trustIntro() {
  replace('#trust-content', '<div class="card game-intro"><div><h1>信任實驗</h1><p>呢個係行為實驗嘅互動重演，獎勵係虛擬棉花糖，唔會有真實損失。實驗做完，我哋會同你解釋清楚。</p>' +
    '<button class="button" id="trust-start">開始實驗</button></div>' + icon('mallow', 'character bounce') + '</div>');
  $('#trust-start').onclick = startTask;
}
function startTask() {
  const data = trustData();
  const index = data.samples.length;
  const group = Math.random() < .5 ? 'reliable' : 'unreliable';
  data.samples.push({ group, rulesVersion: RULES_VERSION, duration: TRUST_WAIT_SECONDS, taskDone: false, waitSec: 0 });
  write(KEYS.trust, data);
  replace('#trust-content', '<div class="game-heading"><h1>搵齊 3 粒棉花糖</h1><span class="round-chip"><span id="task-time">15</span> 秒</span></div>' +
    '<div class="card"><p>撳中棉花糖，佢就會換個位。<strong><span id="task-count">0</span> / 3</strong></p><div class="task-field" id="task-field"><button class="catch-candy" id="catch" aria-label="收集棉花糖">' + icon('mallow', 'catch-mallow') + '</button></div></div>');
  active = { type: 'trust', phase: 'task', index, group, start: Date.now(), count: 0, taskDone: false };
  function moveCandy() {
    const field = $('#task-field');
    $('#catch').style.left = Math.random() * Math.max(0, field.clientWidth - 65) + 'px';
    $('#catch').style.top = Math.random() * Math.max(0, field.clientHeight - 65) + 'px';
  }
  moveCandy();
  $('#catch').onclick = () => {
    if (active?.phase !== 'task') return;
    active.count += 1;
    $('#task-count').textContent = active.count;
    if (active.count === 3) {
      active.taskDone = true;
      const samples = trustData();
      samples.samples[index].taskDone = true;
      write(KEYS.trust, samples);
      taskReward();
    } else moveCandy();
  };
  const update = (now) => {
    if (active?.phase !== 'task') return;
    const remaining = 15 - (now - active.start) / 1000;
    $('#task-time').textContent = Math.max(0, Math.ceil(remaining));
    if (remaining <= 0) {
      replace('#trust-content', '<div class="card"><h2>小任務夠鐘喇</h2><p>再試吓，撳中 3 粒棉花糖。</p><button class="button" id="task-retry">再試小任務</button><div class="actions"><button class="button secondary" id="task-exit">結束實驗，睇返解說</button></div></div>');
      stopClock();
      $('#task-retry').onclick = () => { active = null; startTask(); };
      $('#task-exit').onclick = () => finishTrust(true);
    }
  };
  active.update = update;
  clock(update);
}
function taskReward() {
  stopClock();
  active.phase = 'reward';
  active.update = null;
  const reliable = active.group === 'reliable';
  replace('#trust-content', '<div class="card result-card"><h2>任務完成！2 粒棉花糖就快送到…</h2><p id="task-reward-message"></p></div>');
  later = setTimeout(() => {
    if (active?.phase !== 'reward') return;
    $('#task-reward-message').textContent = reliable ? '2 粒棉花糖到手喇 ✅' : '⚠️ 系統派唔到獎勵，等陣再試…';
    if (reliable) {
      $('#task-reward-message').insertAdjacentHTML('afterend', confetti());
      addTrustContinue();
    } else {
      later = setTimeout(() => {
        if (active?.phase !== 'reward') return;
        $('#task-reward-message').textContent = '唔好意思，暫時派唔到棉花糖';
        addTrustContinue();
      }, 2000);
    }
  }, 800);
}
function addTrustContinue() {
  $('#task-reward-message').insertAdjacentHTML('afterend', '<div class="actions"><button class="button" id="trust-wait-start">開始 25 秒等候挑戰</button></div>');
  $('#trust-wait-start').onclick = startTrustWait;
}
function startTrustWait() {
  const old = active;
  replace('#trust-content', arena('信任實驗 · 等候挑戰', REWARDS[0], null, '', TRUST_WAIT_SECONDS, true));
  active = { ...old, phase: 'waiting', start: Date.now(), strategy: null, duration: TRUST_WAIT_SECONDS };
  $('#tempt-button').onclick = () => finishTrust(false);
  $('#abandon').onclick = () => finishTrust(true);
  runWaiting(() => finishTrust(false));
}
function finishTrust(giveup) {
  if (active?.type !== 'trust') return;
  const run = active;
  const waitSec = run.phase !== 'waiting' || giveup ? 0 : Math.min(run.duration, Math.round((Date.now() - run.start) / 100) / 10);
  stopClock();
  active = null;
  const data = trustData();
  data.samples[run.index] = { group: run.group, rulesVersion: RULES_VERSION, duration: TRUST_WAIT_SECONDS, taskDone: run.taskDone, waitSec };
  write(KEYS.trust, data);
  const completedWait = run.phase === 'waiting' && !giveup && Date.now() - run.start >= run.duration * 1000;
  const coins = (run.taskDone && run.group === 'reliable' ? TASK_REWARD : 0) + (run.phase === 'waiting' && !giveup ? completedWait ? REWARDS[0] : IMMEDIATE_REWARD : 0);
  const percentile = waitingPercentile(waitSec, data.samples.filter((sample) => sample.rulesVersion === RULES_VERSION).map((sample) => sample.waitSec));
  currentCard = { module: '信任實驗', score: waitSec.toFixed(1) + ' 秒', detail: (run.group === 'reliable' ? '可信組' : '唔可信組') + ' · ' + coins + ' 粒棉花糖', percentile, quote: '環境安全、承諾信得過，等落先安心。' };
  renderTrustDebrief(run.group);
}
function renderTrustDebrief(group) {
  const data = trustData();
  const samples = data.samples.filter((sample) => sample.rulesVersion === RULES_VERSION);
  replace('#trust-content', '<article class="card disclosure result-card bounce"><h2>頭先，我哋重演咗一個 2013 年嘅著名實驗。</h2>' +
    '<p>2013 年，研究者先畀小朋友經歷一次「承諾落空」，再做棉花糖任務。結果，遇過食言嘅小朋友平均只等咗 3 分 02 秒，承諾有兌現嗰組就等咗 12 分 02 秒（p &lt; 0.0005）；等足 15 分鐘嘅比例係 1/14 對 9/14。</p>' +
    '<p>' + (group === 'reliable' ? '你頭先喺「可信組」。睇吓下面，信任有冇令等候時間長咗？' : '你頭先喺「唔可信組」。記住頭先等緊嗰陣嘅感覺。') + '</p>' +
    '<div class="chart-wrap tall"><canvas id="trust-chart" role="img" aria-label="網站兩組嘅平均等候秒數同論文對照線"></canvas></div>' +
    (samples.length < 2 ? '<p class="data-note">仲收集緊數據，叫埋朋友一齊玩啦</p>' : '') +
    '<p class="fine">呢度比較兩組嘅平均等候秒數，只計呢部機嘅短挑戰紀錄；呢度等候上限係 25 秒，論文原本嘅任務上限係 900 秒。</p>' +
    '<p class="data-note">Kidd et al. 2013 原文數據 · 唔可信組 181.57 秒 · 可信組 722.43 秒</p>' +
    '<p><strong>當承諾信唔過，小朋友等落就冇咁安心。你每次肯等，都幫我哋理解信任點樣影響選擇。</strong></p></article>' +
    whyCard('環境夠安全、將來有預算、試錯成本負擔得起，等候先係合理嘅選擇。', [0]) +
    '<div class="actions"><button class="button" data-share="trust">整張成績卡</button><button class="button secondary" id="trust-retry">再做一次實驗</button><button class="button secondary" data-screen="home">返主頁</button></div>');
  const mean = (key) => {
    const groupSamples = samples.filter((entry) => entry.group === key);
    return groupSamples.length ? groupSamples.reduce((sum, entry) => sum + entry.waitSec, 0) / groupSamples.length : null;
  };
  const references = {
    id: 'paper-references',
    afterDraw(instance) {
      const { ctx, chartArea, scales } = instance;
      ctx.save();
      ctx.strokeStyle = 'rgba(45,42,38,.5)';
      ctx.fillStyle = '#2D2A26';
      ctx.font = '11px sans-serif';
      ctx.setLineDash([5, 5]);
      [[181.57, '181.57 秒'], [722.43, '722.43 秒']].forEach(([value, label]) => {
        const y = scales.y.getPixelForValue(value);
        ctx.beginPath(); ctx.moveTo(chartArea.left, y); ctx.lineTo(chartArea.right, y); ctx.stroke();
        ctx.fillText(label, chartArea.left + 4, y - 5);
      });
      ctx.restore();
    },
  };
  chart('trust-chart', 'bar', ['可信組', '唔可信組'], [{ label: '本機平均等候秒數', data: samples.length < 2 ? [null, null] : [mean('reliable'), mean('unreliable')], backgroundColor: ['#7FC8A9', '#FF6B6B'], borderColor: '#2D2A26', borderWidth: 2, borderRadius: 8 }], { scales: { y: { min: 0, max: 800, title: { display: true, text: '秒' } }, x: { grid: { display: false } } } }, [references]);
  $('#trust-retry').onclick = trustIntro;
}

function renderBoard() {
  const groups = roundGroups(sprintData().rounds);
  const entries = groups.map((rounds) => ({
    coins: rounds.reduce((sum, round) => sum + (round.success ? REWARDS[round.round - 1] : IMMEDIATE_REWARD), 0),
    longest: Math.max(...rounds.map((round) => round.waitSec)),
  })).sort((a, b) => b.coins - a.coins || b.longest - a.longest).slice(0, 10);
  $('#board-content').innerHTML = entries.length
    ? '<ol class="board-list">' + entries.map((entry, index) => '<li class="card"><div><strong>' + (index + 1) + '. ' + nick + '</strong><span class="fine">最長一個回合等咗 ' + entry.longest.toFixed(1) + ' 秒</span></div><strong>' + entry.coins + ' 粒棉花糖</strong></li>').join('') + '</ol>'
    : '<p class="card">仲未有完成嘅挑戰。玩齊三個回合，留低第一條等候紀錄啦。</p>';
}

function escapeHTML(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
$('#source-list').innerHTML = SOURCES.map((source) => '<li>' + escapeHTML(source).replace(/https?:\/\/[^\s｜]+/g,
  (url) => '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>') + '</li>').join('');
function makeQR(target, size) {
  target.replaceChildren();
  return new QRCode(target, { text: location.href.split('#')[0], width: size, height: size, colorDark: '#2D2A26', colorLight: '#FFFFFF', correctLevel: QRCode.CorrectLevel.M });
}
makeQR($('#home-qr'), 64);

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  let line = '';
  let row = y;
  for (const letter of text) {
    if (context.measureText(line + letter).width > maxWidth && line) {
      context.fillText(line, x, row);
      row += lineHeight;
      line = letter;
    } else line += letter;
  }
  if (line) context.fillText(line, x, row);
  return row + lineHeight;
}
async function generateCard() {
  if (!currentCard) return;
  const canvas = $('#result-canvas');
  const context = canvas.getContext('2d');
  const family = '"PingFang HK","PingFang TC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif';
  context.fillStyle = '#FAF3E7'; context.fillRect(0, 0, 750, 1334);
  context.fillStyle = '#FFFFFF'; context.strokeStyle = '#2D2A26'; context.lineWidth = 5;
  context.beginPath(); context.roundRect(35, 35, 680, 1264, 32); context.fill(); context.stroke();
  context.fillStyle = '#2D2A26'; context.font = '800 39px ' + family;
  context.fillText('棉花糖實驗室', 76, 112);
  context.font = '400 23px ' + family; context.fillText('Marshmallow Lab', 76, 150);
  context.font = '800 36px ' + family; context.fillText(currentCard.module, 76, 248);
  context.font = '800 58px ' + family; wrapText(context, currentCard.score, 76, 335, 595, 76);
  context.font = '400 27px ' + family; wrapText(context, currentCard.detail, 76, 442, 595, 42);
  context.fillStyle = '#7FC8A9'; context.beginPath(); context.roundRect(72, 534, 602, 88, 18); context.fill();
  context.fillStyle = '#2D2A26'; context.font = '700 28px ' + family;
  context.fillText('超過呢部機 ' + currentCard.percentile + '% 嘅完成紀錄', 96, 589);
  context.font = '800 36px ' + family; wrapText(context, currentCard.quote, 76, 718, 590, 56);
  context.font = '400 22px ' + family; wrapText(context, '環境信得過、將來有預算，等候就值得練習。', 76, 902, 585, 35);

  const symbol = $('#mallow');
  const svgSource = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">' + symbol.innerHTML + '</svg>';
  const svgURL = URL.createObjectURL(new Blob([svgSource], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = svgURL; });
    context.drawImage(image, 65, 970, 210, 230);
  } finally { URL.revokeObjectURL(svgURL); }
  makeQR($('#qr-buffer'), 164);
  context.fillStyle = '#FFFFFF'; context.fillRect(478, 990, 186, 186);
  context.drawImage($('#qr-buffer canvas'), 489, 1001, 164, 164);
  context.fillStyle = '#2D2A26'; context.font = '400 22px ' + family; context.fillText('掃碼再嚟挑戰', 479, 1210);
  context.font = '400 21px ' + family; context.fillText(nick, 76, 1248);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) { toast('整唔到圖片，再試一次吖。'); return; }
  if (shareURL) URL.revokeObjectURL(shareURL);
  shareURL = URL.createObjectURL(blob);
  $('#result-image').src = shareURL;
  $('#download-card').href = shareURL;
  $('#card-dialog').showModal();
}
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-share]')) generateCard().catch(() => toast('整唔到圖片，再試一次吖。'));
});
$('.close-dialog').onclick = () => $('#card-dialog').close();
window.addEventListener('pagehide', () => {
  // 挑战开始时已写入零秒放弃标记，页面被关闭也不会遗留成功记录。
  stopClock();
});
