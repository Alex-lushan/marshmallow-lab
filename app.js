'use strict';

const SOURCES = [
  "Kidd, Palmeri & Aslin (2013). \"Rational snacking: Young children's decision-making on the marshmallow task is moderated by beliefs about environmental reliability.\" Cognition, 126(1), 109–114. doi:10.1016/j.cognition.2012.08.004. 免费全文：https://pmc.ncbi.nlm.nih.gov/articles/PMC3730121/ ｜ 关键数字：不可信组平均等待 3 分 02 秒 vs 可信组 12 分 02 秒（p < 0.0005）；撑满 15 分钟比例 1/14 vs 9/14。",
  "Watts, Duncan & Quan (2018). Psychological Science, 29(7), 1159–1177. doi:10.1177/0956797618761661. 免费全文：https://europepmc.org/articles/PMC6050075 ｜ 关键数字：等待与 15 岁成就的相关约为原研究一半；控制家庭背景、早期认知、家庭环境后再减少三分之二；大部分差异来自能否坚持至少 20 秒。",
  "Shoda, Mischel & Peake (1990). \"Predicting adolescent cognitive and self-regulatory competencies from preschool delay of gratification.\" Developmental Psychology, 26(6), 978–986. ｜ 关键数字：等待更久的孩子 SAT 总分平均高约 210 分。",
  "Mischel & Ebbesen (1970). \"Attention in delay of gratification.\" Journal of Personality and Social Psychology, 16(2), 329–337. ｜ 要点：看不见奖励/转移注意力的孩子等待时间大幅延长。",
  "Bandura & Mischel (1965). \"Modification of self-imposed delay of reward through exposure to live and symbolic models.\" Journal of Personality and Social Psychology, 31(4), 698–705. ｜ 要点：榜样示范使孩子转向延迟奖励。",
  "Metcalfe & Mischel (1999). \"A hot/cool-system analysis of delay of gratification.\" Psychological Review, 106(1), 3–19. doi:10.1037/0033-295X.106.1.3 ｜ 要点：冷/热系统；「把棉花糖想象成云朵」可降低诱惑热度。",
  "Gollwitzer (1999). \"Implementation intentions: Strong effects of simple plans.\" American Psychologist, 54(7), 493–503. ｜ 要点：「如果—那么」执行意图。",
  "Moffitt et al. (2011). \"A gradient of childhood self-control predicts health, wealth, and public safety.\" PNAS, 108(7), 2693–2698. doi:10.1073/pnas.1010076108. 免费全文：https://pmc.ncbi.nlm.nih.gov/articles/PMC3041102/ ｜ 要点：达尼丁千人队列；控制 IQ 与家庭社会阶层后梯度效应仍成立。",
  "Schlam et al. (2013). \"Preschoolers' delay of gratification predicts their body mass 30 years later.\" Journal of Pediatrics, 162(1), 90–93. doi:10.1016/j.jpeds.2012.06.049 ｜ 关键数字：每多等 1 分钟，30 年后 BMI 低约 0.2。",
  "Haushofer & Fehr (2014). \"On the psychology of poverty.\" Science, 344(6186), 862–867. doi:10.1126/science.1232491 ｜ 要点：贫困与不确定性增强现时偏好——未来不可靠时，等待不理性。",
  "Schultz, Dayan & Montague (1997). \"A neural substrate of prediction and reward.\" Science, 275(5306), 1593–1599. ｜ 要点：多巴胺奖赏预测误差——即时奖赏的神经机制。",
  "Ainslie (1975). \"Specious reward: A behavioral theory of impulsiveness and impulse control.\" Psychological Bulletin, 82(4), 463–496.；Laibson (1997). \"Golden eggs and hyperbolic discounting.\" Quarterly Journal of Economics, 112(2), 443–477. ｜ 要点：双曲贴现——人对近期的收益与损失看得过重。",
  "艺术风格参考：Tim Urban, \"Why Procrastinators Procrastinate\"（Wait But Why, 2013）：https://waitbutwhy.com/2013/10/why-procrastinators-procrastinate.html 及其 TED 演讲 https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator ｜ 仅作风格致敬，角色必须原创。中文科普补充：https://iepsy.com/article/247"
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
const sprintData = () => read(KEYS.sprint, { totalCoins: 0, rounds: [], percentile: null });
const trustData = () => read(KEYS.trust, { samples: [] });
const lifeData = () => read(KEYS.lives, { runs: [] });
const boardData = () => read(KEYS.board, { totalWaiters: 0, totalSprintSec: [] });
const REWARDS = [200, 260, 300];
const STRATEGIES = [
  { name: '藏起来', description: '遮住诱惑，让奖励离开视线。', why: '让诱惑离开视线，等待就容易一些。', source: 3 },
  { name: '转移注意力', description: '和泡泡玩一会儿，让注意力换个地方。', why: '把注意力转移到别处，可以帮助延长等待。', source: 3 },
  { name: '换个想法', description: '把糖果想成一朵云，给热冲动降温。', why: '用冷静的想象，降低诱惑的热度。', source: 5 },
  { name: '如果—那么计划', description: '提前约好：冲动来了，我就这样做。', why: '提前写好行动计划，让应对冲动更容易。', source: 6 },
];
const TEMPTATIONS = [
  '现在点，立刻到手！', '别人都点了，就你在等～', '等这么久，太累了吧？',
  '60糖果币也是糖果呀！', '你确定以后真的会来更多？', '（急急猴摇尾巴）快～点～嘛～',
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
      color: '#2D2A26', font: { family: '"PingFang SC","Microsoft YaHei",sans-serif', size: 13 },
      plugins: { legend: { labels: { boxWidth: 12, padding: 14 } } },
      scales: { y: { beginAtZero: true, ticks: { maxTicksLimit: 6 } }, x: { grid: { display: false } } },
      ...options,
    }, plugins,
  });
  charts.set(id, instance);
  return instance;
}
function whyCard(conclusion, indexes, assumption = '') {
  return '<article class="card why-card"><h2>为什么？——科学这样说</h2><p>' + conclusion + '</p>' +
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
    toast('实验结束后，我们会完整解释一切。');
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
    if (active) timer = requestAnimationFrame(tick);
  }
  tick();
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && active?.update) active.update(Date.now());
});

