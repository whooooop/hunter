import introFontTTF from './IntroRegular.ttf';
import introFontWOFF from './IntroRegular.woff';
import introFontWOFF2 from './IntroRegular.woff2';
import introFontTTFBlack from './IntroBlack.ttf';
import introFontWOFFBlack from './IntroBlack.woff';
import introFontWOFF2Black from './IntroBlack.woff2';

export const introFontRegular = {
  name: 'IntroRegular',
  sources: [
    { url: introFontWOFF2, format: 'woff2' },
    { url: introFontWOFF, format: 'woff' },
    { url: introFontTTF, format: 'truetype' },
  ],
};

export const introFontBold = {
  name: 'IntroBold',
  sources: [
    { url: introFontWOFF2Black, format: 'woff2' },
    { url: introFontWOFFBlack, format: 'woff' },
    { url: introFontTTFBlack, format: 'truetype' },
  ],
};
