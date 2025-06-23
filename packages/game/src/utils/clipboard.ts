export function copyToClipboard(text: string): boolean {
  // Пробуем современный Clipboard API (только для безопасных контекстов)
  if (navigator.clipboard && window.isSecureContext) {
    // Для Clipboard API используем асинхронный подход
    navigator.clipboard.writeText(text).catch(err => {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
    });
    return true;
  }

  // Fallback для старых браузеров и небезопасных контекстов
  try {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      return copyForIOS(text);
    } else {
      return copyForDesktop(text);
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

// Синхронный метод для iOS
function copyForIOS(text: string): boolean {
  const input = document.createElement('input');
  input.value = text;
  input.style.position = 'fixed';
  input.style.top = '0';
  input.style.left = '0';
  input.style.width = '1px';
  input.style.height = '1px';
  input.style.opacity = '0';
  input.style.pointerEvents = 'none';
  input.style.fontSize = '16px'; // Предотвращает зум в iOS

  document.body.appendChild(input);

  // Фокусируемся и выделяем текст
  input.focus();
  input.select();

  try {
    const success = document.execCommand('copy');
    document.body.removeChild(input);
    return success;
  } catch (err) {
    document.body.removeChild(input);
    console.error('iOS copy failed:', err);
    return false;
  }
}

// Синхронный метод для десктопа
function copyForDesktop(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '-999999px';
  textarea.style.left = '-999999px';
  textarea.style.opacity = '0';
  textarea.setAttribute('readonly', '');
  textarea.style.pointerEvents = 'none';

  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    document.body.removeChild(textarea);
    console.error('Desktop copy failed:', err);
    return false;
  }
}

