import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Menu, Eye, Play } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onOpenApp }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(0);
  const [demoRep, setDemoRep] = useState(2); // 0-indexed, so 3rd rep

  const methodData = [
    { badge: 'looking', label: 'Looking · Rep 3/10', blurred: false, dots: 10, filled: 3, verse: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ' },
    { badge: 'looking', label: 'Looking · Rep 2/3', blurred: false, dots: 3, filled: 2, verse: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ' },
    { badge: 'memory', label: 'Memory · Rep 1/3', blurred: true, dots: 3, filled: 1, verse: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const advanceDemo = () => {
    const d = methodData[activeMethod];
    setDemoRep((prev) => (prev + 1) % d.dots);
  };

  const selectMethod = (idx) => {
    setActiveMethod(idx);
    setDemoRep(0);
  };

  // Scroll reveal logic
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const d = methodData[activeMethod];
  const isMemory = d.badge === 'memory';

  return (
    <div className="landing-body">
      {/* NAV */}
      <nav className="landing-nav">
        <a href="#" className="nav-brand">
          <div className="nav-logo">ح</div>
          <span className="nav-name">Hifz</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#methods">Methods</a>
          <a href="#quiz">Quiz</a>
          <a href="#fonts">Scripts</a>
          <button className="nav-cta" onClick={onOpenApp}>Open App <ArrowRight size={16} style={{ display: 'inline', marginLeft: '4px' }} /></button>
        </div>
        <button className="nav-mobile-btn" onClick={toggleMenu} aria-label="Menu">
          <Menu size={22} />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <a href="#features" onClick={toggleMenu}>Features</a>
        <a href="#methods" onClick={toggleMenu}>Methods</a>
        <a href="#quiz" onClick={toggleMenu}>Quiz</a>
        <a href="#fonts" onClick={toggleMenu}>Scripts</a>
        <button className="cta" onClick={() => { toggleMenu(); onOpenApp(); }}>Open App →</button>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-eyebrow animate-fadeup">
            <span className="hero-dot"></span>
            Quranic Memorization Platform
          </div>
          <h1 className="animate-fadeup delay-1">
            Memorize the Quran<br /><span>the way scholars do</span>
          </h1>
          <p className="hero-desc animate-fadeup delay-2">
            A full-featured digital tool for ḥifẓ — with proven repetition methods, multi-script Arabic rendering, intelligent quizzes, and audio drills. Built on the Quran Foundation API.
          </p>
          <div className="hero-actions animate-fadeup delay-3">
            <button onClick={onOpenApp} className="btn-primary">
              Start Memorizing
              <ArrowRight size={16} />
            </button>
            <a href="#features" className="btn-secondary">See Features</a>
          </div>
          <div className="hero-trust animate-fadeup delay-4">
            <div className="trust-avatars">
              <span>AS</span><span>MK</span><span>FA</span><span>ZH</span>
            </div>
            <span>Trusted by <strong>1,200+</strong> students worldwide</span>
          </div>
        </div>

        <div className="hero-visual animate-fadeup delay-2">
          <div className="float">
            <div className="hero-card">
              <div className="hero-card-top">
                <span className="verse-badge">Al-Fatihah · 1:4</span>
                <span className="step-badge">
                  <Eye size={14} className="eye-icon" />
                  Looking · Rep 5/20
                </span>
              </div>
              <div className="verse-arabic">مَٰلِكِ يَوْمِ ٱلدِّينِ</div>
              <div className="verse-translation">Master of the Day of Judgment</div>
              <div className="progress-row">
                <div className="progress-dots">
                  <span className="done"></span><span className="done"></span><span className="done"></span>
                  <span className="done"></span><span className="current"></span>
                  <span></span><span></span><span></span>
                </div>
                <span className="progress-label">Rep 5 of 20</span>
                <button className="next-btn" onClick={advanceDemo}>
                  Next
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            <div className="float-chip chip-tl">
              <span className="chip-icon">🧠</span> 3×3 Method active
            </div>
            <div className="float-chip chip-br">
              <span className="chip-icon">🔊</span> Audio drill ready
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-band">
        <div className="stats-inner">
          <div className="stat-item reveal">
            <div className="stat-num">114</div>
            <div className="stat-label">Surahs available</div>
          </div>
          <div className="stat-item reveal">
            <div className="stat-num">6,236</div>
            <div className="stat-label">Verses indexed</div>
          </div>
          <div className="stat-item reveal">
            <div className="stat-num">4</div>
            <div className="stat-label">Arabic scripts</div>
          </div>
          <div className="stat-item reveal">
            <div className="stat-num">3</div>
            <div className="stat-label">Ḥifẓ methods</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="landing-section">
        <div className="section-inner">
          <div className="reveal">
            <p className="section-label">Everything you need</p>
            <h2>Built for serious students of the Quran</h2>
            <p className="section-desc">Every feature is purpose-built for memorization — from multi-script rendering to spaced repetition and intelligent self-testing.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card reveal">
              <div className="feature-icon teal">📖</div>
              <h3>Multi-Script Arabic Reader</h3>
              <p>Render the Quran in QCF Mushaf V2, Tajweed-coloured V4, Uthmani, or IndoPak Nastaleeq — all beautifully typeset using official QCF fonts loaded per-page.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon gold">🧠</div>
              <h3>Memorization Engine</h3>
              <p>Three classical ḥifẓ methods (20/20, 3×3, 3-10) with a progress ring, dot indicators, and text-blur for "from memory" phases. Keyboard shortcuts included.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon teal">🔊</div>
              <h3>Audio Repeat Drills</h3>
              <p>Loop any verse up to 20 times with word-level highlighting driven by per-millisecond timestamps from the Quran Foundation audio API.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon gold">✏️</div>
              <h3>Three Quiz Modes</h3>
              <p>Word Order (arrange shuffled tiles RTL), Write (type missing words), and Letters (tap the correct missing letter from four options). Diacritic-tolerant checking.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon green">🔗</div>
              <h3>Bridge Mode</h3>
              <p>Display the previous verse in a faded overlay above the current one — the classical technique for memorizing the connection between consecutive verses.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon teal">✂️</div>
              <h3>Chunk Splitting</h3>
              <p>Break any verse into 2–5 word segments and drill each chunk independently. Ideal for long ayahs. Chunks flow right-to-left to match Arabic reading order.</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: 'var(--bg)', padding: '0 max(20px,5vw)' }}><div className="divider"></div></div>

      {/* METHODS */}
      <section id="methods" className="landing-section methods-section">
        <div className="section-inner">
          <div className="methods-wrap">
            <div>
              <div className="reveal">
                <p className="section-label">Repetition Methods</p>
                <h2>Choose the method that fits your style</h2>
                <p className="section-desc">All three methods are rooted in classical ḥifẓ tradition, digitally enhanced for focus and tracking.</p>
              </div>
              <div className="method-list">
                <div className={`method-item ${activeMethod === 0 ? 'active' : ''}`} onClick={() => selectMethod(0)}>
                  <div className="method-num">20</div>
                  <div>
                    <h4>20/20 Method</h4>
                    <p>Read with text visible 20 times, then recite from memory 20 times. Total immersion before recall.</p>
                  </div>
                </div>
                <div className={`method-item ${activeMethod === 1 ? 'active' : ''}`} onClick={() => selectMethod(1)}>
                  <div className="method-num">3×3</div>
                  <div>
                    <h4>3×3 Method</h4>
                    <p>3 looking → 3 memory. Every 3 verses, a Unit Review overlay shows all three for consolidation.</p>
                  </div>
                </div>
                <div className={`method-item ${activeMethod === 2 ? 'active' : ''}`} onClick={() => selectMethod(2)}>
                  <div className="method-num">3-10</div>
                  <div>
                    <h4>3–10 Method</h4>
                    <p>10 repetitions with text, then 3 from memory. Deeper encoding before the first recall attempt.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="method-visual">
                <div className="mv-header">
                  <span className={`mv-badge ${d.badge}`}>
                    {d.label.replace(/Rep \d+/, `Rep ${demoRep + 1}`)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Al-Ikhlas · 112:1</span>
                </div>
                <div className={`mv-verse ${isMemory ? 'blurred' : ''}`}>
                  {d.verse}
                </div>
                <div className="mv-controls">
                  <div className="mv-dots">
                    {[...Array(d.dots)].map((_, i) => (
                      <span key={i} className={i < demoRep ? (isMemory ? 'd-gold' : 'd') : ''}></span>
                    ))}
                  </div>
                  <button className="mv-btn" onClick={advanceDemo}>Next →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIZ */}
      <section id="quiz" className="landing-section">
        <div className="section-inner">
          <div className="reveal">
            <p className="section-label">Self-Testing</p>
            <h2>Quiz yourself three different ways</h2>
            <p className="section-desc">Active recall is the most effective memory technique. Our quiz modes make it painless — and even fun.</p>
          </div>

          <div className="quiz-preview">
            <div className="quiz-card reveal">
              <span className="quiz-tag">Word Order</span>
              <h4>Arrange the Verse</h4>
              <p>Shuffled Arabic word tiles appear — tap them in the correct order. Tiles flow right-to-left just like Arabic reading.</p>
              <div className="quiz-demo-tiles">
                <div className="tile normal">أَحَدٌ</div>
                <div className="tile placed">ٱللَّهُ</div>
                <div className="tile placed">هُوَ</div>
                <div className="tile placed">قُلۡ</div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--muted)' }}>↑ Answer zone (tap to return)</div>
            </div>

            <div className="quiz-card reveal">
              <span className="quiz-tag">Write Mode</span>
              <h4>Fill the Blanks</h4>
              <p>Random words are hidden. Type the missing Arabic — diacritics (tashkeel) are stripped before checking, so you're never penalised for them.</p>
              <div className="blank-input-demo" dir="rtl">
                أَحَدٌ <span className="blank-slot">ٱللَّهُ</span> هُوَ قُلۡ
              </div>
            </div>

            <div className="quiz-card reveal">
              <span className="quiz-tag">Letters Mode</span>
              <h4>Pick the Missing Letter</h4>
              <p>A word is shown with one letter replaced by □. Choose the correct letter from four options — no typing required.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <span className="font-quran" style={{ fontSize: '22px', direction: 'rtl', color: 'var(--ink)' }}>ٱل□َّهُ</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--bg)', fontFamily: "'UthmanicHafs',serif", fontSize: '18px', cursor: 'pointer', color: 'var(--ink)' }}>ب</button>
                  <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid #16a34a', background: '#dcfce7', fontFamily: "'UthmanicHafs',serif", fontSize: '18px', cursor: 'pointer', color: '#16a34a' }}>ل</button>
                  <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--bg)', fontFamily: "'UthmanicHafs',serif", fontSize: '18px', cursor: 'pointer', color: 'var(--ink)' }}>م</button>
                  <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--bg)', fontFamily: "'UthmanicHafs',serif", fontSize: '18px', cursor: 'pointer', color: 'var(--ink)' }}>ن</button>
                </div>
              </div>
            </div>

            <div className="quiz-card reveal">
              <span className="quiz-tag">Audio Drill</span>
              <h4>Listen & Repeat</h4>
              <p>Select any verse and loop count. Each word highlights as it is recited — using millisecond-accurate timestamps from the audio API.</p>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'var(--teal-l)', borderRadius: '8px', fontSize: '13px', color: 'var(--teal)', fontWeight: '600' }}>
                  <Play size={14} fill="var(--teal)" />
                  Repeat × 5
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Word highlight active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: 'var(--bg)', padding: '0 max(20px,5vw)' }}><div className="divider"></div></div>

      {/* FONTS */}
      <section id="fonts" className="landing-section fonts-section">
        <div className="section-inner">
          <div className="reveal">
            <p className="section-label">Arabic Scripts</p>
            <h2>Four beautiful scripts, one verse</h2>
            <p className="section-desc">Switch between scripts instantly. Each uses the official QCF fonts loaded per Mushaf page for pixel-perfect rendering.</p>
          </div>

          <div className="fonts-grid">
            <div className="font-card reveal">
              <div className="font-name">QCF V2 · Mushaf</div>
              <div className="font-sample font-quran">بِسۡمِ ٱللهِ</div>
              <div className="font-card-footer">Default · Madani Mushaf layout</div>
            </div>
            <div className="font-card reveal">
              <div className="font-name">QCF V4 · Tajweed</div>
              <div className="font-sample font-quran" style={{ color: 'var(--teal)' }}>بِسۡمِ ٱللهِ</div>
              <div className="font-card-footer">Tajweed rules coloured · COLRv1</div>
            </div>
            <div className="font-card reveal">
              <div className="font-name">Uthmani Unicode</div>
              <div className="font-sample font-quran">بِسۡمِ ٱللهِ</div>
              <div className="font-card-footer">Single-file · Universal support</div>
            </div>
            <div className="font-card reveal">
              <div className="font-name">IndoPak Nastaleeq</div>
              <div className="font-sample" style={{ fontFamily: "'IndoPak','Noto Nastaliq Urdu',serif", fontSize: '28px', direction: 'rtl', textAlign: 'right', color: 'var(--ink)' }}>بِسۡمِ ٱللهِ</div>
              <div className="font-card-footer">South Asian calligraphic style</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="cta">
        <div className="arabic-bg">اقرأ</div>
        <div className="cta-inner reveal">
          <h2>Begin your ḥifẓ journey today</h2>
          <p>Open the reader, select any Surah, and your first drill is three clicks away. No account required to start.</p>
          <button onClick={onOpenApp} className="btn-light">
            Open Hifz App
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <div className="footer-logo">ح</div>
              <span className="footer-brand-name">Hifz</span>
            </div>
            <p className="footer-tagline">A Quran memorization platform built on the Quran Foundation Content & User APIs.</p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <a href="#">Reader</a>
            <a href="#">Memorize</a>
            <a href="#">Audio Drill</a>
            <a href="#">Quiz</a>
          </div>
          <div className="footer-col">
            <h5>Docs</h5>
            <a href="#">API Reference</a>
            <a href="#">Font Rendering</a>
            <a href="#">OAuth Setup</a>
            <a href="#">Content API</a>
          </div>
          <div className="footer-col">
            <h5>Community</h5>
            <a href="#">GitHub</a>
            <a href="#">Discord</a>
            <a href="#">Changelog</a>
            <a href="#">Roadmap</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Hifz. Built with Quran Foundation APIs.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
