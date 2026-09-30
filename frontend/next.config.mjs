export default {
  // /api/* is proxied at runtime by app/api/[...path]/route.js.
  // This keeps local development and Cloud Run on the same browser origin
  // while allowing BACKEND_URL to be configured when the service starts.
};
