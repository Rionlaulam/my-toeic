/* Clearline TOEIC Practice Studio — dependency-free client-side application. */
(() => {
  'use strict';
  const PARTS = [
    { id: 1, name: 'Photographs', count: 6, section: 'Listening' },
    { id: 2, name: 'Question–Response', count: 25, section: 'Listening' },
    { id: 3, name: 'Conversations', count: 39, section: 'Listening' },
    { id: 4, name: 'Short Talks', count: 30, section: 'Listening' },
    { id: 5, name: 'Incomplete Sentences', count: 30, section: 'Reading' },
    { id: 6, name: 'Text Completion', count: 16, section: 'Reading' },
    { id: 7, name: 'Reading Comprehension', count: 54, section: 'Reading' }
  ];
  const HISTORY_KEY = 'clearline.toeic.history.v1';
  const app = document.getElementById('app-root');
  const APP_BASE = new URL('.', document.currentScript?.src || document.baseURI);
  let state = { view: 'home', test: null, testNo: 1, mode: 'practice', phase: 'Listening', part: 1, index: 0, answers: {}, submitted: false, transcriptOpen: false, remaining: 2700, masterRemaining: 7200, interval: null, played: new Set(), result: null };

  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtTime = seconds => `${Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0')}:${(Math.max(0, seconds) % 60).toString().padStart(2, '0')}`;
  const allQuestions = () => state.test?.questions || [];
  const currentPart = () => PARTS.find(x => x.id === state.part) || PARTS[0];
  const isExam = () => state.mode === 'exam';
  const inReview = () => state.submitted;
  const allowedQuestions = () => {
    if (isExam() && !state.submitted) return allQuestions().filter(q => q.section === state.phase);
    if (state.view === 'exam' && state.part) return allQuestions().filter(q => q.part === state.part);
    return allQuestions();
  };
  const currentQuestion = () => {
    const list = allowedQuestions();
    return list[Math.min(Math.max(0, state.index), list.length - 1)] || null;
  };
  const materialById = id => state.test?.materials?.find(m => m.id === id) || null;
  const historyItems = () => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch { return []; }
  };
  const writeHistory = entry => {
    const history = historyItems();
    history.unshift(entry);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30))); } catch { /* private browsing may block storage */ }
  };

  function homeMarkup() {
    const history = historyItems();
    const cards = Array.from({ length: 5 }, (_, i) => {
      const n = i + 1;
      const attempts = history.filter(h => h.testNo === n);
      const best = attempts.reduce((max, h) => Math.max(max, h.totalRaw), 0);
      return `<article class="test-card">
        <div class="card-top"><span class="test-number">${String(n).padStart(2, '0')}</span><span class="attempt-badge">${attempts.length ? `${attempts.length} attempt${attempts.length === 1 ? '' : 's'}` : 'Ready when you are'}</span></div>
        <h3>Practice Test ${n}</h3><p>200 original workplace-English questions across all seven parts.</p>
        <div class="card-meta"><span class="chip">120 min</span><span class="chip">${best ? `Best ${best}/200` : 'Full test'}</span></div>
        <div class="card-actions"><button class="btn btn-primary" data-action="launch" data-test="${n}" data-mode="practice">Practice</button><button class="btn btn-secondary" data-action="launch" data-test="${n}" data-mode="exam">Timed exam</button></div>
      </article>`;
    }).join('');
    const historyMarkup = history.length ? `<div class="history-list">${history.slice(0, 5).map(h => `<div class="history-row"><strong>Test ${h.testNo} · ${esc(h.mode === 'exam' ? 'Timed exam' : 'Practice')}</strong><span>${new Date(h.date).toLocaleDateString()}</span><span>${h.totalRaw}/200 correct</span><span class="history-score">${h.estimatedTotal} est.</span><span>${h.listeningRaw}/100 L · ${h.readingRaw}/100 R</span></div>`).join('')}</div>` : `<div class="history-empty">Your completed attempts will appear here. Progress is stored in this browser only.</div>`;
    return `<section class="hero"><div class="hero-copy"><p class="eyebrow">A clearer way to practice</p><h1>Build confidence.<br>One question at a time.</h1><p>Five complete Listening & Reading practice sets. Work at your own pace with instant feedback, or sit a timed two-section exam and review your result afterward.</p></div><div class="hero-side"><div class="stat-row"><span class="stat-num">05</span><span class="stat-label">separate<br>practice tests</span></div><div class="stat-row"><span class="stat-num">200</span><span class="stat-label">questions in<br>each full set</span></div><div class="stat-row"><span class="stat-num">7</span><span class="stat-label">parts across<br>two sections</span></div></div></section>
      <section aria-labelledby="tests-title"><div class="section-heading"><div><h2 id="tests-title">Choose a practice set</h2><p>Practice freely, or start a timed attempt.</p></div><span class="quiet-label">Only the selected test loads</span></div><div class="test-grid">${cards}</div></section>
      <aside class="info-strip"><span class="info-icon" aria-hidden="true">i</span><p><strong>About score estimates.</strong> ETS reports Listening and Reading on separate 5–495 scales. Because exact raw-to-scaled conversion depends on the test form, this app shows a clearly marked practice estimate—not an official TOEIC score.</p><a class="inline-link" href="https://www.etsglobal.org/fr/en/content/understanding-toeic-tests-scores" target="_blank" rel="noreferrer">ETS score overview ↗</a></aside>
      <section class="history-section"><div class="section-heading"><div><h2>Your recent attempts</h2><p>Saved on this device in LocalStorage.</p></div><button class="text-button" data-action="clear-history" ${history.length ? '' : 'hidden'}>Clear history</button></div><div class="history-card">${historyMarkup}</div></section>`;
  }

  function setHome() {
    clearInterval(state.interval); state.interval = null;
    state.view = 'home'; state.test = null; state.submitted = false;
    app.innerHTML = homeMarkup();
    app.focus({ preventScroll: true });
  }

  async function launch(testNo, mode) {
    clearInterval(state.interval); state.interval = null;
    state.view = 'loading'; app.innerHTML = `<section class="loading-state"><div class="loader"></div><p>Loading Practice Test ${testNo}…</p></section>`;
    try {
      const dataUrl = new URL(`data/test${testNo}.json`, APP_BASE);
      const response = await fetch(dataUrl.href);
      if (!response.ok) throw new Error(`Test file returned ${response.status} (${dataUrl.pathname})`);
      const test = await response.json();
      if (!Array.isArray(test.questions) || test.questions.length !== 200) throw new Error('The selected dataset does not contain 200 questions.');
      state = { ...state, view: 'start', test, testNo, mode, phase: 'Listening', part: 1, index: 0, answers: {}, submitted: false, transcriptOpen: false, remaining: 2700, masterRemaining: 7200, interval: null, played: new Set(), result: null };
      renderStart();
    } catch (error) {
      app.innerHTML = `<div class="empty-note"><strong>Could not load Practice Test ${testNo}.</strong><br>${esc(error.message)}<br><br>Serve this folder over HTTP with <code>node serve.js</code> rather than opening index.html directly.</div><button class="btn btn-secondary" data-action="home">Back to dashboard</button>`;
    }
  }

  function renderStart() {
    state.view = 'start';
    app.innerHTML = `<div class="exam-topline"><button class="back-link" data-action="home">← Dashboard</button><span class="exam-badge">Five-test series</span></div>
    <section class="start-card"><div class="start-hero"><p class="eyebrow">Practice Test ${state.testNo}</p><h1>Choose how you want to work.</h1><p>All 200 questions are original practice content. You can review each answer immediately or complete both sections before seeing your result.</p></div>
    <div class="start-body"><div class="mode-grid"><article class="mode-card practice"><span class="mode-icon" aria-hidden="true">✎</span><h3>Practice mode</h3><p>Move freely between questions. Check answers instantly, read explanations, and reveal listening scripts.</p><button class="btn btn-primary" data-action="begin" data-mode="practice">Start practice</button></article><article class="mode-card"><span class="mode-icon" aria-hidden="true">◷</span><h3>Timed exam mode</h3><p>45-minute Listening phase, then 75-minute Reading phase. Answers and scripts stay hidden until submission.</p><button class="btn btn-secondary" data-action="begin" data-mode="exam">Start timed exam</button></article></div>
    <div class="format-note"><strong>Test structure:</strong> Listening — 45 minutes, 100 questions. Reading — 75 minutes, 100 questions. Timed mode locks Listening when its time ends; you may also finish Listening early. Reading always receives up to 75 minutes, and the full attempt is capped at 120 minutes.</div></div></section>`;
  }

  function begin(mode) {
    state.mode = mode; state.view = 'exam'; state.part = 1; state.index = 0; state.answers = {}; state.submitted = false; state.transcriptOpen = false; state.played = new Set(); state.phase = 'Listening'; state.remaining = 45 * 60; state.masterRemaining = 120 * 60; state.result = null;
    renderExam();
    if (mode === 'exam') state.interval = setInterval(tick, 1000);
  }

  function questionsForPart(partId) { return allQuestions().filter(q => q.part === partId); }
  function currentOrdinal() {
    const q = currentQuestion();
    if (!q) return 0;
    return allowedQuestions().findIndex(x => x.id === q.id) + 1;
  }
  function sourceAudio(q, material) {
    if (q.audioText) return q.audioText;
    return material?.audioText || material?.transcript || '';
  }
  function audioToken(q) { return q.materialId || q.id; }

  function renderMaterial(q, material) {
    let out = '';
    if (q.image) out += `<figure class="photo-frame"><img src="${esc(q.image)}" alt="Original workplace scene illustration for listening question ${esc(q.id)}"><figcaption>Workplace scene illustration · Listen to the descriptions before choosing.</figcaption></figure>`;
    if (q.section === 'Listening') {
      const transcriptAvailable = Boolean(material?.transcript || q.audioText);
      const canReveal = state.mode === 'practice' || state.submitted;
      const key = audioToken(q);
      const alreadyPlayed = state.played.has(key);
      out += `<div class="audio-box"><div class="audio-copy"><span class="audio-icon" aria-hidden="true">♫</span><div><strong>${q.part <= 2 ? 'Spoken question and responses' : esc(material?.title || 'Listening passage')}</strong><small>${state.mode === 'exam' && !state.submitted ? 'Use Play audio; scripts are hidden until submission.' : 'Browser speech playback · transcripts available below.'}</small></div></div><button class="play-btn" data-action="play-audio" data-q="${esc(q.id)}" ${alreadyPlayed && state.mode === 'exam' && !state.submitted ? 'disabled' : ''}>${alreadyPlayed && state.mode === 'exam' && !state.submitted ? 'Played' : '▶ Play audio'}</button></div>`;
      if (transcriptAvailable && canReveal) {
        out += `<button class="transcript-toggle" data-action="toggle-transcript">${state.transcriptOpen ? 'Hide transcript' : 'Show transcript'}</button>`;
        if (state.transcriptOpen) out += `<div class="transcript-content">${esc(material?.transcript || q.audioText)}</div>`;
      }
    } else if (material?.documents?.length) {
      out += `<section class="material-card"><h3 class="material-title">${esc(material.title || 'Reading passage')}</h3><div class="doc-stack">${material.documents.map(d => `<article class="doc"><div class="doc-label">${esc(d.label || material.title || 'Passage')}</div><p class="doc-text">${esc(d.text)}</p></article>`).join('')}</div></section>`;
    }
    return out;
  }

  function examFeedback(q) {
    const selected = state.answers[q.id];
    const showFeedback = state.mode === 'practice' || state.submitted;
    if (!showFeedback) return '';
    if (selected === undefined) return `<div class="feedback unanswered"><strong>Not answered</strong><p>The correct answer is ${esc(q.answer)}. ${esc(q.choices[q.answer])}</p><p>${esc(q.explanation)}</p></div>`;
    const correct = selected === q.answer;
    return `<div class="feedback ${correct ? 'correct' : 'incorrect'}"><strong>${correct ? 'Correct answer' : 'Not quite — review the evidence'}</strong><p class="answer-line">Answer ${esc(q.answer)}: ${esc(q.choices[q.answer])}</p><p>${esc(q.explanation)}</p></div>`;
  }

  function scoreQuestionClass(q) {
    const chosen = state.answers[q.id];
    if (chosen === undefined || !state.submitted) return chosen ? 'answered' : '';
    return chosen === q.answer ? 'correct' : 'wrong';
  }

  function renderExam() {
    if (state.view !== 'exam') return;
    if (!state.submitted && isExam() && state.phase === 'Reading' && state.part < 5) { state.part = 5; state.index = 0; }
    if (!state.submitted && isExam() && state.phase === 'Listening' && state.part > 4) { state.part = 1; state.index = 0; }
    const list = allowedQuestions();
    if (!list.length) return;
    state.index = Math.min(Math.max(0, state.index), list.length - 1);
    const q = list[state.index];
    const material = q.materialId ? materialById(q.materialId) : null;
    const answered = Object.keys(state.answers).length;
    const activePartQuestions = questionsForPart(state.part);
    const mappedActive = activePartQuestions;
    const totalVisible = isExam() && !state.submitted ? allQuestions().filter(x => x.section === state.phase).length : allQuestions().length;
    const totalAnswered = isExam() && !state.submitted ? allQuestions().filter(x => x.section === state.phase && state.answers[x.id] !== undefined).length : answered;
    const position = currentOrdinal();
    const partQuestions = activePartQuestions;
    const tabs = PARTS.map(part => {
      const locked = isExam() && !state.submitted && ((state.phase === 'Listening' && part.id > 4) || (state.phase === 'Reading' && part.id < 5));
      return `<button class="part-tab ${state.part === part.id ? 'active' : ''} ${locked ? 'locked' : ''}" data-action="part" data-part="${part.id}" ${locked ? 'disabled' : ''}><span>P${part.id} · ${esc(part.name)}</span><small>${part.count}</small></button>`;
    }).join('');
    const map = mappedActive.map((item, i) => `<button class="map-btn ${i === state.index ? 'current' : scoreQuestionClass(item)}" data-action="jump" data-index="${i}" aria-label="Question ${i+1}${state.answers[item.id] ? `, answered ${state.answers[item.id]}` : ''}">${String(i+1).padStart(2,'0')}</button>`).join('');
    const choices = Object.entries(q.choices).map(([key, value]) => {
      const selected = state.answers[q.id] === key;
      const revealed = state.mode === 'practice' || state.submitted;
      const showSpokenText = revealed || q.part >= 3;
      let cls = `choice ${selected ? 'selected' : ''}`;
      if (state.submitted && key === q.answer) cls += ' correct-choice';
      if (state.submitted && selected && key !== q.answer) cls += ' wrong-choice';
      const text = showSpokenText ? esc(value) : '<span class="choice-spoken">Spoken option</span>';
      const mark = state.submitted && key === q.answer ? '✓' : (state.submitted && selected ? '×' : '');
      const disabled = state.submitted || (state.mode === 'practice' && state._lockedQuestion === q.id);
      return `<button class="${cls}" data-action="answer" data-q="${esc(q.id)}" data-key="${esc(key)}" ${disabled ? 'disabled' : ''}><span class="choice-key">${esc(key)}</span><span class="choice-text">${text}</span><span class="choice-mark">${mark}</span></button>`;
    }).join('');
    const qFeedback = examFeedback(q);
    const prevDisabled = state.index <= 0;
    const nextDisabled = state.index >= list.length - 1;
    const partIntro = `<div class="part-intro"><div><strong>Part ${state.part} — ${esc(currentPart().name)}</strong><small>${currentPart().section} · ${currentPart().count} questions</small></div><span class="part-count">Question ${position} of ${list.length}</span></div>`;
    const timer = isExam() && !state.submitted ? `<div class="timer-bar"><span class="timer-phase">${state.phase} phase · ${state.phase === 'Listening' ? '45-minute allowance' : '75-minute allowance'}</span><div class="timer-values"><div class="timer-cell"><span>Section left</span><strong id="timer-value">${fmtTime(state.remaining)}</strong></div><div class="timer-cell master"><span>Master time left</span><strong id="master-timer">${fmtTime(state.masterRemaining)}</strong></div></div><div class="timer-actions">${state.phase === 'Listening' ? '<button class="btn btn-small btn-secondary" data-action="finish-listening">Continue to Reading</button>' : '<button class="btn btn-small btn-danger" data-action="submit">Submit exam</button>'}</div></div>` : '';
    const results = state.submitted && state.result ? renderResults(state.result) : '';
    const submitPractice = state.mode === 'practice' && !state.submitted ? `<div class="submit-row"><span class="submit-hint">Answers are checked as you go. Submit to see your complete score report.</span><button class="btn btn-secondary" data-action="submit">Finish & score</button></div>` : '';
    const finishExamButton = state.submitted ? `<div class="finish-actions"><button class="btn btn-primary" data-action="home">Back to dashboard</button><button class="btn btn-secondary" data-action="restart">Restart this test</button></div>` : '';
    app.innerHTML = `<div class="exam-topline"><button class="back-link" data-action="home">← Dashboard</button><div class="exam-meta-top"><span class="exam-badge">Practice Test ${state.testNo}</span><span class="exam-badge ${isExam() ? 'exam-mode' : ''}">${state.mode === 'practice' ? 'Practice mode' : (state.submitted ? 'Exam review' : 'Timed exam')}</span></div></div>
    ${results}
    <div class="exam-layout"><aside class="exam-sidebar"><h2 class="sidebar-title">Question map <span>${state.submitted ? 'Review' : (isExam() ? state.phase : 'All parts')}</span></h2><nav class="part-list" aria-label="Test parts">${tabs}</nav><p class="question-map-label">Part ${state.part} · ${partQuestions.length} questions</p><div class="question-map" aria-label="Jump to question">${map}</div><div class="sidebar-progress"><div class="progress-label"><span>Answered</span><span>${totalAnswered} / ${totalVisible}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,totalAnswered/Math.max(totalVisible,1)*100)}%"></div></div></div></aside>
    <section class="main-panel" aria-label="Question ${position}">${timer}${partIntro}<article class="question-card"><div class="question-kicker"><span>Question ${esc(q.id.split('-').slice(2).join('-'))}</span><span class="${state.mode === 'practice' && state.answers[q.id] ? 'practice-state' : (state.submitted ? 'review-state' : '')}">${state.submitted ? 'Answer review' : (state.mode === 'practice' && state.answers[q.id] ? 'Checked' : (isExam() ? 'Exam conditions' : 'Choose one answer'))}</span></div>${renderMaterial(q,material)}<h1 class="question-prompt">${esc(q.prompt)}</h1><div class="choices" role="group" aria-label="Answer choices">${choices}</div>${qFeedback}<div class="question-nav"><div class="nav-left"><button class="btn btn-secondary btn-small" data-action="prev" ${prevDisabled ? 'disabled' : ''}>← Previous</button><span class="nav-progress">${position} / ${list.length}</span></div><div class="nav-right"><button class="btn btn-primary btn-small" data-action="next" ${nextDisabled ? 'disabled' : ''}>Next →</button></div></div>${submitPractice}${finishExamButton}</article></section></div>`;
    if (isExam() && !state.submitted) updateTimerDisplay();
  }

  function scoreForRaw(raw) {
    // Transparent linear practice estimate, not an ETS conversion table.
    return Math.max(5, Math.min(495, Math.round((5 + raw * 4.9) / 5) * 5));
  }
  function calculateResult() {
    const qs = allQuestions();
    const raw = qs.filter(q => state.answers[q.id] === q.answer).length;
    const listening = qs.filter(q => q.section === 'Listening' && state.answers[q.id] === q.answer).length;
    const reading = qs.filter(q => q.section === 'Reading' && state.answers[q.id] === q.answer).length;
    const parts = Object.fromEntries(PARTS.map(p => [p.id, { correct: qs.filter(q => q.part === p.id && state.answers[q.id] === q.answer).length, total: p.count }]));
    return { totalRaw: raw, listeningRaw: listening, readingRaw: reading, listeningScale: scoreForRaw(listening), readingScale: scoreForRaw(reading), estimatedTotal: scoreForRaw(listening) + scoreForRaw(reading), parts };
  }
  function renderResults(r) {
    return `<section class="results-card"><div class="results-top"><div class="results-title"><h2>${state.mode === 'exam' ? 'Exam complete' : 'Practice results'}</h2><p>${r.totalRaw} of 200 answers correct · ${state.mode === 'exam' ? 'Timed attempt' : 'Practice mode'}</p></div><div class="results-total"><strong>${r.estimatedTotal}</strong><span>estimated / 990</span></div></div><div class="score-grid"><div class="score-cell"><span>Listening raw · estimate</span><strong>${r.listeningRaw}/100 · ${r.listeningScale}</strong></div><div class="score-cell"><span>Reading raw · estimate</span><strong>${r.readingRaw}/100 · ${r.readingScale}</strong></div><div class="score-cell"><span>Overall raw</span><strong>${r.totalRaw}/200</strong></div></div><div class="section-breakdown">${PARTS.map(p => `<div class="breakdown-cell"><span>Part ${p.id}</span><strong>${r.parts[p.id].correct}/${p.count}</strong></div>`).join('')}</div><p class="results-disclaimer">This is a linear practice estimate based on correct answers. ETS scaled scores use form-specific equating; this result is not an official TOEIC score.</p></section>`;
  }

  function chooseAnswer(qid, key) {
    if (state.submitted) return;
    state.answers[qid] = key;
    renderExam();
  }
  function switchPart(id) {
    if (isExam() && !state.submitted && ((state.phase === 'Listening' && id > 4) || (state.phase === 'Reading' && id < 5))) return;
    state.part = id;
    const list = allowedQuestions();
    state.index = 0;
    state.transcriptOpen = false;
    renderExam();
  }
  function moveIndex(delta) {
    const list = allowedQuestions();
    state.index = Math.max(0, Math.min(list.length - 1, state.index + delta));
    state.transcriptOpen = false;
    renderExam();
  }
  function submitAttempt() {
    if (state.submitted || !state.test) return;
    clearInterval(state.interval); state.interval = null;
    state.submitted = true; state.result = calculateResult(); state.part = 1; state.index = 0; state.transcriptOpen = false;
    const entry = { testNo: state.testNo, mode: state.mode, date: new Date().toISOString(), ...state.result };
    writeHistory(entry);
    renderExam();
    app.focus({ preventScroll: true });
  }
  function startReading() {
    if (state.submitted || state.phase !== 'Listening') return;
    state.phase = 'Reading'; state.part = 5; state.index = 0; state.remaining = 75 * 60; state.transcriptOpen = false;
    renderExam();
  }
  function tick() {
    if (!isExam() || state.submitted) return;
    state.masterRemaining -= 1;
    state.remaining -= 1;
    if (state.masterRemaining <= 0) { submitAttempt(); return; }
    if (state.remaining <= 0) {
      if (state.phase === 'Listening') startReading();
      else submitAttempt();
      return;
    }
    updateTimerDisplay();
  }
  function updateTimerDisplay() {
    const section = document.getElementById('timer-value');
    const master = document.getElementById('master-timer');
    if (section) section.textContent = fmtTime(state.remaining);
    if (master) master.textContent = fmtTime(state.masterRemaining);
  }
  function playAudio(qid) {
    const q = allQuestions().find(x => x.id === qid);
    if (!q) return;
    const material = q.materialId ? materialById(q.materialId) : null;
    const text = sourceAudio(q, material);
    if (!text) return;
    if (!('speechSynthesis' in window)) { alert('Speech playback is not available in this browser.'); return; }
    const token = audioToken(q);
    if (isExam() && !state.submitted) state.played.add(token);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US'; utter.rate = .92; utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /^en-US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    if (preferred) utter.voice = preferred;
    utter.onend = () => { if (state.view === 'exam') renderExam(); };
    window.speechSynthesis.speak(utter);
    renderExam();
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'home') { window.speechSynthesis?.cancel(); setHome(); }
    else if (action === 'launch') launch(Number(target.dataset.test), target.dataset.mode);
    else if (action === 'begin') begin(target.dataset.mode);
    else if (action === 'part') switchPart(Number(target.dataset.part));
    else if (action === 'jump') { state.index = Number(target.dataset.index); state.transcriptOpen = false; renderExam(); }
    else if (action === 'answer') chooseAnswer(target.dataset.q, target.dataset.key);
    else if (action === 'prev') moveIndex(-1);
    else if (action === 'next') moveIndex(1);
    else if (action === 'play-audio') playAudio(target.dataset.q);
    else if (action === 'toggle-transcript') { state.transcriptOpen = !state.transcriptOpen; renderExam(); }
    else if (action === 'submit') submitAttempt();
    else if (action === 'finish-listening') startReading();
    else if (action === 'restart') launch(state.testNo, state.mode);
    else if (action === 'clear-history') { if (confirm('Clear all TOEIC practice history stored in this browser?')) { localStorage.removeItem(HISTORY_KEY); setHome(); } }
  });
  document.getElementById('home-link').addEventListener('click', event => { event.preventDefault(); window.speechSynthesis?.cancel(); setHome(); });
  document.getElementById('history-link').addEventListener('click', () => document.querySelector('.history-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  setHome();
})();
