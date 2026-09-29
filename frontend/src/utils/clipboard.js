/**
 * Robust copy-to-clipboard utility with fallback for non-secure contexts (HTTP)
 * and older browser environments.
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;

  // 1. Try modern navigator.clipboard API if available and in secure context
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, falling back to execCommand:', err);
  }

  // 2. Fallback using temporary textarea and document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('All clipboard copy attempts failed:', err);
    return false;
  }
};
