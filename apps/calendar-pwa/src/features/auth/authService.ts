import { getSupabaseClient } from '../../lib/supabase/client'

function requireClient() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local.',
    )
  }
  return supabase
}

/** Traduce los errores comunes de Supabase Auth a mensajes legibles en español. */
function toReadableError(message: string): string {
  const translations: Array<[RegExp, string]> = [
    [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
    [/email not confirmed/i, 'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.'],
    [/user already registered/i, 'Ya existe una cuenta con este correo.'],
    [/password should be at least/i, 'La contraseña es demasiado corta (mínimo 6 caracteres).'],
    [/unable to validate email address/i, 'El correo no tiene un formato válido.'],
    [/email rate limit exceeded/i, 'Demasiados intentos. Espera unos minutos y vuelve a intentar.'],
    [/fetch/i, 'No se pudo conectar con el servidor. Revisa tu conexión a internet.'],
  ]
  for (const [pattern, readable] of translations) {
    if (pattern.test(message)) return readable
  }
  return message
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = requireClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })
  if (error) throw new Error(toReadableError(error.message))
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = requireClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(toReadableError(error.message))
  return data
}

export async function signOut() {
  const supabase = requireClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(toReadableError(error.message))
}
