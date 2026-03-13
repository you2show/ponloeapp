import React, { useEffect } from 'react';

interface FontLoaderProps {
  pages: number[];
}

export const FontLoader: React.FC<FontLoaderProps> = ({ pages }) => {
  useEffect(() => {
    const uniquePages = Array.from(new Set(pages)).filter(p => p > 0 && p <= 604);
    
    uniquePages.forEach(pageNum => {
      const fontName = `p${pageNum}-v2`;
      const fontId = `font-face-${fontName}`;
      
      if (!document.getElementById(fontId)) {
        const style = document.createElement('style');
        style.id = fontId;
        const paddedPage = pageNum.toString().padStart(3, '0');
        
        // Using the URL pattern provided by the user
        // Pattern: QCF2 + 3-digit padded page number
        const fontUrl = `https://raw.githubusercontent.com/you2show/ponloe.app/main/public/fonts/quran/hafs/QCF2BSMLfonts/QCF2${paddedPage}.ttf`;
        
        style.textContent = `
          @font-face {
            font-family: '${fontName}';
            src: local('QCF2${paddedPage}'),
                 url('${fontUrl}') format('truetype');
            font-display: swap;
            unicode-range: U+0000-00FF, U+F000-FFFF;
          }
        `;
        document.head.appendChild(style);
      }
    });
  }, [pages]);

  return null;
};
