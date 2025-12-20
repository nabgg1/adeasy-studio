
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface VoiceData {
  name: string; // Nom technique Gemini
  displayName: string; // Nom français affiché
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  avatarUrl: string; // URL de la photo réelle
  description: string; // Description du timbre de voix
}

/**
 * Sélection de 15 voix optimisées pour le dynamisme radio
 * Ordonnées en alternance Homme / Femme, avec Pierre en tête de liste.
 */
export const ALL_VOICES: VoiceData[] = [
  // 1. Homme
  { "name": "Orus", "displayName": "Pierre", "ssmlGender": "MALE", "avatarUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix dynamique" },
  // 2. Femme
  { "name": "Kore", "displayName": "Sophie", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix chaleureuse" },
  // 3. Homme
  { "name": "Sadachbia", "displayName": "Lucas", "ssmlGender": "MALE", "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix moderne" },
  // 4. Femme
  { "name": "Zephyr", "displayName": "Inès", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix punchy" },
  // 5. Homme
  { "name": "Algieba", "displayName": "Nicolas", "ssmlGender": "MALE", "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix grave & pro" },
  // 6. Femme
  { "name": "Achernar", "displayName": "Léa", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix élégante" },
  // 7. Homme
  { "name": "Rasalgethi", "displayName": "Maxime", "ssmlGender": "MALE", "avatarUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix intense" },
  // 8. Femme
  { "name": "Despina", "displayName": "Camille", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix naturelle" },
  // 9. Homme
  { "name": "Sadaltager", "displayName": "Théo", "ssmlGender": "MALE", "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix narrative" },
  // 10. Femme
  { "name": "Aoede", "displayName": "Chloé", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix pétillante" },
  // 11. Homme
  { "name": "Algenib", "displayName": "Arthur", "ssmlGender": "MALE", "avatarUrl": "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix posée" },
  // 12. Femme
  { "name": "Vindemiatrix", "displayName": "Clara", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix douce" },
  // 13. Homme
  { "name": "Fenrir", "displayName": "Thomas", "ssmlGender": "MALE", "avatarUrl": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix commerciale" },
  // 14. Femme
  { "name": "Sulafat", "displayName": "Alice", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix informative" },
  // 15. Femme
  { "name": "Erinome", "displayName": "Sarah", "ssmlGender": "FEMALE", "avatarUrl": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&h=150&auto=format&fit=crop", "description": "Voix sophistiquée" }
];
