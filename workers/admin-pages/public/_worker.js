// Forward everything to the phuonglam-admin Worker (see ../wrangler.toml for why).
export default {
  fetch: (request, env) => env.ADMIN.fetch(request),
};
