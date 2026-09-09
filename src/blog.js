/**
 * InstantCred India - High-Converting Credit Guides & Omnibox Autocomplete Engine
 * 
 * Features:
 * 1. Google Chrome Omnibox-style search auto-suggestion dropdown with fuzzy intent matching
 * 2. High-converting credit guides & comparisons modeled after Cred Club, ZetApp & CreditMitra
 * 3. 100% Cuelinks affiliate monetization across comparison tables & in-article CTAs
 * 4. Shareable hash-based deep linking (#guide/slug) with browser back/forward support
 */

import { BLOG_POSTS, BLOG_CATEGORIES, SEARCH_SUGGESTIONS } from './data/blogs.js';
import { CREDIT_CARDS } from './data/cards.js';
import { PERSONAL_LOANS } from './data/loans.js';

export class BlogManager {
  constructor(affiliateManager) {
    this.affiliateManager = affiliateManager;
    this.posts = BLOG_POSTS;
    this.categories = BLOG_CATEGORIES;
    this.suggestions = SEARCH_SUGGESTIONS;
    this.cards = CREDIT_CARDS;
    this.loans = PERSONAL_LOANS;
    
    this.activeCategory = 'all';
    this.activeArticle = null;
    this.selectedIndex = -1;
    this.currentSuggestions = [];

    this.init();
  }

  init() {
    this.renderBlogSection();
    this.initSearchAutocomplete();
    this.initRouting();
  }

  /* --------------------------------------------------------------------------
     1. Google-Style Omnibox Search Autocomplete
     -------------------------------------------------------------------------- */
  initSearchAutocomplete() {
    const searchInput = document.getElementById('searchInput');
    const searchWrapper = document.querySelector('.search-box-wrapper');
    if (!searchInput || !searchWrapper) return;

    let dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'searchAutocompleteDropdown';
      dropdown.className = 'search-autocomplete-dropdown hidden';
      searchWrapper.appendChild(dropdown);
    }

    let debounceTimer = null;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      if (!query || query.length < 2) {
        this.hideDropdown();
        return;
      }

