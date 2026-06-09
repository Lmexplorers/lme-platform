/*
 * LME delt auth-hjelper
 * Krever at @supabase/supabase-js v2 (UMD) er lastet før denne fila,
 * slik at window.supabase.createClient er tilgjengelig.
 *
 * Nøklene under er OFFENTLIGE (publishable / anon) og trygge i klientkode.
 * RLS i databasen styrer hva en innlogget bruker faktisk får lov til.
 *
 * Bruk på en beskyttet side:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="/js/lme-auth.js"></script>
 *   <script>LME.requireAuth();</script>
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://wpackkdsqjabqudbiusq.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_z-4K8p_Zd995Cmt0Xhj3GQ_s64pctIE';

  if (!window.supabase || !window.supabase.createClient) {
    console.error('[LME] supabase-js må lastes før /js/lme-auth.js');
    return;
  }

  var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  var LME = {
    client: client,
    config: { url: SUPABASE_URL },

    /* Opprett konto med e-post + passord. meta lagres på brukeren. */
    signUp: function (email, password, meta) {
      return client.auth.signUp({
        email: email,
        password: password,
        options: { data: meta || {} }
      });
    },

    /* Logg inn med e-post + passord. */
    signIn: function (email, password) {
      return client.auth.signInWithPassword({ email: email, password: password });
    },

    /* Send innloggingslenke (magic link) på e-post. */
    signInMagicLink: function (email, redirectTo) {
      return client.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: redirectTo || (location.origin + '/dashboard') }
      });
    },

    /* Send tilbakestill-passord-lenke. */
    resetPassword: function (email, redirectTo) {
      return client.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || (location.origin + '/min-konto')
      });
    },

    signOut: function () { return client.auth.signOut(); },

    getUser: function () {
      return client.auth.getUser().then(function (r) {
        return r && r.data ? r.data.user : null;
      });
    },

    getSession: function () {
      return client.auth.getSession().then(function (r) {
        return r && r.data ? r.data.session : null;
      });
    },

    /* Send til /login hvis ikke innlogget. Returnerer brukeren hvis innlogget. */
    requireAuth: function (loginPath) {
      return LME.getSession().then(function (session) {
        if (!session) {
          var next = encodeURIComponent(location.pathname + location.search);
          location.replace((loginPath || '/login') + '?next=' + next);
          return null;
        }
        return session.user;
      });
    },

    /* Lytt på innloggingsendringer. cb(session) kalles ved endring. */
    onChange: function (cb) {
      return client.auth.onAuthStateChange(function (_event, session) { cb(session); });
    }
  };

  window.LME = LME;
})();
