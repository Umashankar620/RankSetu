'use client';

import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const MEDALS = ['🥇', '🥈', '🥉'];

const BucketBadge = ({ emoji, label, count, color }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
    style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
    <div className="flex items-center gap-2.5">
      <span className="text-xl">{emoji}</span>
      <span className="font-bold text-base text-white">{label}</span>
    </div>
    <span className="text-3xl font-black" style={{ color }}>{count}</span>
  </div>
);

const TopCollegeRow = ({ name, idx }) => (
  <div className="flex items-center gap-2 py-1">
    <span className="text-sm">{MEDALS[idx]}</span>
    <span className="text-xs text-white/90 font-semibold truncate">{name.split('(')[0].trim()}</span>
  </div>
);

export default function ShareCard({ darkMode, shareData: shareDataProp, onBack, showToast }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shareData = shareDataProp || (() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('ranksetu_share_data');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  })();

  useEffect(() => {
    if (shareData?.rank) {
      setError(null);
    } else if (isMounted) {
      setError('No data to share. Please go back and generate your list first.');
    }
  }, [shareData, isMounted]);

  // Auto-generate image only once on mount
  useEffect(() => {
    if (isMounted && shareData && !error && !imageUrl && !isGenerating) {
      generateImage();
    }
  }, [isMounted, shareData, error, imageUrl, isGenerating]);

  const generateImage = async () => {
    if (!cardRef.current || isGenerating) return;
    
    setIsGenerating(true);
    setLoading(true);
    setError(null);
    
    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        allowTaint: false,
        onclone: (clonedDoc, element) => {
          // Ensure cloned element has proper styles
          console.log('Clone ready');
        }
      });
      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate image. Please try again.');
      showToast?.('Card generation failed');
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const downloadPNG = async () => {
    if (!imageUrl) {
      // If no image URL, generate fresh
      await generateImage();
      // Wait a bit for the image to be set
      setTimeout(() => {
        if (imageUrl) {
          const a = document.createElement('a');
          a.download = `NEET_Rank_${shareData.rank}_RankSetu.png`;
          a.href = imageUrl;
          a.click();
          showToast?.('📥 Image downloaded!');
        }
      }, 500);
      return;
    }
    
    const a = document.createElement('a');
    a.download = `NEET_Rank_${shareData.rank}_RankSetu.png`;
    a.href = imageUrl;
    a.click();
    showToast?.('📥 Image downloaded!');
  };

  const shareToWhatsApp = () => {
    const topColleges = [
      ...(shareData.topDream || []).slice(0, 1),
      ...(shareData.topTarget || []).slice(0, 1),
      ...(shareData.topSafe || []).slice(0, 1),
    ].map(n => n.split('(')[0].trim());

    const collegeText = topColleges.length
      ? `\n🏥 Top picks:\n${topColleges.map((c, i) => `${MEDALS[i]} ${c}`).join('\n')}`
      : '';

    const text = `🎯 My NEET 2026 Optimised List — RankSetu\n\n📊 Rank: ${shareData.rank.toLocaleString()} | ${shareData.category}\n✅ ${shareData.dreamCount} Dream · ${shareData.targetCount} Target · ${shareData.safeCount} Safe${collegeText}\n\n🔗 Get yours free: ${window.location.origin}/optimizer\n#NEET2026 #RankSetu`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/optimizer`);
    showToast?.('🔗 Link copied!');
  };

  const regenerateImage = () => {
    setImageUrl(null);
    generateImage();
  };

  const getMedalLabel = () => {
    if (shareData?.dreamCount >= 5) return { icon: '🏆', text: 'Champion Pick' };
    if (shareData?.dreamCount >= 3) return { icon: '🥇', text: 'Strong Profile' };
    if (shareData?.dreamCount >= 1) return { icon: '🎯', text: 'Great Options' };
    return { icon: '📋', text: 'Good Start' };
  };

  // Don't render on server
  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!shareData || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-accent" />
        <p className="text-accent text-center">{error || 'Invalid share data'}</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-primary text-white rounded font-bold text-sm hover:bg-interactive transition">
          ← Back to Optimizer
        </button>
      </div>
    );
  }

  const medal = getMedalLabel();
  const topDream = (shareData.topDream || []).slice(0, 3);
  const topTarget = (shareData.topTarget || []).slice(0, 1);
  const topSafe = (shareData.topSafe || []).slice(0, 1);
  const showColleges = [...topDream, ...topTarget, ...topSafe].slice(0, 3);

  return (
    <>
      <Helmet>
        <title>My NEET Optimised List — RankSetu</title>
        <meta property="og:title" content={`NEET Rank ${shareData.rank} | ${shareData.dreamCount} Dream Colleges`} />
        <meta property="og:description" content="Check out my personalised college list from RankSetu NEET Optimizer." />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
      </Helmet>

      <div className={`min-h-screen flex flex-col items-center py-8 px-4 ${darkMode ? "bg-dark-bg" : "bg-[#f9fafc]"}`}>
        <div className="w-full max-w-sm">
          {/* Back button */}
          <button
            onClick={() => {
              try { sessionStorage.removeItem('ranksetu_share_data'); } catch (_) {}
              onBack();
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-interactive mb-6 transition"
          >
            <ArrowLeft size={16} /> Back to Optimizer
          </button>

          {/* Loading overlay for card generation */}
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm font-medium">Generating your share card...</p>
                <p className="text-xs text-slate-500 mt-1">Please wait</p>
              </div>
            </div>
          )}

          {/* Share Card - always visible, never changes during generation */}
          <div
            ref={cardRef}
            style={{
              width: '100%',
              aspectRatio: '9/16',
              position: 'relative',
              borderRadius: '28px',
              overflow: 'hidden',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)',
            }} />

            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '240px', height: '240px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236,72,153,0.45) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-60px', left: '-60px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }} />
            <div style={{
              position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
              width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }} />

            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <div style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              height: '100%', padding: '32px 24px',
              boxSizing: 'border-box',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '999px', padding: '6px 16px',
                  marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '14px' }}>✨</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    RankSetu AI
                  </span>
                </div>
                <div style={{
                  fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #fcd34d, #f97316, #ec4899)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  NEET 2026
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>
                  AI-Powered College Predictor
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
                  All India Rank
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '24px',
                  padding: '14px 32px',
                }}>
                  <div style={{
                    fontSize: '52px', fontWeight: 900, lineHeight: 1,
                    background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                  }}>
                    {shareData.rank.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '13px', fontWeight: 700, color: '#a78bfa',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px',
                  }}>
                    {shareData.category}
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <BucketBadge emoji="🌟" label="Dream" count={shareData.dreamCount} color="#fde68a" />
                <BucketBadge emoji="🎯" label="Target" count={shareData.targetCount} color="#fed7aa" />
                <BucketBadge emoji="🛡️" label="Safe" count={shareData.safeCount} color="#a7f3d0" />
              </div>

              {showColleges.length > 0 && (
                <div style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                }}>
                  <div style={{
                    fontSize: '9px', fontWeight: 800, color: '#fbbf24',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    🏆 Top College Picks
                  </div>
                  {showColleges.map((name, i) => (
                    <TopCollegeRow key={i} name={name} idx={i} />
                  ))}
                </div>
              )}

              <div style={{
                textAlign: 'center',
                background: 'rgba(139,92,246,0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '12px',
                padding: '8px 20px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {medal.icon} {medal.text} · Based on 5-year trend
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
                  ranksetu.com/optimizer · #NEET2026
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {!loading && imageUrl && (
              <>
                <div className="flex gap-3">
                  <button onClick={downloadPNG}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-interactive text-white font-bold py-3 rounded transition">
                    <Download size={16} /> Save PNG
                  </button>
                  <button onClick={shareToWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20c05c] text-white font-bold py-3 rounded transition">
                    <Share2 size={16} /> WhatsApp
                  </button>
                </div>
                <button onClick={copyLink}
                  className={`w-full py-2.5 rounded text-sm font-semibold border transition
                    ${darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                  🔗 Copy optimizer link
                </button>
                <button onClick={regenerateImage}
                  className={`w-full py-2 rounded text-xs font-medium transition
                    ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
                  ↻ Regenerate Image
                </button>
              </>
            )}

            {!loading && !imageUrl && !error && (
              <button onClick={generateImage}
                className="w-full py-3 rounded font-bold text-white text-sm bg-primary hover:bg-interactive transition">
                ✨ Generate Share Card
              </button>
            )}
          </div>

          <p className={`text-center text-xs mt-4 ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
            Share on Instagram, WhatsApp, or Telegram 🚀
          </p>
        </div>
      </div>
    </>
  );
}