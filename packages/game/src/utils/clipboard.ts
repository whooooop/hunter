export async function copyToClipboard(text: string): Promise<boolean> {
  // Пробуем современный Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
    }
  }

  // Fallback для старых браузеров и небезопасных контекстов
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-999999px';
    textarea.style.left = '-999999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // Специальная обработка для iOS Safari
      textarea.contentEditable = 'true';
      textarea.readOnly = false;
      textarea.style.position = 'absolute';
      textarea.style.left = '0';
      textarea.style.top = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.opacity = '0';

      // Фокусируемся на textarea
      textarea.focus();

      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Устанавливаем выделение
      textarea.setSelectionRange(0, text.length);
    } else {
      textarea.select();
    }

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (!success && isIOS) {
      // Дополнительная попытка для iOS
      console.warn('First copy attempt failed on iOS, trying alternative method');
      return await fallbackIOSCopy(text);
    }

    return success;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

// Дополнительный метод для iOS
async function fallbackIOSCopy(text: string): Promise<boolean> {
  try {
    const input = document.createElement('input');
    input.value = text;
    input.style.position = 'fixed';
    input.style.top = '0';
    input.style.left = '0';
    input.style.width = '1px';
    input.style.height = '1px';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';

    document.body.appendChild(input);
    input.focus();
    input.select();

    const success = document.execCommand('copy');
    document.body.removeChild(input);

    return success;
  } catch (err) {
    console.error('Fallback iOS copy failed:', err);
    return false;
  }
}

