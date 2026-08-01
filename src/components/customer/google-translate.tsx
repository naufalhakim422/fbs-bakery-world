'use client';

import React, { useEffect } from 'react';

// Polyfill Node.prototype.removeChild and insertBefore to prevent Google Translate DOM mutations from crashing React / Next.js
if (typeof window !== 'undefined') {
  if (!(window as any).__gt_node_patched) {
    (window as any).__gt_node_patched = true;

    try {
      const originalRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function <T extends Node>(child: T): T {
        if (child.parentNode !== this) {
          if (child.parentNode) {
            return child.parentNode.removeChild(child) as T;
          }
          return child;
        }
        return originalRemoveChild.call(this, child) as T;
      };

      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
        if (referenceNode && referenceNode.parentNode !== this) {
          return originalInsertBefore.call(this, newNode, null) as T;
        }
        return originalInsertBefore.call(this, newNode, referenceNode) as T;
      };
    } catch (e) {}
  }
}

export const GoogleTranslateScript: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Continuous cleaner interval to ensure Google Translate top banner is 100% destroyed & hidden
    const interval = setInterval(() => {
      document.body.style.top = '0px';
      document.body.style.position = 'static';
      document.body.style.marginTop = '0px';
      document.documentElement.style.top = '0px';
      document.documentElement.style.marginTop = '0px';

      const bannerSelectors = [
        'iframe.goog-te-banner-frame',
        '.goog-te-banner-frame',
        '.goog-te-balloon-frame',
        '#goog-gt-tt',
        '.VIpgJd-Z44fyf-O2wb-gTVI9d',
        '.VIpgJd-Z44fyf-O2wb-gTVI9d-l4e48c',
        'body > .skiptranslate',
        'iframe[id^=":"]'
      ];

      bannerSelectors.forEach(selector => {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.visibility = 'hidden';
          (el as HTMLElement).style.height = '0px';
          (el as HTMLElement).style.width = '0px';
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.pointerEvents = 'none';
        });
      });
    }, 200);

    // Init script if not present
    if (!document.getElementById('google-translate-script')) {
      (window as any).googleTranslateElementInit = () => {
        try {
          if ((window as any).google && (window as any).google.translate) {
            new (window as any).google.translate.TranslateElement(
              {
                pageLanguage: 'ms',
                includedLanguages: 'ms,id,en,zh-CN',
                layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              'google_translate_element'
            );

            // Sync translation immediately after init
            setTimeout(() => {
              const savedLang = localStorage.getItem('fbs_language') || 'MS';
              const gtLangMap: Record<string, string> = { MS: 'ms', ID: 'id', EN: 'en', ZH: 'zh-CN' };
              const targetGtLang = gtLangMap[savedLang] || 'ms';
              const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
              if (gtCombo && gtCombo.value !== targetGtLang) {
                gtCombo.value = targetGtLang;
                gtCombo.dispatchEvent(new Event('change'));
              }
            }, 300);
          }
        } catch (err) {}
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="google_translate_element" className="hidden" style={{ display: 'none', visibility: 'hidden' }} />
  );
};
