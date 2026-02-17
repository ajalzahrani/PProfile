function getSearchCookie(): Record<string, string> {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(
      /(?:^|; )occurrencesSearchParams=([^;]*)/
    );
    if (match) {
      try {
        return JSON.parse(decodeURIComponent(match[1]));
      } catch {
        return {};
      }
    }
  }
  return {};
}

function setSearchCookie(params: Record<string, string>) {
  document.cookie = `occurrencesSearchParams=${encodeURIComponent(
    JSON.stringify(params)
  )}; path=/`;
}

export { getSearchCookie, setSearchCookie };
