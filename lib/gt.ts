export function setGoogleTranslateLanguage(langCode: "id" | "en") {
  // format cookie: /<from>/<to>
  const from = "id";
  const to = langCode;
  const cookieValue = `/${from}/${to}`;

  // Set untuk domain saat ini
  document.cookie = `googtrans=${cookieValue}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
  document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}