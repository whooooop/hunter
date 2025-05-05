export async function FontLoader(fontName: string, sources: { url: string, format: string }[]) {
  for (const { url, format } of sources) {
    try {
      const font = new FontFace(fontName, `url(${url}) format("${format}")`);
      await font.load();
      document.fonts.add(font);
      await document.fonts.ready;
      console.log(`Font "${fontName}" loaded using ${format}`);
      return;
    } catch (e) {
      console.warn(`Failed to load font "${fontName}" from ${url}:`, e);
    }
  }

  throw new Error(`Failed to load font "${fontName}" in any supported format`);
}