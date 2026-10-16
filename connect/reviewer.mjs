// Optional directory-review access. Uses normal Supabase authentication and
// OAuth consent; no test-token bypass, stored password, or elevated credential.
const base = 'https://omhelpzpkowcncvqfnuw.supabase.co';
const publicKey = 'sb_publishable_k97pjZbpMZImaTFP3Sl_pA_ODF_8JZw';
const callback = base + '/functions/v1/mcp-auth/callback';
export function reviewerCallback(value) {
  const url = new URL(value);
  if (url.origin !== new URL(base).origin || url.pathname !== new URL(callback).pathname || !url.searchParams.get('code') || !url.searchParams.get('state')) throw Error('Invalid authorization callback.');
  return url.href;
}
export async function reviewerSignIn({authorizationID, email, password, fetcher = fetch}) {
  if (!/^[A-Za-z0-9_-]{16,256}$/.test(authorizationID || '')) throw Error('Start connecting again in your AI app.');
  async function request(path, body, token) {
    const response = await fetcher(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {apikey: publicKey, 'Content-Type':'application/json', ...(token ? {Authorization:'Bearer ' + token} : {})},
      body: body === undefined ? undefined : JSON.stringify(body), credentials:'omit', cache:'no-store', redirect:'error', referrerPolicy:'no-referrer', signal:AbortSignal.timeout(15000)
    });
    if (!response.ok) throw Error('Sign-in or authorization failed. Check your reviewer credentials and start connecting again if the request expired.');
    return response.json();
  }
  const session = await request('/auth/v1/token?grant_type=password', {email, password});
  if (!session.access_token || session.token_type?.toLowerCase() !== 'bearer') throw Error('Sign-in did not complete.');
  const route = '/auth/v1/oauth/authorizations/' + encodeURIComponent(authorizationID);
  const details = await request(route, undefined, session.access_token);
  if (details.redirect_url) reviewerCallback(details.redirect_url);
  else if (!details.client?.id || details.redirect_uri !== callback) throw Error('This connection request is not for Flow Capture.');
  return {
    label: details.client?.name || details.client?.client_name || 'Flow Capture connection',
    approve: async () => {
      const result = details.redirect_url ? details : await request(route + '/consent', {action:'approve'}, session.access_token);
      return reviewerCallback(result.redirect_url);
    }
  };
}
if (typeof document !== 'undefined' && new URLSearchParams(location.search).get('review') === '1') {
  const section = document.getElementById('review-access');
  const form = document.getElementById('review-form');
  const status = document.getElementById('review-status');
  const allow = document.getElementById('review-allow');
  const submit = document.getElementById('review-sign-in');
  let pending;
  section.hidden = false;
  form.onsubmit = async event => {
    event.preventDefault(); submit.disabled = true; allow.hidden = true; pending = undefined;
    status.textContent = 'Signing in…';
    const passwordField = document.getElementById('review-password');
    const password = passwordField.value; passwordField.value = '';
    try {
      pending = await reviewerSignIn({authorizationID:new URLSearchParams(location.search).get('authorization_id'), email:document.getElementById('review-email').value.trim(), password});
      status.textContent = pending.label + ' can read only exports shared by this account. Allow access to continue?';
      allow.hidden = false;
    } catch(error) { status.textContent = error.message; }
    finally { submit.disabled = false; }
  };
  allow.onclick = async () => {
    if (!pending) return;
    allow.disabled = true;
    try {
      const target = await pending.approve();
      dispatchEvent(new Event('flowcap-reviewer-approved'));
      location.replace(target);
    } catch(error) { status.textContent = error.message; allow.disabled = false; }
  };
}
