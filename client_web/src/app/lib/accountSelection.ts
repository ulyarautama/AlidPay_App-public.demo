const ACCOUNT_SELECTION_REQUIRED_KEY = "alidpay_account_selection_required";

export function requireAccountSelection() {
  window.sessionStorage.setItem(ACCOUNT_SELECTION_REQUIRED_KEY, "1");
}

export function clearAccountSelectionRequirement() {
  window.sessionStorage.removeItem(ACCOUNT_SELECTION_REQUIRED_KEY);
}

export function isAccountSelectionRequired() {
  return window.sessionStorage.getItem(ACCOUNT_SELECTION_REQUIRED_KEY) === "1";
}
