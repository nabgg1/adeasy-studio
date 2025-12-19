
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { IntroStyle } from './types';

export const DYNAMIC_RADIO_PERSONA = `# AUDIO PROFILE: Dynamic Radio Ad Voice
## "Commercial Urgency"

## THE SCENE: The Radio Studio
We are in a professional, isolated, modern recording studio. The red "ON AIR" tally light is blazing. The voice actor is standing up, energetic, physically engaged in their reading. They are speaking directly to the listener to convince them instantly. The atmosphere is electric, urgent, and positive.

### DIRECTOR'S NOTES
* **Tone (The Smile):** "The Vocal Smile". You must *hear* the grin in the audio. The tone is bright, sunny, and explicitly inviting.
* **Dynamics (The Impact):** High projection without shouting. Punchy consonants and infectious energy.
* **Pace (The Rhythm):** "Engaging and Steady". A professional, energetic pace (approx. 145-155 words/minute). Ensure every word is perfectly articulated and clear. Do NOT rush; maintain the energy through punchy delivery rather than pure speed.
* **BREATHING (CRITICAL):** "No dead air". No audible breathing. The flow must be tight and continuous, with absolutely no unnecessary pauses between sentences.

### SAMPLE CONTEXT
This is the industry standard for "Top of the Hour" radio spots or event promos requiring immediate charisma and 110% energy.`;

export const INTRO_STYLES: IntroStyle[] = [
  {
    id: 'dynamic-radio',
    name: 'TESTEZ LE STUDIO ADEASY',
    description: DYNAMIC_RADIO_PERSONA,
    defaultVoice: 'Orus',
    color: 'blue',
    icon: 'circle',
    templateText: "C'est le moment ! Ne ratez pas l'offre incroyable d'AdEasy.io ! Une puissance de voix off instantanée, une clarté absolue, et une énergie qui va booster vos projets comme jamais ! Rendez-vous sur AdEasy.io dès maintenant !",
  }
];

export const CUSTOM_STYLE: IntroStyle = {
  id: 'custom',
  name: 'Style Perso',
  description: 'Configurez votre propre style personnalisé.',
  defaultVoice: 'Orus',
  color: 'white',
  icon: 'plus',
  templateText: "Entrez votre texte ici...",
};

export const SUPPORTED_LANGUAGES = [
  { name: 'Français (France)', code: 'fr-FR' },
  { name: 'Anglais (États-Unis)', code: 'en-US' },
];