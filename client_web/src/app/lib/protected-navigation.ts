import axios from "axios";

type ReplaceRouter = {
  replace: (href: string) => void;
};

export function redirectProtectedResourceError(
  error: unknown,
  router: ReplaceRouter,
  requestedPath: string,
  fallbackPath = "/transaction",
  redirectForbidden = true,
) {
  if (!axios.isAxiosError(error)) return false;

  if (error.response?.status === 401) {
    router.replace(`/login?redirect=${encodeURIComponent(requestedPath)}`);
    return true;
  }

  if (error.response?.status === 403 || error.response?.status === 404) {
    if (!redirectForbidden) return false;
    router.replace(fallbackPath);
    return true;
  }

  return false;
}
