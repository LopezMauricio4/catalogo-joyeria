import { isSupabaseConfigured, supabase } from "../lib/supabase";

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para usar la autenticación.");
  }
  return supabase;
};

export const mapSupabaseUser = (user) => {
  if (!user) return { role: "guest", userName: "", email: "" };

  const role = user.app_metadata?.role === "admin" ? "admin" : "client";
  const userName = user.user_metadata?.full_name?.trim() || user.email?.split("@")[0] || "Cuenta";

  return { id: user.id, role, userName, email: user.email || "" };
};

export const signIn = async (email, password) => {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

export const signUp = async (name, email, password) => {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth` },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
};

export const getAccessToken = async () => {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session?.access_token;
};
