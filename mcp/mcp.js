'use strict';
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(target.textContent);
      button.textContent = 'Copied';
      document.getElementById('copy-status').textContent = 'Copied to clipboard.';
      window.setTimeout(() => { button.textContent = original; }, 2500);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange(); range.selectNodeContents(target);
      selection.removeAllRanges(); selection.addRange(range);
      document.getElementById('copy-status').textContent = 'Select and copy the highlighted text.';
      button.textContent = 'Select text to copy';
    }
  });
}
