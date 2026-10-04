// Supabase project used for editable content (prices, reviews, passes, areas) and the /admin login.
// The anon key is public by design: Row Level Security only lets signed-in admins change anything.
// If Supabase can't be reached, the site shows its built-in copy of the content.
(() => {
  const PRODUCTION = {
    supabaseUrl: 'https://ojelrkgkqmpkddprphbh.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZWxya2drcW1wa2RkcHJwaGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMDAxMDEsImV4cCI6MjEwNjY3NjEwMX0.23ewAO-W-OS5Xe7DwNwwRNJtVpC7_ShB8tMzApDScMo',
  };
  // `supabase start` (local development only; this is Supabase's standard local demo key).
  const LOCAL = {
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  };
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  window.SAFEGEN_CONFIG = isLocal ? LOCAL : PRODUCTION;
})();
