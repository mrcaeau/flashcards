/**
 * FLASHCARDS STUDIO — Application Logic
 * Modern, GitHub Pages ready, vanilla ES6+ architecture
 */

(() => {
  'use strict';

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    catalogs: [],           // List of all catalog meta
    loadedDecks: new Map(), // Cache for loaded decks data
    selectedCategory: 'all',
    searchQuery: '',
    
    // Study session state
    currentDeck: null,
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    isInverted: false,
    isShuffled: false,
    knownCardIds: new Set(),
    repeatCardIds: new Set(),
    activeHint: false
  };

  // =========================================================================
  // DOM ELEMENTS
  // =========================================================================
  const DOM = {
    // Views
    viewCatalogs: document.getElementById('view-catalogs'),
    viewStudy: document.getElementById('view-study'),
    viewSummary: document.getElementById('view-summary'),

    // Header & Global
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    btnOpenCreator: document.getElementById('btn-open-creator'),
    brandLink: document.getElementById('brand-link'),
    toastContainer: document.getElementById('toast-container'),

    // Catalog view
    catalogGrid: document.getElementById('catalog-grid'),
    catalogSearch: document.getElementById('catalog-search'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    categoryChips: document.getElementById('category-chips'),
    totalDecksCount: document.getElementById('total-decks-count'),
    deckFilterStats: document.getElementById('deck-filter-stats'),
    dropzoneStrip: document.getElementById('dropzone-strip'),
    fileInputDirect: document.getElementById('file-input-direct'),
    btnBrowseFile: document.getElementById('btn-browse-file'),

    // Study view
    btnBackToCatalogs: document.getElementById('btn-back-to-catalogs'),
    studyDeckIcon: document.getElementById('study-deck-icon'),
    studyDeckTitle: document.getElementById('study-deck-title'),
    studyDeckTag: document.getElementById('study-deck-tag'),
    progressBar: document.getElementById('progress-bar'),
    progressCardCount: document.getElementById('progress-card-count'),
    progressPercent: document.getElementById('progress-percent'),

    // Study action buttons
    btnToggleShuffle: document.getElementById('btn-toggle-shuffle'),
    btnToggleInvert: document.getElementById('btn-toggle-invert'),
    btnTts: document.getElementById('btn-tts'),
    btnShortcutsHelp: document.getElementById('btn-shortcuts-help'),

    // Flashcard & evaluation
    flashcard: document.getElementById('flashcard'),
    cardQuestionText: document.getElementById('card-question-text'),
    cardAnswerText: document.getElementById('card-answer-text'),
    cardFrontTag: document.getElementById('card-front-tag'),
    cardBackTag: document.getElementById('card-back-tag'),
    cardHintContainer: document.getElementById('card-hint-container'),
    cardHintText: document.getElementById('card-hint-text'),
    btnToggleHint: document.getElementById('btn-toggle-hint'),

    btnPrevCard: document.getElementById('btn-prev-card'),
    btnNextCard: document.getElementById('btn-next-card'),
    btnFlipCard: document.getElementById('btn-flip-card'),
    btnMarkRepeat: document.getElementById('btn-mark-repeat'),
    btnMarkKnown: document.getElementById('btn-mark-known'),

    // Summary view
    summaryDeckName: document.getElementById('summary-deck-name'),
    summaryCircleBar: document.getElementById('summary-circle-bar'),
    summaryPercent: document.getElementById('summary-percent'),
    summaryKnownCount: document.getElementById('summary-known-count'),
    summaryRepeatCount: document.getElementById('summary-repeat-count'),
    summaryTotalCount: document.getElementById('summary-total-count'),
    btnRestartRepeat: document.getElementById('btn-restart-repeat'),
    btnRestartAll: document.getElementById('btn-restart-all'),
    btnFinishToCatalogs: document.getElementById('btn-finish-to-catalogs'),

    // Modals
    modalCreator: document.getElementById('modal-deck-creator'),
    btnCloseModalCreator: document.getElementById('btn-close-modal-creator'),
    modalDropArea: document.getElementById('modal-drop-area'),
    btnPickJson: document.getElementById('btn-pick-json'),
    modalFileInput: document.getElementById('modal-file-input'),
    jsonPasteArea: document.getElementById('json-paste-area'),
    btnLoadPastedJson: document.getElementById('btn-load-pasted-json'),
    jsonPasteError: document.getElementById('json-paste-error'),
    btnCopyTemplate: document.getElementById('btn-copy-template'),
    templateCodeContent: document.getElementById('template-code-content'),

    modalShortcuts: document.getElementById('modal-shortcuts'),
    btnCloseModalShortcuts: document.getElementById('btn-close-modal-shortcuts')
  };

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  async function init() {
    initTheme();
    setupEventListeners();
    await loadCatalogsIndex();
  }

  // =========================================================================
  // THEME MANAGEMENT
  // =========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('fc_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Default to Natural Minimalist light palette
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fc_theme', next);
    showToast(`Mode ${next === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
  }

  // =========================================================================
  // DATA FETCHING & CATALOG MANAGEMENT
  // =========================================================================
  async function loadCatalogsIndex() {
    try {
      const response = await fetch(`data/catalogs.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - Erreur de chargement`);
      }
      const data = await response.json();
      state.catalogs = data.catalogs || [];

      // Render category filter chips
      renderCategoryChips();
      // Render deck cards in grid
      renderCatalogGrid();
    } catch (err) {
      console.warn('Impossible de charger catalogs.json, utilisation des données de secours :', err);
      // Fallback sample catalog if run via strict local file:// protocol with browser security restrictions
      loadFallbackCatalogs();
    }
  }

  function loadFallbackCatalogs() {
    // Built-in fallback so the app works even if opened directly with double-click without a server!
    state.catalogs = [
      {
        id: "ecoconception-cours-1",
        title: "Écoconception - Cours 1 (L'Homme par nature)",
        description: "Retrouvez les notions clés, définitions et concepts abordés lors du premier cours d'écoconception.",
        category: "Éco-conception",
        icon: "🌱",
        file: "data/decks/ecoconception-cours-1.json",
        cardsCount: 18,
        tags: ["Écoconception", "Biodiversité", "Ingénierie", "ACV"],
        difficulty: "Cours"
      },
      {
        id: "ecoconception-cours-2",
        title: "Écoconception - Cours 2 (Cycle de vie et Méthodologie ACV)",
        description: "Approfondissement des méthodologies d'analyse, des étapes du cycle de vie et des indicateurs d'impacts environnementaux.",
        category: "Éco-conception",
        icon: "🌱",
        file: "data/decks/ecoconception-cours-2.json",
        cardsCount: 18,
        tags: ["Écoconception", "Biodiversité", "Ingénierie", "ACV"],
        difficulty: "Cours"
      },
      {
        id: "optimisation-recherche-operationnelle",
        title: "Optimisation & Recherche Opérationnelle",
        description: "Fiche de révision sur l'optimisation libre, la convexité, les multiplicateurs de Lagrange et les conditions du second ordre.",
        category: "Optimisation et recherche opérationnelle",
        icon: "⚙️",
        file: "data/decks/optimisation-recherche-operationnelle.json",
        cardsCount: 35,
        tags: ["Optimisation", "Lagrange", "Hessienne", "Convexité"],
        difficulty: "Avancé"
      },
      {
        id: "methodes-numeriques-chap1-2",
        title: "Méthodes Numériques - Chapitres 1 et 2",
        description: "Deck complet d'une quarantaine de cartes couvrant l'intégralité des notions abordées dans les chapitres 1 et 2 de méthodes numériques.",
        category: "Méthodes numériques",
        icon: "📊",
        file: "data/decks/methodes-numeriques-chap1-2.json",
        cardsCount: 40,
        tags: ["Méthodes Numériques", "Newton-Raphson", "Gauss & LU", "Interpolation", "Intégration", "EDO"],
        difficulty: "Intermédiaire"
      }
    ];

    renderCategoryChips();
    renderCatalogGrid();
  }

  // =========================================================================
  // VIEW SWITCHING (Strict Full-Page Experience)
  // =========================================================================
  function switchView(viewName) {
    const views = [
      { name: 'catalogs', el: DOM.viewCatalogs },
      { name: 'study', el: DOM.viewStudy },
      { name: 'summary', el: DOM.viewSummary }
    ];

    views.forEach(({ name, el }) => {
      const isCurrent = (viewName === name);
      if (isCurrent) {
        el.classList.add('active');
        el.hidden = false;
        el.style.display = (name === 'study') ? 'flex' : 'block';
      } else {
        el.classList.remove('active');
        el.hidden = true;
        el.style.display = 'none';
      }
    });

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // =========================================================================
  // CATALOG GRID RENDERING & FILTERING
  // =========================================================================
  function renderCategoryChips() {
    const categories = new Set();
    state.catalogs.forEach(cat => {
      if (cat.category) categories.add(cat.category);
    });

    const categoryList = Array.from(categories).sort();
    
    // Clear and rebuild
    DOM.categoryChips.innerHTML = `
      <button class="chip ${state.selectedCategory === 'all' ? 'active' : ''}" data-category="all">
        Tous (<span id="total-decks-count">${state.catalogs.length}</span>)
      </button>
    `;

    categoryList.forEach(category => {
      const count = state.catalogs.filter(c => c.category === category).length;
      const btn = document.createElement('button');
      btn.className = `chip ${state.selectedCategory === category ? 'active' : ''}`;
      btn.dataset.category = category;
      btn.textContent = `${category} (${count})`;
      DOM.categoryChips.appendChild(btn);
    });
  }

  function getFilteredCatalogs() {
    const query = state.searchQuery.trim().toLowerCase();
    return state.catalogs.filter(catalog => {
      const matchesCategory = state.selectedCategory === 'all' || catalog.category === state.selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      const titleMatch = (catalog.title || '').toLowerCase().includes(query);
      const descMatch = (catalog.description || '').toLowerCase().includes(query);
      const catMatch = (catalog.category || '').toLowerCase().includes(query);
      const tagMatch = (catalog.tags || []).some(t => t.toLowerCase().includes(query));

      return titleMatch || descMatch || catMatch || tagMatch;
    });
  }

  function renderCatalogGrid() {
    const filtered = getFilteredCatalogs();
    DOM.deckFilterStats.textContent = `${filtered.length} catalogue${filtered.length > 1 ? 's' : ''} disponible${filtered.length > 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      DOM.catalogGrid.innerHTML = `
        <div class="empty-state">
          <p>Aucun catalogue ne correspond à votre recherche <strong>"${escapeHtml(state.searchQuery)}"</strong>.</p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-filters" style="margin-top: 1rem;">
            Réinitialiser les filtres
          </button>
        </div>
      `;
      const btnReset = document.getElementById('btn-reset-filters');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          state.searchQuery = '';
          state.selectedCategory = 'all';
          DOM.catalogSearch.value = '';
          DOM.btnClearSearch.hidden = true;
          renderCategoryChips();
          renderCatalogGrid();
        });
      }
      return;
    }

    DOM.catalogGrid.innerHTML = filtered.map(catalog => {
      const cardsCountText = catalog.cardsCount ? `${catalog.cardsCount} cartes` : 'Catalogue JSON';
      const isCustom = catalog.isCustom ? `<span class="badge" style="color:var(--accent-repeat);">Local</span>` : '';

      return `
        <div class="deck-card" data-deck-id="${escapeHtml(catalog.id)}">
          <div class="deck-card-top">
            <span class="badge">${escapeHtml(catalog.category || 'Général')}</span>
            <div class="deck-badges">
              ${isCustom}
              <span class="deck-icon-badge">${catalog.icon || '📖'}</span>
            </div>
          </div>

          <div class="deck-card-content">
            <h3 class="deck-card-title">${escapeHtml(catalog.title)}</h3>
            <p class="deck-card-desc">${escapeHtml(catalog.description || '')}</p>
          </div>

          <div class="deck-card-footer">
            <span>${cardsCountText}</span>
            <span class="btn-start-deck">
              <span>Étudier</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to deck cards
    DOM.catalogGrid.querySelectorAll('.deck-card').forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const deckId = cardEl.dataset.deckId;
        const catalog = state.catalogs.find(c => c.id === deckId);
        if (catalog) startStudySession(catalog);
      });
    });
  }

  // =========================================================================
  // STUDY SESSION MANAGEMENT
  // =========================================================================
  async function startStudySession(catalogMeta, customDeckData = null) {
    let deckData = customDeckData;

    if (!deckData) {
      // Check cache first
      if (state.loadedDecks.has(catalogMeta.id)) {
        deckData = state.loadedDecks.get(catalogMeta.id);
      } else {
        try {
          showToast('Chargement du catalogue...', 'info');
          const response = await fetch(`${catalogMeta.file}?t=${Date.now()}`, { cache: 'no-store' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          deckData = await response.json();
          state.loadedDecks.set(catalogMeta.id, deckData);
        } catch (err) {
          console.error('Erreur chargement deck:', err);
          showToast(`Impossible de charger le fichier : ${catalogMeta.file}`, 'error');
          return;
        }
      }
    }

    if (!deckData.cards || !Array.isArray(deckData.cards) || deckData.cards.length === 0) {
      showToast('Ce catalogue ne contient aucune carte valide.', 'error');
      return;
    }

    // Initialize Study Session State
    state.currentDeck = deckData;
    // Prepare deck cards with guaranteed ids
    state.cards = deckData.cards.map((card, idx) => ({
      id: card.id !== undefined ? card.id : idx + 1,
      question: card.question || 'Sans question',
      answer: card.answer || 'Sans réponse',
      hint: card.hint || '',
      tag: card.tag || card.category || catalogMeta.category || 'Général'
    }));

    // Update catalogMeta with actual cards count if missing
    if (!catalogMeta.cardsCount) {
      catalogMeta.cardsCount = state.cards.length;
    }

    state.currentIndex = 0;
    state.isFlipped = false;
    state.isInverted = false;
    state.isShuffled = false;
    state.activeHint = false;
    state.knownCardIds.clear();
    state.repeatCardIds.clear();

    // Update Header in Study View
    DOM.studyDeckIcon.textContent = deckData.icon || catalogMeta.icon || '📖';
    DOM.studyDeckTitle.textContent = deckData.title || catalogMeta.title || 'Catalogue';
    DOM.studyDeckTag.textContent = deckData.category || catalogMeta.category || 'Général';
    DOM.btnToggleShuffle.classList.remove('active');
    DOM.btnToggleInvert.classList.remove('active');

    // Switch View & Render Card
    switchView('study');
    renderCurrentCard();
  }

  function renderCurrentCard() {
    const total = state.cards.length;
    if (total === 0) return;

    const currentCard = state.cards[state.currentIndex];

    // Card Progress
    const progressPercent = Math.round(((state.currentIndex + 1) / total) * 100);
    DOM.progressBar.style.width = `${progressPercent}%`;
    DOM.progressCardCount.textContent = `Carte ${state.currentIndex + 1} / ${total}`;
    DOM.progressPercent.textContent = `${progressPercent}%`;

    // Reset Flip state
    state.isFlipped = false;
    state.activeHint = false;
    DOM.flashcard.classList.remove('flipped');

    // Handle Question / Answer inversion
    const frontText = state.isInverted ? currentCard.answer : currentCard.question;
    const backText = state.isInverted ? currentCard.question : currentCard.answer;

    DOM.cardQuestionText.textContent = frontText;
    DOM.cardAnswerText.textContent = backText;
    renderMath(DOM.cardQuestionText);
    renderMath(DOM.cardAnswerText);

    DOM.cardFrontTag.textContent = currentCard.tag || (state.isInverted ? 'Réponse' : 'Question');
    DOM.cardBackTag.textContent = state.isInverted ? 'Question originale' : 'Explication';

    // Hint management
    if (currentCard.hint && !state.isInverted) {
      DOM.btnToggleHint.hidden = false;
      DOM.cardHintText.textContent = currentCard.hint;
      renderMath(DOM.cardHintText);
      DOM.cardHintContainer.hidden = true;
    } else {
      DOM.btnToggleHint.hidden = true;
      DOM.cardHintContainer.hidden = true;
    }

    // Previous / Next buttons state
    DOM.btnPrevCard.disabled = state.currentIndex === 0;
  }

  function renderMath(element) {
    if (!element) return;
    if (typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (err) {
        // Fallback silently if math rendering encounters an issue
      }
    }
  }

  function flipCard() {
    state.isFlipped = !state.isFlipped;
    DOM.flashcard.classList.toggle('flipped', state.isFlipped);
  }

  function toggleHint() {
    state.activeHint = !state.activeHint;
    DOM.cardHintContainer.hidden = !state.activeHint;
    DOM.btnToggleHint.querySelector('span').textContent = state.activeHint ? "Masquer l'indice" : "Afficher l'indice";
  }

  function nextCard() {
    if (state.currentIndex < state.cards.length - 1) {
      state.currentIndex++;
      renderCurrentCard();
    } else {
      finishStudySession();
    }
  }

  function prevCard() {
    if (state.currentIndex > 0) {
      state.currentIndex--;
      renderCurrentCard();
    }
  }

  function markCard(type) {
    const currentCard = state.cards[state.currentIndex];
    if (type === 'known') {
      state.knownCardIds.add(currentCard.id);
      state.repeatCardIds.delete(currentCard.id);
      showToast('Carte marquée comme maîtrisée !', 'success');
    } else {
      state.repeatCardIds.add(currentCard.id);
      state.knownCardIds.delete(currentCard.id);
      showToast('Carte marquée à revoir.', 'info');
    }

    // Move to next card after brief visual cue
    setTimeout(() => {
      nextCard();
    }, 150);
  }

  function toggleShuffle() {
    state.isShuffled = !state.isShuffled;
    DOM.btnToggleShuffle.classList.toggle('active', state.isShuffled);

    if (state.isShuffled) {
      // Fisher-Yates Shuffle
      const shuffled = [...state.cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      state.cards = shuffled;
      state.currentIndex = 0;
      renderCurrentCard();
      showToast('Cartes mélangées !', 'info');
    } else {
      // Restore original deck order
      const originalCards = state.currentDeck.cards;
      state.cards = originalCards.map((c, i) => ({
        id: c.id !== undefined ? c.id : i + 1,
        question: c.question,
        answer: c.answer,
        hint: c.hint || '',
        tag: c.tag || c.category || 'Général'
      }));
      state.currentIndex = 0;
      renderCurrentCard();
      showToast('Ordre initial rétabli', 'info');
    }
  }

  function toggleInvert() {
    state.isInverted = !state.isInverted;
    DOM.btnToggleInvert.classList.toggle('active', state.isInverted);
    renderCurrentCard();
    showToast(state.isInverted ? 'Mode inversé : Réponse au recto' : 'Mode normal : Question au recto', 'info');
  }

  // =========================================================================
  // TEXT-TO-SPEECH (TTS)
  // =========================================================================
  function speakCurrentCard() {
    if (!('speechSynthesis' in window)) {
      showToast('Synthèse vocale non supportée par votre navigateur', 'error');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const currentCard = state.cards[state.currentIndex];
    // Speak front if not flipped, or back if flipped
    const textToSpeak = state.isFlipped ? (state.isInverted ? currentCard.question : currentCard.answer)
                                        : (state.isInverted ? currentCard.answer : currentCard.question);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = state.currentDeck.language || 'fr-FR';
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
    showToast('Lecture audio en cours...', 'info');
  }

  // =========================================================================
  // SESSION SUMMARY & COMPLETION
  // =========================================================================
  function finishStudySession() {
    const total = state.cards.length;
    const known = state.knownCardIds.size;
    const repeat = state.repeatCardIds.size;
    const evaluated = known + repeat;

    // Calculate score percentage
    const percent = total > 0 ? Math.round((known / total) * 100) : 0;

    DOM.summaryDeckName.textContent = state.currentDeck.title || 'Session de cartes';
    DOM.summaryPercent.textContent = `${percent}%`;
    DOM.summaryKnownCount.textContent = known;
    DOM.summaryRepeatCount.textContent = repeat;
    DOM.summaryTotalCount.textContent = total;

    // Animate circular progress ring (Circumference of r=50 is 2 * PI * 50 = 314.16)
    const circumference = 314.16;
    const offset = circumference - (percent / 100) * circumference;
    DOM.summaryCircleBar.style.strokeDasharray = `${circumference}`;
    DOM.summaryCircleBar.style.strokeDashoffset = `${circumference}`;

    // Show/hide repeat only button
    DOM.btnRestartRepeat.hidden = repeat === 0;

    switchView('summary');

    setTimeout(() => {
      DOM.summaryCircleBar.style.strokeDashoffset = `${offset}`;
    }, 150);
  }

  function restartStudy(onlyRepeat = false) {
    if (onlyRepeat) {
      const repeatCards = state.cards.filter(c => state.repeatCardIds.has(c.id));
      if (repeatCards.length === 0) return;
      state.cards = repeatCards;
    } else {
      // Reload full deck
      const originalCards = state.currentDeck.cards;
      state.cards = originalCards.map((c, i) => ({
        id: c.id !== undefined ? c.id : i + 1,
        question: c.question,
        answer: c.answer,
        hint: c.hint || '',
        tag: c.tag || c.category || 'Général'
      }));
    }

    state.currentIndex = 0;
    state.isFlipped = false;
    state.knownCardIds.clear();
    state.repeatCardIds.clear();

    switchView('study');
    renderCurrentCard();
  }

  // =========================================================================
  // CUSTOM DECK IMPORT & JSON PARSING
  // =========================================================================
  function handleJsonFile(file) {
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      showToast('Veuillez sélectionner un fichier au format .json', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        validateAndLoadCustomDeck(json, file.name);
      } catch (err) {
        showToast('Erreur : Fichier JSON invalide ou mal formé.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function validateAndLoadCustomDeck(deckJson, filename = 'custom.json') {
    if (!deckJson || typeof deckJson !== 'object') {
      throw new Error('Structure JSON invalide.');
    }

    if (!Array.isArray(deckJson.cards) || deckJson.cards.length === 0) {
      throw new Error('Le JSON doit contenir un tableau "cards" contenant au moins une carte.');
    }

    const invalidCard = deckJson.cards.find(c => !c.question || !c.answer);
    if (invalidCard) {
      throw new Error('Chaque carte doit contenir au minimum les propriétés "question" et "answer".');
    }

    const customMeta = {
      id: deckJson.id || `custom-${Date.now()}`,
      title: deckJson.title || filename.replace('.json', ''),
      description: deckJson.description || 'Deck importé localement',
      category: deckJson.category || 'Importé',
      icon: deckJson.icon || '📂',
      tags: deckJson.tags || ['Custom'],
      difficulty: deckJson.difficulty || 'Personnalisé',
      cardsCount: deckJson.cards.length,
      isCustom: true
    };

    // Add or replace in catalogs
    const existingIdx = state.catalogs.findIndex(c => c.id === customMeta.id);
    if (existingIdx >= 0) {
      state.catalogs[existingIdx] = customMeta;
    } else {
      state.catalogs.unshift(customMeta);
    }

    state.loadedDecks.set(customMeta.id, deckJson);

    // Close modal if open
    closeModal(DOM.modalCreator);

    // Refresh UI
    renderCategoryChips();
    renderCatalogGrid();

    showToast(`Catalogue "${customMeta.title}" chargé avec succès (${deckJson.cards.length} cartes) !`, 'success');

    // Immediately start session
    startStudySession(customMeta, deckJson);
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  // =========================================================================
  // MODAL HELPERS
  // =========================================================================
  function openModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  // =========================================================================
  // UTILITIES
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // EVENT LISTENERS SETUP
  // =========================================================================
  function setupEventListeners() {
    // Theme toggle
    DOM.btnThemeToggle.addEventListener('click', toggleTheme);

    // Brand link returns to catalogs
    DOM.brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('catalogs');
    });

    // Search bar
    DOM.catalogSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      DOM.btnClearSearch.hidden = !state.searchQuery;
      renderCatalogGrid();
    });

    DOM.btnClearSearch.addEventListener('click', () => {
      DOM.catalogSearch.value = '';
      state.searchQuery = '';
      DOM.btnClearSearch.hidden = true;
      renderCatalogGrid();
    });

    // Category chips
    DOM.categoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      state.selectedCategory = chip.dataset.category;
      DOM.categoryChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderCatalogGrid();
    });

    // Study Header controls
    DOM.btnBackToCatalogs.addEventListener('click', () => switchView('catalogs'));
    DOM.btnToggleShuffle.addEventListener('click', toggleShuffle);
    DOM.btnToggleInvert.addEventListener('click', toggleInvert);
    DOM.btnTts.addEventListener('click', speakCurrentCard);
    DOM.btnShortcutsHelp.addEventListener('click', () => openModal(DOM.modalShortcuts));

    // Flashcard Flip & Evaluation Controls
    DOM.flashcard.addEventListener('click', (e) => {
      // Don't flip if hint button was clicked
      if (e.target.closest('#btn-toggle-hint')) return;
      flipCard();
    });

    DOM.btnFlipCard.addEventListener('click', flipCard);
    DOM.btnToggleHint.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHint();
    });

    DOM.btnPrevCard.addEventListener('click', prevCard);
    DOM.btnNextCard.addEventListener('click', nextCard);
    DOM.btnMarkKnown.addEventListener('click', () => markCard('known'));
    DOM.btnMarkRepeat.addEventListener('click', () => markCard('repeat'));

    // Summary buttons
    DOM.btnRestartRepeat.addEventListener('click', () => restartStudy(true));
    DOM.btnRestartAll.addEventListener('click', () => restartStudy(false));
    DOM.btnFinishToCatalogs.addEventListener('click', () => switchView('catalogs'));

    // Modal: Creator / JSON Importer
    DOM.btnOpenCreator.addEventListener('click', () => openModal(DOM.modalCreator));
    DOM.btnCloseModalCreator.addEventListener('click', () => closeModal(DOM.modalCreator));
    DOM.modalCreator.addEventListener('click', (e) => {
      if (e.target === DOM.modalCreator) closeModal(DOM.modalCreator);
    });

    // Modal: Shortcuts
    DOM.btnCloseModalShortcuts.addEventListener('click', () => closeModal(DOM.modalShortcuts));
    DOM.modalShortcuts.addEventListener('click', (e) => {
      if (e.target === DOM.modalShortcuts) closeModal(DOM.modalShortcuts);
    });

    // Modal Tab Navigation
    DOM.modalCreator.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.modalCreator.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        DOM.modalCreator.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(btn.dataset.tab);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Copy template button
    DOM.btnCopyTemplate.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(DOM.templateCodeContent.textContent);
        showToast('Modèle JSON copié dans le presse-papier !', 'success');
      } catch (err) {
        showToast('Impossible de copier automatiquement.', 'error');
      }
    });

    // Paste JSON directly
    DOM.btnLoadPastedJson.addEventListener('click', () => {
      const text = DOM.jsonPasteArea.value.trim();
      DOM.jsonPasteError.hidden = true;
      if (!text) {
        DOM.jsonPasteError.textContent = 'Veuillez coller un dictionnaire JSON valide.';
        DOM.jsonPasteError.hidden = false;
        return;
      }

      try {
        const parsed = JSON.parse(text);
        validateAndLoadCustomDeck(parsed, 'deck-colle.json');
      } catch (err) {
        DOM.jsonPasteError.textContent = `Erreur : ${err.message}`;
        DOM.jsonPasteError.hidden = false;
      }
    });

    // File Picker in Modal
    DOM.btnPickJson.addEventListener('click', () => DOM.modalFileInput.click());
    DOM.modalFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleJsonFile(e.target.files[0]);
      }
    });

    // File Picker on Direct Dropzone strip
    DOM.btnBrowseFile.addEventListener('click', () => DOM.fileInputDirect.click());
    DOM.fileInputDirect.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleJsonFile(e.target.files[0]);
      }
    });

    // Drag and Drop support on strip
    setupDropzone(DOM.dropzoneStrip, (file) => handleJsonFile(file));
    // Drag and Drop support on modal area
    setupDropzone(DOM.modalDropArea, (file) => handleJsonFile(file));

    // KEYBOARD SHORTCUTS
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if typing inside input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      // Close modal on Escape
      if (e.key === 'Escape') {
        if (!DOM.modalCreator.hidden) {
          closeModal(DOM.modalCreator);
          return;
        }
        if (!DOM.modalShortcuts.hidden) {
          closeModal(DOM.modalShortcuts);
          return;
        }
        if (!DOM.viewStudy.hidden) {
          switchView('catalogs');
          return;
        }
      }

      // If we are currently studying
      if (!DOM.viewStudy.hidden) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          flipCard();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextCard();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevCard();
        } else if (e.key === '1') {
          e.preventDefault();
          markCard('repeat');
        } else if (e.key === '2') {
          e.preventDefault();
          markCard('known');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          toggleHint();
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          speakCurrentCard();
        }
      }
    });
  }

  function setupDropzone(element, onFileDropped) {
    if (!element) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('dragover');
      }, false);
    });

    element.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        onFileDropped(files[0]);
      }
    });
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
