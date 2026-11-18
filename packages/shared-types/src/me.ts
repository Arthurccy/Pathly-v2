// ==========================================
// PATHLY V2 - CONTRAT PROFIL COURANT (/me) — S2
// Producteur : Yann · Consommateurs : page /parametres, client API web
// Référence : docs/architecture/CONTRATS_SEANCE_2.md (« Profil courant : lecture/modification du nom sous /me »)
// ==========================================
//
// Règles convenues avec Yann (S2) :
// - UserProfile.id = id de l'utilisateur Supabase (auth.users.id), même UUID.
// - L'identité (id, e-mail) vient de la session validée par l'API, jamais du navigateur.
// - Le profil est créé par l'API au premier appel authentifié à GET /me s'il n'existe pas
//   (création idempotente, n'écrase jamais un profil existant).
// - Si l'e-mail est déjà associé à un autre profil : HTTP 409, code PROFILE_EMAIL_CONFLICT,
//   sans écraser ni rattacher ce profil.

/** Réponse de GET /api/v1/me et PATCH /api/v1/me, enveloppée dans ApiResponse<UserProfileDto>. */
export interface UserProfileDto {
  /** = id de l'utilisateur Supabase. */
  id: string;
  email: string;
  fullName: string | null;
  /** Horodatage ISO 8601 avec fuseau (ex. '2026-11-18T13:00:00.000Z'). */
  createdAt: string;
}

/**
 * Corps de PATCH /api/v1/me. Seul le nom est modifiable.
 * Validation S2 : espaces de début/fin retirés ; vide refusé ; 100 caractères maximum ;
 * null refusé (pas d'effacement du nom en S2). Erreur → HTTP 400, code VALIDATION_ERROR.
 */
export interface UpdateProfileDto {
  fullName: string;
}

export type ProfileErrorCode = 'PROFILE_EMAIL_CONFLICT' | 'VALIDATION_ERROR';

/*
 * Exemple de référence — ApiResponse<UserProfileDto>.data :
 * {
 *   "id": "00000000-0000-4000-8000-000000000001",
 *   "email": "persona.alex@pathly.test",
 *   "fullName": "Alex Martin",
 *   "createdAt": "2026-11-18T13:00:00.000Z"
 * }
 *
 * Conflit d'e-mail (HTTP 409) :
 * { "success": false, "error": { "code": "PROFILE_EMAIL_CONFLICT", "message": "..." } }
 */
