'use strict';
// Native details and normal links remain functional when JavaScript is disabled.
for (const picker of document.querySelectorAll('.language-switcher')) {
 const trigger = picker.querySelector('summary');
 document.addEventListener('click', event => { if (!picker.contains(event.target)) picker.open = false; });
 picker.addEventListener('keydown', event => {
  if (event.key === 'Escape' && picker.open) { picker.open = false; trigger.focus(); event.preventDefault(); }
 });
 picker.addEventListener('focusout', event => { if (!picker.contains(event.relatedTarget)) picker.open = false; });
 // Preserve OAuth query parameters and article anchors when switching language.
 for (const link of picker.querySelectorAll('a')) {
  const url = new URL(link.href);
  url.search = location.search;
  url.hash = location.hash;
  link.href = url.href;
 }
}
window.flowcapTranslate = text => (window.flowcapMessages || {})[text] || text;
