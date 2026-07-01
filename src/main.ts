import './style.css'

const KeyToButtonSelector: Record<string, string> = {
  "0": 'button[data-number="0"]',
  "1": 'button[data-number="1"]',
  "2": 'button[data-number="2"]',
  "3": 'button[data-number="3"]',
  "4": 'button[data-number="4"]',
  "5": 'button[data-number="5"]',
  "6": 'button[data-number="6"]',
  "7": 'button[data-number="7"]',
  "8": 'button[data-number="8"]',
  "9": 'button[data-number="9"]',

  "+": 'button[data-operator="+"]',
  "-": 'button[data-operator="-"]',
  "*": 'button[data-operator="×"]',
  "/": 'button[data-operator="÷"]',

  ".": 'button[data-action="decimal"]',
  "%": 'button[data-action="percent"]',

  "=": 'button[data-action="equals"]',
  "Enter": 'button[data-action="equals"]',
  "Backspace": 'button[data-action="delete"]',
  "Escape": 'button[data-action="clear"]',
  "Delete": 'button[data-action="clear"]',
}

function getButtonFromKey(key: string,): HTMLButtonElement | null {
  const selector = KeyToButtonSelector[key];

  if (!selector) {
    return null;
  }

  return document.querySelector<HTMLButtonElement>(selector);
}

document.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  const button = getButtonFromKey(event.key);

  if (!button) {
    return;
  }

  event.preventDefault();
  button.classList.add("keyboard-active");
});

document.addEventListener("keyup", (enent) => {
  const button = getButtonFromKey(enent.key);

  if (!button) {
    return;
  }

  button.classList.remove("keyboard-active");
});



window.addEventListener("blur", () => {
  const activeButtons = 
    document.querySelectorAll<HTMLButtonElement>("button.keyboard-active");

  activeButtons.forEach((button) => {
    button.classList.remove("keyboard-active");
  });
});