function roundGroups(rounds) {
  const groups = [];
  let group = [];
  rounds.forEach((round) => {
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
  const rounds = sprintData().rounds;
  if (!rounds.length || (rounds.at(-1).round === 3 && !rounds.at(-1).giveup)) return { round: 1, strategy: null };
  const last = rounds.at(-1);
  return { round: last.giveup ? last.round : last.round + 1, strategy: last.strategy };
}
function sprintIntro() {
  const progress = sprintProgress();
  const name = ['裸考', '装备策略', '承诺局'][progress.round - 1];
  const newGame = progress.round === 1;
  replace('#sprint-content', '<div class="game-heading"><h1>60秒挑战</h1><span class="round-chip">第 ' + progress.round + ' / 3 回合</span></div>' +
    '<div class="card game-intro"><div><h2>' + name + '</h2><p>忍满 60 秒，得到 ' + REWARDS[progress.round - 1] +
    ' 糖果币。中途点击，拿到保底 60 糖果币。</p>' +
    (newGame ? '<p class="fine">三回合，从冲动到策略，再到可信的承诺。</p>' : '') +
    '<button class="button" id="sprint-start">开始这一回合</button></div>' + icon('mallow', 'character bounce') + '</div>');
  $('#sprint-start').onclick = () => progress.round === 2 ? pickStrategy() : startSprint(progress.round, null);
}
function pickStrategy() {
  replace('#sprint-content', '<div class="page-intro"><h1>给等待，配一件装备。</h1><p>第 2 / 3 回合 · 选择一张策略卡，立即改变玩法。</p></div>' +
    '<div class="strategy-grid">' + STRATEGIES.map((strategy, index) =>
      '<button class="strategy" data-strategy="' + index + '"><strong>' + strategy.name + '</strong><small>' + strategy.description + '</small></button>').join('') + '</div>');
  document.querySelectorAll('[data-strategy]').forEach((button) => {
    button.onclick = () => {
      const strategy = Number(button.dataset.strategy);
      if (strategy === 3) {
        replace('#sprint-content', '<div class="card"><h1>如果—那么计划</h1><label for="plan">先选一句计划</label>' +
          '<select class="plan-select" id="plan"><option>如果我非常想点，那么我就深呼吸 3 次</option><option>如果我非常想点，那么我就把视线移开</option></select>' +
          '<button class="button" id="plan-start">带着计划开始</button></div>');
        $('#plan-start').onclick = () => startSprint(2, strategy, $('#plan').value);
      } else startSprint(2, strategy);
    };
  });
}
function arena(title, reward, strategy, plan, isTrust = false) {
  const cloud = strategy === 2;
  return '<div class="game-heading"><h1>' + title + '</h1><span class="round-chip">成功奖励 ' + reward + ' 🍬</span></div>' +
    (reward === 300 ? '<div class="promise">本局成功奖励 ×3</div>' : '') +
    '<div class="card game-arena"><div class="countdown" role="timer"><span id="remaining">60</span><small> 秒</small></div>' +
    '<div class="challenge-stage"><div class="reward-slot">' +
    '<button class="reward-button glow" id="tempt-button"' + (strategy === 0 ? ' disabled tabindex="-1" aria-hidden="true"' : '') + '><span class="candy">' +
    (cloud ? '☁️' : '🍬') + '</span><span>' + (cloud ? '一朵云' : '现在领取') + '</span><small>60 糖果币</small></button>' +
    (strategy === 0 ? '<div class="cover">' + icon('mallow') + '</div>' : '') +
    '</div><div class="monkey-temptation">' + icon('monkey', 'wiggle') + '<p class="temptation" id="temptation">' + TEMPTATIONS[0] + '</p></div></div>' +
    (cloud ? '<p>它只是一团空气</p>' : '') +
    '<div class="progress" aria-hidden="true"><span id="wait-progress"></span></div>' +
    '<p class="cheer bounce" id="cheer" hidden>' + icon('mallow', '') + '坚持住！棉花糖君给你打气 🎈</p>' +
    (strategy === 1 ? '<p>泡泡按按乐 · <span id="pop-count">0</span></p><div class="bubbles">' + Array.from({length: 8}, (_, i) => '<button aria-label="按破泡泡 ' + (i + 1) + '"></button>').join('') + '</div>' : '') +
    (plan ? '<p class="fine">' + plan + '</p><div class="breath" id="breath" hidden><span id="breath-label"></span><div class="progress"><span id="breath-progress"></span></div></div>' : '') +
    '</div><div class="actions"><button class="button secondary" id="abandon">' + (isTrust ? '结束并查看解释' : '放弃本回合') + '</button></div>';
}
function startSprint(round, strategy, plan = '') {
  const data = sprintData();
  if (data.rounds.at(-1)?.giveup && data.rounds.at(-1).round === round) data.rounds.pop();
  const index = data.rounds.length;
  data.rounds.push({ round, waitSec: 0, success: false, giveup: true, strategy: strategy === null ? null : STRATEGIES[strategy].name });
  write(KEYS.sprint, data);
  replace('#sprint-content', arena('第 ' + round + ' 回合 · ' + ['裸考', '装备策略', '承诺局'][round - 1], REWARDS[round - 1], strategy, plan));
  active = { type: 'sprint', start: Date.now(), round, strategy, index, reward: REWARDS[round - 1] };
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
  $('#remaining').textContent = Math.ceil(Math.max(0, 60 - elapsed));
  $('#wait-progress').style.width = Math.min(100, elapsed / 60 * 100) + '%';
  $('#temptation').textContent = TEMPTATIONS[Math.floor(elapsed / 8) % TEMPTATIONS.length];
  $('#tempt-button').style.setProperty('--tempt-scale', 1 + Math.min(2, Math.floor(elapsed / 20)) * .04);
  $('#cheer').hidden = elapsed < 50;
  if (active.strategy === 3 && elapsed >= 15) {
    const container = $('#breath');
    container.hidden = false;
    container.innerHTML = [15, 30, 45].map((begin) => {
      const passed = elapsed - begin;
      if (passed < 0 || passed >= 19) return '';
      const label = passed < 4 ? '吸气 · 4 秒' : passed < 11 ? '屏息 · 7 秒' : '呼气 · 8 秒';
      return '<div>' + label + '<div class="progress"><span style="width:' + Math.min(100, passed / 19 * 100) + '%"></span></div></div>';
    }).join('');
    container.hidden = container.innerHTML === '';
  }
}
function runWaiting(onSuccess) {
  const update = (now) => {
    if (!active) return;
    const elapsed = Math.min(60, Math.max(0, (now - active.start) / 1000));
    updateArena(elapsed);
    if (elapsed >= 60) onSuccess();
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
  const { index, round, strategy, start } = active;
  const waitSec = success ? 60 : Math.min(60, Math.round((Date.now() - start) / 100) / 10);
  if (waitSec >= 60) success = true;
  const data = sprintData();
  const coins = success ? REWARDS[round - 1] : 60;
  data.rounds[index] = { round, waitSec, success, giveup: false, strategy: strategy === null ? null : STRATEGIES[strategy].name };
  data.totalCoins += coins;
  active = null;
  stopClock();
  if (round === 3) {
    const group = data.rounds.slice(-3);
    const total = group.reduce((sum, entry) => sum + entry.waitSec, 0);
    const board = boardData();
    board.totalSprintSec.push(total);
    board.totalWaiters = board.totalSprintSec.length;
    data.percentile = waitingPercentile(total, board.totalSprintSec);
    write(KEYS.board, board);
  }
  write(KEYS.sprint, data);
  const source = round === 2 ? STRATEGIES[strategy].source : round === 3 ? 0 : 11;
  const conclusion = round === 2 ? STRATEGIES[strategy].why : round === 3 ? '安全可信、未来可预期时，等待才有坚实的基础。' : '人会格外看重眼前奖励；等待可以借助策略来训练。';
  let settlement = '<div class="card result-card bounce">' + (success ? confetti() : '') +
    '<h2>' + (success ? '等到了，如约兑现。' : '这一回合，先收好保底。') + '</h2><p class="big-number">' + coins + ' 🍬</p><p>等待 ' + waitSec.toFixed(1) + ' 秒</p></div>';
  if (round === 3) settlement = sprintSettlement(data);
  replace('#sprint-content', settlement + whyCard(conclusion, [source]) +
    '<div class="actions">' + (round < 3 ? '<button class="button" id="next-round">下一回合</button>' : '<button class="button" data-share="sprint">生成结果卡</button>') +
    '<button class="button secondary" data-screen="home">返回首页</button></div>');
  if (round < 3) $('#next-round').onclick = sprintIntro;
  if (round === 3) {
    const group = data.rounds.slice(-3);
    chart('sprint-chart', 'bar', ['裸考', '装备策略', '承诺局'], [{ label: '等待秒数', data: group.map((r) => r.waitSec), backgroundColor: ['#E8A75D', '#7FC8A9', '#5B8DEF'], borderColor: '#2D2A26', borderWidth: 2, borderRadius: 7 }], { scales: { y: { beginAtZero: true, max: 60 }, x: { grid: { display: false } } } });
  }
}
function sprintSettlement(data) {
  const group = data.rounds.slice(-3);
  const wins = group.filter((r) => r.success).length;
  const coins = group.reduce((sum, r) => sum + (r.success ? REWARDS[r.round - 1] : 60), 0);
  const message = wins === 3 ? '你把训练法用成了本能。🎉' : !group[0].success && group.slice(1).some((r) => r.success) ? '看，等待是可以学会的。' : '给等待一个策略，也给承诺一个可信的环境。';
  currentCard = { module: '60秒挑战', score: coins + ' 糖果币', detail: '三回合等待 ' + group.map((r) => r.waitSec.toFixed(1)).join(' / ') + ' 秒', percentile: data.percentile, quote: message };
  return '<div class="card result-card bounce">' + (wins ? confetti() : '') + '<h2>' + message + '</h2>' +
    '<div class="result-stats"><div>总糖果币<strong>' + coins + ' 🍬</strong></div><div>三回合成功率<strong>' + Math.round(wins / 3 * 100) + '%</strong></div></div>' +
    '<p>你比全场 ' + data.percentile + '% 的人更会等待</p><p class="fine">比较范围为本机累计完成者。</p><div class="chart-wrap"><canvas id="sprint-chart" aria-label="三回合等待柱状图" role="img"></canvas></div></div>';
}

const ASSUMPTION = '假设：月投 450（≈每日 15），年化 7%（长期指数基金的历史平均参考），按月复利，未计通胀与税费。';
function annualValue(balance, save) {
  const rate = .07 / 12;
  return balance * Math.pow(1 + rate, 12) + (save ? 450 * (Math.pow(1 + rate, 12) - 1) / rate : 0);
}
function fullValue(years) {
  const rate = .07 / 12;
  return 450 * (Math.pow(1 + rate, 12 * years) - 1) / rate;
}
function roundedValue(number) {
  return (Math.round(number / 100) * 100).toLocaleString('en-US');
}
function lifeIntro() {
  replace('#lives-content', '<div class="card game-intro"><div><h1>两种人生</h1><p>每天一杯奶茶，还是每天一点积累？</p>' +
    '<p class="fine">快进 30 年。每年选择买奶茶或存起来；4 秒内未选，默认存起来。选好后，满 1 秒进入下一年。</p>' +
    '<button class="button mint" id="life-start">开始快进人生</button></div>' + icon('mallow', 'character bounce') + '</div>');
  $('#life-start').onclick = startLife;
}
function startLife() {
  replace('#lives-content', '<div class="game-heading"><h1>两种人生</h1><span class="round-chip">第 <span id="life-year">1</span> / 30 年</span></div>' +
    '<div class="card"><div class="chart-wrap"><canvas id="life-chart" role="img" aria-label="两种人生实时曲线"></canvas></div>' +
    '<div class="life-choices"><button class="button milk" id="buy-tea">买奶茶 <span>-15 糖果币</span></button><button class="button mint" id="save-year">存起来 <span>+15 糖果币</span></button></div>' +
    '<p class="life-choice-status" id="life-status" role="status">这一年，你怎么选？</p><div class="progress"><span id="life-progress"></span></div></div>');
  active = { type: 'lives', year: 1, start: Date.now(), selected: null, choices: [], spent: 0, saved: 0, spending: [0], saving: [0] };
  const lifeChart = chart('life-chart', 'line', [0], [
    { label: '奶茶人生', data: [0], borderColor: '#FF6B6B', backgroundColor: '#FF6B6B', borderWidth: 3, pointRadius: 0, tension: .2 },
    { label: '复利人生', data: [0], borderColor: '#7FC8A9', backgroundColor: '#7FC8A9', borderWidth: 3, pointRadius: 0, tension: .2 },
  ]);
  function choose(save) {
    if (active?.type !== 'lives' || active.selected !== null) return;
    active.selected = save;
    $('#buy-tea').disabled = true;
    $('#save-year').disabled = true;
    $('#life-status').textContent = save ? '这一年，为未来留下一点积累。' : '这一年的奶茶花费已记入曲线。';
    advance(Date.now());
  }
  function advance(now) {
    if (active?.type !== 'lives') return;
    const elapsed = now - active.start;
    if (active.selected === null && elapsed < 4000) return;
    if (elapsed < 1000) return;
    const saving = active.selected ?? true;
    active.choices.push(saving ? 1 : 0);
    if (!saving) active.spent += 15 * 365;
    active.saved = annualValue(active.saved, saving);
    active.spending.push(active.spent);
    active.saving.push(Math.round(active.saved / 100) * 100);
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
    $('#life-status').textContent = '这一年，你怎么选？';
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
  data.runs.push({ yearChoices: run.choices, coinsSpent: run.spent, coinsSaved: Math.round(run.saved / 100) * 100 });
  write(KEYS.lives, data);
  const percentile = waitingPercentile(run.choices.reduce((sum, c) => sum + c, 0), data.runs.map((entry) => entry.yearChoices.reduce((sum, c) => sum + c, 0)));
  currentCard = { module: '两种人生', score: roundedValue(run.saved) + ' 糖果币', detail: '存下 ' + run.choices.filter(Boolean).length + ' 年 · 花掉 ' + run.spent.toLocaleString('en-US') + ' 糖果币', percentile, quote: '等待的收益不是感觉，是数学。' };
  replace('#lives-content', '<div class="card result-card bounce">' + confetti() + '<h2>30 年，选择长出了形状。</h2>' +
    '<p class="big-number">' + roundedValue(run.saved) + ' 🍬</p><p>你的累计积累 · 模拟值</p>' +
    '<div class="chart-wrap"><canvas id="life-result-chart" role="img" aria-label="玩家曲线及全存全花参考线"></canvas></div>' +
    '<div class="truth"><p>每天 15 糖果币（≈¥15），按年化 7% 复利：10 年 ≈ 78,000 糖果币；20 年 ≈ 230,000；30 年 ≈ 550,000。</p>' +
    '<p>而每天喝掉：30 年共花掉 ≈ 164,000 糖果币——两手空空。</p></div><p class="fine">曲线按月投入 450、月利率 0.07/12 计算，10 / 20 / 30 年终值分别为 77,900 / 234,400 / 549,000 糖果币；上方对照为近似值。</p>' +
    '<p class="fine">犹豫时默认延迟——把等待设为默认选项，是给未来的自己最便宜的保险。</p></div>' +
    whyCard('等待的收益不是感觉，是数学。', [11], ASSUMPTION) +
    '<div class="actions"><button class="button" data-share="lives">生成结果卡</button><button class="button secondary" id="life-retry">再快进一次</button><button class="button secondary" data-screen="home">返回首页</button></div>');
  const years = Array.from({ length: 31 }, (_, year) => year);
  chart('life-result-chart', 'line', years, [
    { label: '你的复利人生', data: run.saving, borderColor: '#7FC8A9', borderWidth: 3, pointRadius: 0 },
    { label: '你的奶茶人生', data: run.spending, borderColor: '#FF6B6B', borderWidth: 3, pointRadius: 0 },
    { label: '全存参考', data: years.map(fullValue), borderColor: '#5B8DEF', borderDash: [5, 5], pointRadius: 0 },
    { label: '全花参考', data: years.map((year) => 15 * year * 365), borderColor: '#E8A75D', borderDash: [5, 5], pointRadius: 0 },
  ]);
  $('#life-retry').onclick = lifeIntro;
}

function trustIntro() {
  replace('#trust-content', '<div class="card game-intro"><div><h1>信任实验</h1><p>这是一个行为实验的互动复刻：奖励为虚拟糖果币，无任何真实损失。实验结束后我们会完整解释一切。</p>' +
    '<button class="button" id="trust-start">开始实验</button></div>' + icon('mallow', 'character bounce') + '</div>');
  $('#trust-start').onclick = startTask;
}
function startTask() {
  const data = trustData();
  const index = data.samples.length;
  const group = Math.random() < .5 ? 'reliable' : 'unreliable';
  data.samples.push({ group, taskDone: false, waitSec: 0 });
  write(KEYS.trust, data);
  replace('#trust-content', '<div class="game-heading"><h1>收集 3 颗糖果</h1><span class="round-chip"><span id="task-time">15</span> 秒</span></div>' +
    '<div class="card"><p>点中糖果，它就会换个位置。<strong><span id="task-count">0</span> / 3</strong></p><div class="task-field" id="task-field"><button class="catch-candy" id="catch" aria-label="收集糖果">🍬</button></div></div>');
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
      replace('#trust-content', '<div class="card"><h2>小任务时间到了</h2><p>再试一次，点中 3 颗糖果。</p><button class="button" id="task-retry">重试小任务</button><div class="actions"><button class="button secondary" id="task-exit">结束并查看解释</button></div></div>');
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
  replace('#trust-content', '<div class="card result-card"><h2>任务完成！奖励 50 糖果币即将发放…</h2><p id="task-reward-message"></p></div>');
  later = setTimeout(() => {
    if (active?.phase !== 'reward') return;
    $('#task-reward-message').textContent = reliable ? '已到账 50 糖果币 ✅' : '⚠️ 系统发放失败，请稍后再试…';
    if (reliable) {
      $('#task-reward-message').insertAdjacentHTML('afterend', confetti());
      addTrustContinue();
    } else {
      later = setTimeout(() => {
        if (active?.phase !== 'reward') return;
        $('#task-reward-message').textContent = '很抱歉，奖励暂时无法发放';
        addTrustContinue();
      }, 2000);
    }
  }, 800);
}
function addTrustContinue() {
  $('#task-reward-message').insertAdjacentHTML('afterend', '<div class="actions"><button class="button" id="trust-wait-start">进入 60 秒挑战</button></div>');
  $('#trust-wait-start').onclick = startTrustWait;
}
function startTrustWait() {
  const old = active;
  replace('#trust-content', arena('信任实验 · 等待挑战', 100, null, '', true));
  active = { ...old, phase: 'waiting', start: Date.now(), strategy: null };
  $('#tempt-button').onclick = () => finishTrust(false);
  $('#abandon').onclick = () => finishTrust(true);
  runWaiting(() => finishTrust(false));
}
function finishTrust(giveup) {
  if (active?.type !== 'trust') return;
  const run = active;
  const waitSec = run.phase !== 'waiting' || giveup ? 0 : Math.min(60, Math.round((Date.now() - run.start) / 100) / 10);
  stopClock();
  active = null;
  const data = trustData();
  data.samples[run.index] = { group: run.group, taskDone: run.taskDone, waitSec };
  write(KEYS.trust, data);
  const coins = (run.taskDone && run.group === 'reliable' ? 50 : 0) + (run.phase === 'waiting' && !giveup ? waitSec >= 60 ? 100 : 60 : 0);
  const percentile = waitingPercentile(waitSec, data.samples.map((sample) => sample.waitSec));
  currentCard = { module: '信任实验', score: waitSec.toFixed(1) + ' 秒', detail: (run.group === 'reliable' ? '可信组' : '不可信组') + ' · ' + coins + ' 糖果币', percentile, quote: '环境安全可信，等待才有坚实的基础。' };
  renderTrustDebrief(run.group);
}
function renderTrustDebrief(group) {
  const data = trustData();
  replace('#trust-content', '<article class="card disclosure result-card bounce"><h2>刚才，我们复刻了一个 2013 年的著名实验。</h2>' +
    '<p>2013 年，研究者先让孩子们经历一次「承诺落空」，再测试棉花糖任务。结果：经历过食言的孩子平均只等 3 分 02 秒，而信守承诺组等了 12 分 02 秒（p &lt; 0.0005）；坚持满 15 分钟的比例是 1/14 对 9/14。</p>' +
    '<p>' + (group === 'reliable' ? '你刚才在「可信组」。看看下面：信任是否让等待变长了？' : '你刚才在「不可信组」——记住刚才等待时心里的感觉。') + '</p>' +
    '<div class="chart-wrap tall"><canvas id="trust-chart" role="img" aria-label="本网站可信组 vs 不可信组平均等待秒数及论文参考线"></canvas></div>' +
    (data.samples.length < 2 ? '<p class="data-note">数据收集中，先邀请朋友来玩吧</p>' : '') +
    '<p class="fine">本网站可信组 vs 不可信组平均等待秒数。本机累计样本，不同设备不共享；本挑战上限 60 秒，论文任务上限 900 秒。</p>' +
    '<p class="data-note">Kidd et al. 2013 原文数据 · 不可信组 181.57 秒 · 可信组 722.43 秒</p>' +
    '<p><strong>孩子不是等不了，是不信承诺会兑现。你的每一次等待，都在为这句话投票。</strong></p></article>' +
    whyCard('环境安全可信、未来可预期、失败成本可承受时，等待才是理性的。', [0]) +
    '<div class="actions"><button class="button" data-share="trust">生成结果卡</button><button class="button secondary" id="trust-retry">再做一次实验</button><button class="button secondary" data-screen="home">返回首页</button></div>');
  const samples = data.samples;
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
  chart('trust-chart', 'bar', ['可信组', '不可信组'], [{ label: '本机平均等待秒数', data: samples.length < 2 ? [null, null] : [mean('reliable'), mean('unreliable')], backgroundColor: ['#7FC8A9', '#FF6B6B'], borderColor: '#2D2A26', borderWidth: 2, borderRadius: 8 }], { scales: { y: { min: 0, max: 800, title: { display: true, text: '秒' } }, x: { grid: { display: false } } } }, [references]);
  $('#trust-retry').onclick = trustIntro;
}

function renderBoard() {
  const groups = roundGroups(sprintData().rounds);
  const entries = groups.map((rounds) => ({
    coins: rounds.reduce((sum, round) => sum + (round.success ? REWARDS[round.round - 1] : 60), 0),
    longest: Math.max(...rounds.map((round) => round.waitSec)),
  })).sort((a, b) => b.coins - a.coins || b.longest - a.longest).slice(0, 10);
  $('#board-content').innerHTML = entries.length
    ? '<ol class="board-list">' + entries.map((entry, index) => '<li class="card"><div><strong>' + (index + 1) + '. ' + nick + '</strong><span class="fine">最长单回合等待 ' + entry.longest.toFixed(1) + ' 秒</span></div><strong>' + entry.coins + ' 🍬</strong></li>').join('') + '</ol>'
    : '<p class="card">还没有完成的挑战。完成三回合，留下第一条等待记录。</p>';
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
  const family = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif';
  context.fillStyle = '#FAF3E7'; context.fillRect(0, 0, 750, 1334);
  context.fillStyle = '#FFFFFF'; context.strokeStyle = '#2D2A26'; context.lineWidth = 5;
  context.beginPath(); context.roundRect(35, 35, 680, 1264, 32); context.fill(); context.stroke();
  context.fillStyle = '#2D2A26'; context.font = '800 39px ' + family;
  context.fillText('棉花糖实验室', 76, 112);
  context.font = '400 23px ' + family; context.fillText('Marshmallow Lab', 76, 150);
  context.font = '800 36px ' + family; context.fillText(currentCard.module, 76, 248);
  context.font = '800 58px ' + family; wrapText(context, currentCard.score, 76, 335, 595, 76);
  context.font = '400 27px ' + family; wrapText(context, currentCard.detail, 76, 442, 595, 42);
  context.fillStyle = '#7FC8A9'; context.beginPath(); context.roundRect(72, 534, 602, 88, 18); context.fill();
  context.fillStyle = '#2D2A26'; context.font = '700 28px ' + family;
  context.fillText('超过本机 ' + currentCard.percentile + '% 的完成记录', 96, 589);
  context.font = '800 36px ' + family; wrapText(context, currentCard.quote, 76, 718, 590, 56);
  context.font = '400 22px ' + family; wrapText(context, '环境可信、未来可预期时，等待值得练习。', 76, 902, 585, 35);

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
  context.fillStyle = '#2D2A26'; context.font = '400 22px ' + family; context.fillText('扫码，再来等一颗', 479, 1210);
  context.font = '400 21px ' + family; context.fillText(nick, 76, 1248);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) { toast('图片生成失败，请重试。'); return; }
  if (shareURL) URL.revokeObjectURL(shareURL);
  shareURL = URL.createObjectURL(blob);
  $('#result-image').src = shareURL;
  $('#download-card').href = shareURL;
  $('#card-dialog').showModal();
}
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-share]')) generateCard().catch(() => toast('图片生成失败，请重试。'));
});
$('.close-dialog').onclick = () => $('#card-dialog').close();
window.addEventListener('pagehide', () => {
  // 挑战开始时已写入零秒放弃标记，页面被关闭也不会遗留成功记录。
  stopClock();
});
