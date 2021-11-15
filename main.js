'use strict';
var main = (function() {
const MAX_TIME = 30;
const TIMES_PER_SEC = 20;
const MAX_COUNTER = MAX_TIME * TIMES_PER_SEC;
const COPY_SVG = '<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1">'
    + '<path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>'
    + '</svg>';

let secrets = {};

function innerStart(secretsParam) {
  secrets = secretsParam;
  generate();
  let counter = calculateStartCounter();
  setInterval(() => {
    updateTimerDisplay(counter);
    if (counter === 0) {
      generate();
      counter = 1;
    } else if (counter === MAX_COUNTER) {
      counter = 0;
    } else {
      counter += 1;
    }
  }, 1000 / TIMES_PER_SEC);
}

function calculateStartCounter() {
  let seconds = new Date().getSeconds();
  if (seconds > MAX_TIME) {
    seconds = seconds - MAX_TIME;
  }
  return seconds * TIMES_PER_SEC;
}

function copyToClipboard(value) {
  navigator.clipboard.writeText(value);
  showError(`Copied ${value} to clipboard`);
}

function updateTimerDisplay(counter) {
  const timerElem = document.getElementById('timer-bar');
  const percentage = ((MAX_COUNTER - counter) / MAX_COUNTER) * 100;
  timerElem.style.width = `${percentage}%`;
}

function showError(message) {
  const errorElem = document.getElementById('errors');
  errorElem.innerHTML = message;
}

function generate() {
  console.log('generating');
  showError('');
  if (typeof jsOTP === 'undefined') {
    showError('jsOTP is not defined');
    return;
  }
  
  const codesElem = document.getElementById('codes');
  let str = '<ul>';
  for (const secret of secrets) {
    str += '<li class="display">';
    str += `<div class="name">${secret.name}</div>`;
    try {
      if (!secret.code) {
        throw new Error('Missing secret code');
      }
      const totp = new jsOTP.totp();
      const timeCode = totp.getOtp(secret.code.toUpperCase().replace(/ /g, ''));
      str += `<div class="code">${timeCode}</div>`;
      str += `<div class="copy-container" title="Copy to Clipboard" onclick="main.copyToClipboard('${timeCode}')">${COPY_SVG}</div>`;
    } catch (err) {
      str += `<div class="code error">${err}</div>`;
    }
    str += '</li>';
  }
  str += '</ul>';
  codesElem.innerHTML = str;
}
return {
  start: innerStart,
  copyToClipboard: copyToClipboard,
  generate: generate,
}
})();