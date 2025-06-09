import * as path from 'path';

// Загружаем слова из JSON файла используя путь из dist к src
const WORDS: string[] = require(path.join(__dirname, '../../src/words/big.json'));

export function generateWord(minLength: number = 3): string {
  const randomIndex = Math.floor(Math.random() * WORDS.length);
  const word = WORDS[randomIndex];

  if (word.length >= minLength) {
    return word;
  }

  return generateWord(minLength);
} 