'use strict';
for (const button of document.querySelectorAll('[data-copy]')) {
  const original = button.textContent;
  let resetLabel;
  button.addEventListener('click', async () => {
    window.clearTimeout(resetLabel);
    const target = document.getElementById(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(target.textContent);
      button.textContent = 'Copied';
      document.getElementById('copy-status').textContent = 'Copied to clipboard.';
      resetLabel = window.setTimeout(() => { button.textContent = original; }, 2500);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange(); range.selectNodeContents(target);
      selection.removeAllRanges(); selection.addRange(range);
      document.getElementById('copy-status').textContent = 'Select and copy the highlighted text.';
      button.textContent = 'Select text to copy';
    }
  });
}