      debounceTimer = setTimeout(() => {
        this.renderSuggestions(query);
      }, 70);
    });

    searchInput.addEventListener('keydown', (e) => {
      const dropdown = document.getElementById('searchAutocompleteDropdown');
      if (!dropdown || dropdown.classList.contains('hidden')) return;

      const items = dropdown.querySelectorAll('.suggestion-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        this.updateActiveSuggestion(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        this.updateActiveSuggestion(items);
      } else if (e.key === 'Enter') {
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          e.preventDefault();
          items[this.selectedIndex].click();
        }
      } else if (e.key === 'Escape') {
        this.hideDropdown();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchWrapper.contains(e.target)) {
        this.hideDropdown();
      }
    });

    // Reopen on focus if query present
    searchInput.addEventListener('focus', () => {
      const query = searchInput.value.trim();
      if (query && query.length >= 2) {
        this.renderSuggestions(query);
      }
    });

    // Support URL query param (?s=credicard or ?q=credicard)
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('s') || urlParams.get('q');
    if (initialQuery && initialQuery.trim().length >= 2) {
      searchInput.value = initialQuery.trim();
      setTimeout(() => {
        this.renderSuggestions(initialQuery.trim());
      }, 150);
    }
  }

  updateActiveSuggestion(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  normalizeQuery(q) {
    return q
      .toLowerCase()
      .replace(/credicard/g, 'credit card')
      .replace(/credcard/g, 'credit card')
      .replace(/cbil/g, 'cibil')
      .replace(/aply/g, 'apply')
      .trim();
  }

  renderSuggestions(rawQuery) {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) return;

    const normalized = this.normalizeQuery(rawQuery);
    const stopWords = new Set(['and', 'the', 'is', 'what', 'which', 'with', 'to', 'for', 'in', 'of']);
    const rawTokens = normalized.split(/\s+/).filter(Boolean);
    const significantTokens = rawTokens.filter(t => !stopWords.has(t));
    const tokens = significantTokens.length > 0 ? significantTokens : rawTokens;

    // 1. Filter matching pre-computed queries (from user screenshots)
    const matchedSuggestions = this.suggestions.filter(s => {
      const target = (s.query + ' ' + (s.highlight || '') + ' ' + (s.tags || []).join(' ')).toLowerCase();
      return tokens.every(token => target.includes(token));
    }).slice(0, 6);

    // 2. Filter matching blog guides
    const matchedBlogs = this.posts.filter(p => {
      const text = (p.title + ' ' + p.summary + ' ' + p.category).toLowerCase();
      return tokens.every(token => text.includes(token));
    }).slice(0, 2);

    // 3. Filter matching credit cards
    const matchedCards = this.cards.filter(c => {
      const text = (c.name + ' ' + c.bank + ' ' + c.category + ' ' + (c.perks || []).join(' ')).toLowerCase();
      return tokens.every(token => text.includes(token));
    }).slice(0, 2);

    if (!matchedSuggestions.length && !matchedBlogs.length && !matchedCards.length) {
      this.hideDropdown();
      return;
    }

    this.selectedIndex = -1;
    let html = '';

    // Primary search query item (Google Omnibox style: "query - Search InstantCred")
    html += `
      <div class="suggestion-item" data-action="search" data-query="${this.escapeHtml(normalized)}">
        <div class="suggestion-left">
          <span class="suggestion-icon">🔍</span>
          <span class="suggestion-text"><strong>${this.escapeHtml(rawQuery)}</strong> <span style="color:#64748b; font-size:0.85rem;">— InstantCred Search</span></span>
        </div>
        <span class="suggestion-badge badge-query">Search</span>
      </div>
    `;

    // Suggestions from Screenshots
    if (matchedSuggestions.length) {
      html += `<div class="suggestion-header">Suggested Searches</div>`;
      matchedSuggestions.forEach((s) => {
        const highlightedText = this.highlightText(s.query, normalized);
        const badgeClass = s.badge === 'Guide' ? 'badge-guide' : (s.badge === 'Card' ? 'badge-card' : 'badge-query');
        html += `
          <div class="suggestion-item" data-action="suggestion" data-slug="${s.targetSlug || ''}" data-card-id="${s.cardId || ''}" data-query="${s.query}">
            <div class="suggestion-left">
              <span class="suggestion-icon">🔍</span>
              <span class="suggestion-text">${highlightedText}</span>
            </div>
            <span class="suggestion-badge ${badgeClass}">${s.badge || 'Search'}</span>
          </div>
        `;
      });
    }

    // Direct Blog Matches
    if (matchedBlogs.length) {
      html += `<div class="suggestion-header">Expert Guides & Reviews</div>`;
      matchedBlogs.forEach((blog) => {
        html += `
          <div class="suggestion-item" data-action="open-guide" data-slug="${blog.slug}">
            <div class="suggestion-left">
              <span class="suggestion-icon">📖</span>
              <span class="suggestion-text"><strong>Guide:</strong> ${this.escapeHtml(blog.title)}</span>
            </div>
            <span class="suggestion-badge badge-guide">${blog.readTime}</span>
          </div>
        `;
      });
    }

    // Direct Card Matches
    if (matchedCards.length) {
      html += `<div class="suggestion-header">Matching Cards</div>`;
      matchedCards.forEach((card) => {
        html += `
          <div class="suggestion-item" data-action="card-filter" data-card-id="${card.id}" data-card-name="${card.name}">
            <div class="suggestion-left">
              <span class="suggestion-icon">💳</span>
              <span class="suggestion-text"><strong>${this.escapeHtml(card.name)}</strong> (${this.escapeHtml(card.bank)})</span>
            </div>
            <span class="suggestion-badge badge-card">₹0 / Waived</span>
          </div>
        `;
      });
    }

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');

    // Attach click listeners to suggestions
    dropdown.querySelectorAll('.suggestion-item').forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        const slug = item.dataset.slug;
        const cardId = item.dataset.cardId;
        const query = item.dataset.query;

        if (slug) {
          this.openArticle(slug);
          this.hideDropdown();
        } else if (cardId) {
          const card = this.cards.find(c => c.id === cardId);
          if (card) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
              searchInput.value = card.name;
              searchInput.dispatchEvent(new Event('input'));
            }
          }
          this.hideDropdown();
        } else if (query) {
          const searchInput = document.getElementById('searchInput');
          if (searchInput) {
            searchInput.value = query;
            searchInput.dispatchEvent(new Event('input'));
          }
          this.hideDropdown();
        }
      });
    });
  }

  highlightText(fullText, query) {
    if (!query) return this.escapeHtml(fullText);
    const escaped = this.escapeHtml(fullText);
    const words = query.split(/\s+/).filter(w => w.length > 1);
    if (!words.length) return escaped;

    const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return escaped.replace(regex, '<strong>$1</strong>');
  }

  hideDropdown() {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
      this.selectedIndex = -1;
    }
  }

  /* --------------------------------------------------------------------------
     2. Homepage Credit Guides Section
     -------------------------------------------------------------------------- */
  renderBlogSection() {
    const section = document.getElementById('creditGuidesSection');
    if (!section) return;

    let filteredPosts = this.posts;
    if (this.activeCategory !== 'all') {
      filteredPosts = this.posts.filter(p => p.category === this.activeCategory);
    }

    section.innerHTML = `
      <div class="blog-section-header">
        <span class="blog-section-tag">📚 Expert Insights & Reviews</span>
        <h2 class="blog-section-title">Credit Card Guides & Comparisons</h2>
        <p class="blog-section-subtitle">
          In-depth, numbers-backed guides to finding zero-fee cards, free airport lounge access, student approvals, and maximum UPI cashback.
        </p>
      </div>

      <!-- Category Filter Chips -->
      <div class="blog-chips-bar" id="blogChipsBar">
        ${this.categories.map(c => `
          <button type="button" class="blog-chip ${this.activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
            ${c.label}
          </button>
        `).join('')}
      </div>

      <!-- Articles Grid -->
      <div class="blog-grid">
        ${filteredPosts.map(post => `
          <article class="blog-card" data-slug="${post.slug}">
            <div class="blog-card-media">
              <img src="${post.heroImage}" alt="${this.escapeHtml(post.title)}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80';" />
              <span class="blog-card-badge">${post.coverBadge}</span>
            </div>
            <div class="blog-card-body">
              <div class="blog-card-meta">
                <span>🗓️ ${post.publishedAt}</span>
                <span>•</span>
                <span>⏱️ ${post.readTime}</span>
              </div>
              <h3 class="blog-card-title">${this.escapeHtml(post.title)}</h3>
              <p class="blog-card-summary">${this.escapeHtml(post.summary)}</p>
              <div class="blog-card-footer">
                <span class="blog-read-btn">Read Full Guide &rarr;</span>
                <span style="font-size:0.75rem; color:#10b981; font-weight:700;">Verified Offers</span>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    // Chip listeners
    section.querySelectorAll('.blog-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.activeCategory = chip.dataset.cat;
        this.renderBlogSection();
      });
    });

    // Card click listeners
    section.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', () => {
        this.openArticle(card.dataset.slug);
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. Blog Reader Modal & Deep View
     -------------------------------------------------------------------------- */
  openArticle(slug, updateHistory = true) {
    const post = this.posts.find(p => p.slug === slug);
    if (!post) return;

    this.activeArticle = post;

    // Clean SEO Path-based routing: /blogs/:slug (e.g. https://www.instantcred.in/blogs/what-is-upi-credit-card)
    const targetPath = `/blogs/${slug}`;
    if (updateHistory) {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ slug }, `${post.title} | InstantCred`, targetPath);
      }
    }
    document.title = `${post.title} | InstantCred India`;

    // Dynamic SEO & OpenGraph meta updates
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `https://www.instantcred.in${targetPath}`;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = `https://www.instantcred.in${targetPath}`;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = `${post.title} | InstantCred India`;

    let modal = document.getElementById('blogReaderModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'blogReaderModal';
      modal.className = 'blog-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="blog-reader-wrapper">
        <!-- Top Navigation Sticky Bar -->
        <div class="blog-reader-topbar">
          <div class="blog-reader-brand-group">
            <a href="/" class="blog-brand-link" id="blogReaderHomeLink">
              <span class="blog-brand-text">Instant<span>Cred</span></span>
            </a>
            <span class="blog-reader-sep">/</span>
            <span class="blog-reader-tag">${this.escapeHtml(post.category.toUpperCase())} GUIDE</span>
          </div>
          
          <div class="blog-reader-topbar-actions">
            <button type="button" class="blog-share-btn" id="blogReaderShareBtn" title="Copy article link to share">
              <span>🔗</span> <span class="share-btn-label">Share Guide</span>
            </button>
            <button type="button" class="blog-back-btn" id="blogReaderBackBtn">
              &larr; Back to Cards Directory
            </button>
            <button type="button" class="blog-close-btn" id="blogReaderCloseBtn" title="Close Guide">&times;</button>
          </div>
        </div>

        <!-- Article Hero Header -->
        <header class="blog-article-hero">
          <nav class="blog-breadcrumbs">
            <a href="/" class="breadcrumb-home">Home</a>
            <span>&rsaquo;</span>
            <a href="#credit-guides-section" class="breadcrumb-guides">Credit Guides</a>
            <span>&rsaquo;</span>
            <span>${this.escapeHtml(post.category)}</span>
          </nav>
          <h1 class="blog-article-title">${this.escapeHtml(post.title)}</h1>
          <p class="blog-article-subtitle">${this.escapeHtml(post.subtitle)}</p>
          
          <div class="blog-article-meta-row">
            <div class="blog-author-group">
              <div class="blog-author-avatar">IC</div>
              <div class="blog-author-info">
                <span class="blog-author-name">${post.author}</span>
                <span class="blog-author-date">Published: ${post.publishedAt} • ${post.readTime}</span>
              </div>
            </div>
            <div class="blog-affiliate-badge">
              <span>🛡️ Verified Cuelinks Partner Links</span>
            </div>
          </div>

          ${post.heroImage ? `
            <div class="blog-article-hero-cover">
              <img src="${post.heroImage}" alt="${this.escapeHtml(post.title)}" class="blog-reader-hero-img" loading="eager" />
            </div>
          ` : ''}
        </header>

        <!-- Main Content Area with Sticky TOC -->
        <div class="blog-content-layout">
          <!-- Sticky Table of Contents -->
          <aside class="blog-toc">
            <div class="blog-toc-header">
              <span class="blog-toc-title">Table of Contents</span>
              <span class="blog-toc-badge">${post.readTime}</span>
            </div>
            <ul class="blog-toc-list">
              <li><a href="#toc-overview">Summary & Comparison</a></li>
              ${post.sections.map((sec, idx) => `
                <li><a href="#toc-sec-${idx}">${this.escapeHtml(sec.heading.replace(/^[\d.]+\s*/, ''))}</a></li>
              `).join('')}
              ${post.featuredCardIds && post.featuredCardIds.length ? `<li><a href="#toc-card-reviews">Featured Card Reviews</a></li>` : ''}
              ${post.faqs ? `<li><a href="#toc-faqs">Frequently Asked Questions</a></li>` : ''}
            </ul>
          </aside>

          <!-- Article Body -->
          <div class="blog-prose">
            <div id="toc-overview">
              <h2>Quick Comparison Matrix</h2>
              <p>${this.escapeHtml(post.summary)}</p>
              
              <!-- Comparison Table with 100% Cuelinks Monetization -->
              ${this.renderComparisonTable(post.comparisonTable)}
            </div>

            <!-- Content Sections -->
            ${post.sections.map((sec, idx) => `
              <section id="toc-sec-${idx}">
                <h2>${this.escapeHtml(sec.heading)}</h2>
                ${this.formatMarkdownToHtml(sec.content)}
              </section>
            `).join('')}

            <!-- ZetApp Style Detailed Card Reviews -->
            ${this.renderFeaturedCardCallouts(post.featuredCardIds, post.slug)}

            <!-- FAQs Section -->
            ${post.faqs ? `
              <section id="toc-faqs" class="blog-faqs-box">
                <h3 class="blog-faqs-title">Frequently Asked Questions</h3>
                ${post.faqs.map(faq => `
                  <div class="blog-faq-item">
                    <div class="blog-faq-q">Q: ${this.escapeHtml(faq.question)}</div>
                    <div class="blog-faq-a">${this.escapeHtml(faq.answer)}</div>
                  </div>
                `).join('')}
              </section>
            ` : ''}
          </div>
        </div>

        <!-- Related Guides Footer -->
        <div class="blog-related-bar">
          <div class="blog-related-title">You May Also Like</div>
          <div class="blog-related-grid">
            ${this.posts.filter(p => p.slug !== post.slug).slice(0, 3).map(rel => `
              <div class="blog-related-card" data-slug="${rel.slug}">
                <div class="blog-related-tag">${rel.category}</div>
                <div class="blog-related-heading">${this.escapeHtml(rel.title)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Event handlers
    const closeBtn = document.getElementById('blogReaderCloseBtn');
    const backBtn = document.getElementById('blogReaderBackBtn');
    const shareBtn = document.getElementById('blogReaderShareBtn');
    const closeModal = () => this.closeArticle();

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backBtn) backBtn.addEventListener('click', closeModal);

    // Share button handler: copies canonical blog link https://www.instantcred.in/blogs/:slug
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const shareUrl = `https://www.instantcred.in/blogs/${post.slug}`;
        const label = shareBtn.querySelector('.share-btn-label');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
          } else {
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
          }
          if (label) label.textContent = 'Copied!';
          setTimeout(() => { if (label) label.textContent = 'Share Guide'; }, 2200);
        } catch (err) {
          console.warn('Share copy error:', err);
        }
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Related cards click handlers
    modal.querySelectorAll('.blog-related-card').forEach(c => {
      c.addEventListener('click', () => {
        this.openArticle(c.dataset.slug);
        modal.scrollTop = 0;
      });
    });

    // Also Read contextual links click handlers
    modal.querySelectorAll('.blog-also-read-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = link.dataset.slug;
        if (slug) {
          this.openArticle(slug);
          modal.scrollTop = 0;
        }
      });
    });

    const homeLink = document.getElementById('blogReaderHomeLink');
    if (homeLink) {
      homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    // Breadcrumbs navigation handlers
    modal.querySelectorAll('.blog-breadcrumbs a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const href = a.getAttribute('href');
        closeModal();
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Smooth scroll for TOC links
    modal.querySelectorAll('.blog-toc-list a').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href').replace('#', '');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  closeArticle(updateHistory = true) {
    const modal = document.getElementById('blogReaderModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
    this.activeArticle = null;
    document.title = 'InstantCred India | Credit Card Comparison, Loans & Rewards Calculator';

    // Reset SEO canonical & OpenGraph tags
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://www.instantcred.in/';
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = 'https://www.instantcred.in/';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = 'InstantCred India | Best Credit Card Reviews, Comparisons & Rewards Calculator';

    if (updateHistory) {
      if (window.location.pathname.startsWith('/blogs') || window.location.pathname.startsWith('/blog') || window.location.hash.startsWith('#guide/')) {
        window.history.pushState({}, document.title, '/#credit-guides-section');
      }
    }
  }

  /* --------------------------------------------------------------------------
     4. Dynamic Cuelinks URL Resolution & Comparison Tables
     -------------------------------------------------------------------------- */
  resolveCardUrl(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return 'https://www.instantcred.in';
    if (this.affiliateManager && typeof this.affiliateManager.resolveUrl === 'function') {
      return this.affiliateManager.resolveUrl(card);
    }
    return card.affiliateUrl || card.directUrl || 'https://www.instantcred.in';
  }

  resolveLoanUrl(loanId) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) return 'https://www.instantcred.in/#loans-section';
    if (this.affiliateManager && typeof this.affiliateManager.resolveUrl === 'function') {
      return this.affiliateManager.resolveUrl(loan);
    }
    return loan.affiliateUrl || loan.directUrl || 'https://www.instantcred.in/#loans-section';
  }

  renderComparisonTable(tableData) {
    if (!tableData || !tableData.length) return '';

    return `
      <div class="blog-table-wrapper">
        <table class="blog-table">
          <thead>
            <tr>
              <th>Credit Card</th>
              <th>Annual Fee</th>
              <th>Best For</th>
              <th>Top Highlight</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${tableData.map(row => {
              const applyUrl = this.resolveCardUrl(row.cardId);
              return `
                <tr>
                  <td class="blog-table-card-name">${this.escapeHtml(row.name)}</td>
                  <td><span style="color:#059669; font-weight:700;">${this.escapeHtml(row.annualFee)}</span></td>
                  <td>${this.escapeHtml(row.bestFor)}</td>
                  <td>${this.escapeHtml(row.topPerk)}</td>
                  <td><span style="color:#eab308;">★</span> ${row.rating}</td>
                  <td>
                    <a href="${applyUrl}" target="_blank" rel="noopener noreferrer" class="blog-table-btn">
                      Apply Now &rarr;
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderFeaturedCardCallouts(featuredCardIds, currentSlug) {
    if (!featuredCardIds || !featuredCardIds.length) return '';

    const cards = featuredCardIds
      .map(id => this.cards.find(c => c.id === id))
      .filter(Boolean);

    if (!cards.length) return '';

    const relatedPosts = this.posts.filter(p => p.slug !== currentSlug);

    return `
      <section id="toc-card-reviews" class="blog-editorial-reviews-section">
        <h2 class="blog-editorial-section-title">Detailed Reviews of Recommended Credit Cards</h2>
        <p class="blog-editorial-section-subtitle">In-depth analysis of reward structures, fees, eligibility, and direct bank partner links.</p>
        
        <div class="blog-editorial-cards-stack">
          ${cards.map((card, idx) => {
            const applyUrl = this.resolveCardUrl(card.id);
            const related = relatedPosts[idx % relatedPosts.length] || relatedPosts[0];
            const feeLabel = (card.isLifetimeFree || card.annualFee === 0) 
              ? '₹0 Lifetime Free' 
              : `₹${card.annualFee} / Year`;

            return `
              <article class="blog-editorial-review-card" id="card-review-${card.id}">
                <div class="blog-editorial-review-top">
                  <div class="blog-editorial-title-box">
                    <span class="blog-editorial-card-num">#0${idx + 1}</span>
                    <h3 class="blog-editorial-review-title">${this.escapeHtml(card.name)}</h3>
                  </div>
                  <div class="blog-editorial-badges-row">
                    <span class="blog-editorial-badge badge-fee">${feeLabel}</span>
                    <span class="blog-editorial-badge badge-bank">${this.escapeHtml(card.bank)}</span>
                    <span class="blog-editorial-badge badge-rating">★ ${card.rating || '4.8'} / 5</span>
                  </div>
                </div>

                <div class="blog-editorial-review-body">
                  <p class="blog-editorial-lead">${this.escapeHtml(card.cashbackSummary || card.tag || '')}</p>
                  
                  <div class="blog-editorial-perks-box">
                    <div class="blog-editorial-perks-title">Key Highlights:</div>
                    <ul class="blog-editorial-perks-list">
                      ${(card.keyPerks || []).slice(0, 4).map(p => `<li>${this.escapeHtml(p)}</li>`).join('')}
                    </ul>
                  </div>

                  ${card.pros && card.pros.length ? `
                    <p class="blog-editorial-bestfor">
                      <strong>Best For:</strong> ${this.escapeHtml(card.pros[0])}
                    </p>
                  ` : ''}

                  <!-- ZetApp Style "Also Read" Contextual Interlinking -->
                  ${related ? `
                    <div class="blog-also-read">
                      <span class="blog-also-read-label">Also Read:</span>
                      <a href="#guide/${related.slug}" class="blog-also-read-link" data-slug="${related.slug}">${this.escapeHtml(related.title)} &rarr;</a>
                    </div>
                  ` : ''}

                  <!-- High-Converting Editorial Action Banner -->
                  <div class="blog-editorial-action-banner">
                    <div class="blog-editorial-action-info">
                      <span class="blog-editorial-action-title">Apply directly through verified partner portal</span>
                      <span class="blog-editorial-action-sub">100% paperless digital KYC • Zero joining charges • Instant approval</span>
                    </div>
                    <a href="${applyUrl}" target="_blank" rel="noopener noreferrer" class="blog-editorial-apply-btn">
                      Apply for ${this.escapeHtml(card.name)} Online &rarr;
                    </a>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  formatMarkdownToHtml(markdown) {
    if (!markdown) return '';
    return markdown
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/<li>.*<\/li>/gs, (m) => `<ul>${m}</ul>`)
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Markdown Images: ![Alt Caption](image_url) - processed before links!
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, (match, alt, src) => {
        return `<figure class="blog-inarticle-image-wrap"><img src="${src.trim()}" alt="${this.escapeHtml(alt.trim())}" class="blog-inarticle-img" loading="lazy" />${alt.trim() ? `<figcaption class="blog-inarticle-caption"><span class="caption-icon">📸</span> ${this.escapeHtml(alt.trim())}</figcaption>` : ''}</figure>`;
      })
      // ZetApp Style Embedded In-Article Affiliate Banner
      // Syntax: :::promo:card_id:TITLE:SUBTITLE:::
      .replace(/:::promo:([a-zA-Z0-9_-]+):([^:]+):([^:]+):::/gim, (match, cardId, title, sub) => {
        const applyUrl = this.resolveCardUrl(cardId.trim());
        return `
          <div class="blog-inarticle-promo-banner">
            <div class="promo-banner-content">
              <span class="promo-banner-eyebrow">Featured Partner Recommendation</span>
              <h4 class="promo-banner-title">${this.escapeHtml(title.trim())}</h4>
              <p class="promo-banner-subtitle">${this.escapeHtml(sub.trim())}</p>
            </div>
            <div class="promo-banner-action">
              <div class="promo-banner-card-preview">
                <span class="promo-card-chip">💳</span>
                <span class="promo-card-brand">RuPay UPI</span>
              </div>
              <a href="${applyUrl}" target="_blank" rel="noopener noreferrer" class="promo-banner-apply-btn">
                Apply Now &rarr;
              </a>
            </div>
          </div>
        `;
      })
      // Contextual In-Text Affiliate Links: [Card Name](card:card_id) or [Loan Name](loan:loan_id)
      .replace(/\[([^\]]+)\]\((card|loan):([^\)]+)\)/gim, (match, label, type, id) => {
        const cleanId = id.trim();
        const url = type === 'card' ? this.resolveCardUrl(cleanId) : this.resolveLoanUrl(cleanId);
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="blog-intext-affiliate-link" title="Apply for ${this.escapeHtml(label)} via official partner">${this.escapeHtml(label)} <span class="intext-aff-icon">↗</span></a>`;
      })
      // Standard markdown external links: [Label](https://...)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/gim, (match, label, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="blog-intext-link">${this.escapeHtml(label)}</a>`;
      })
      .replace(/\n\n+/g, '</p><p>')
      .replace(/^(.+)$/gim, (line) => {
        if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<li') || line.startsWith('</') || line.startsWith('<figure') || line.startsWith('<figcaption') || line.startsWith('<img') || line.startsWith('<div')) {
          return line;
        }
        return `<p>${line}</p>`;
      });
  }

  initRouting() {
    const handleRoute = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      // 1. Path-based routing: /blogs/:slug or /blog/:slug (e.g. /blogs/what-is-upi-credit-card)
      const pathMatch = pathname.match(/^\/blogs?\/([a-zA-Z0-9_-]+)\/?$/);
      if (pathMatch && pathMatch[1]) {
        const slug = pathMatch[1];
        this.openArticle(slug, false);
        return;
      }

      // 2. Hash-based backward compatibility: #guide/:slug or #blog/:slug
      if (hash.startsWith('#guide/')) {
        const slug = hash.replace('#guide/', '');
        this.openArticle(slug, true);
        return;
      }
      if (hash.startsWith('#blog/')) {
        const slug = hash.replace('#blog/', '');
        this.openArticle(slug, true);
        return;
      }

      // 3. User pressed browser Back button to homepage root
      if (this.activeArticle) {
        this.closeArticle(false);
      }
    };

    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);

    // Initial check on page load
    setTimeout(handleRoute, 40);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
