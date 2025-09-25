import { getAudioDurationInSeconds } from 'get-audio-duration';
import fs from 'fs';
import path from 'path';
export class AudioValidator {
    /**
     * Valide la durée d'un fichier audio
     * @param filePath Chemin vers le fichier audio
     * @returns Promise<AudioValidationResult>
     */
    static async validateAudioDuration(filePath) {
        try {
            // Vérifier si le fichier existe
            if (!fs.existsSync(filePath)) {
                return {
                    isValid: false,
                    error: 'Fichier audio non trouvé'
                };
            }
            // Obtenir la durée du fichier audio
            const duration = await getAudioDurationInSeconds(filePath);
            if (duration > this.MAX_DURATION_SECONDS) {
                return {
                    isValid: false,
                    duration,
                    error: `La durée de l'audio (${duration.toFixed(1)}s) dépasse la limite de ${this.MAX_DURATION_SECONDS} secondes`
                };
            }
            return {
                isValid: true,
                duration
            };
        }
        catch (error) {
            return {
                isValid: false,
                error: `Erreur lors de la validation de l'audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
            };
        }
    }
    /**
     * Valide si le fichier est un format audio supporté
     * @param filename Nom du fichier
     * @returns boolean
     */
    static isAudioFile(filename) {
        const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
        const ext = path.extname(filename).toLowerCase();
        return audioExtensions.includes(ext);
    }
    /**
     * Obtient la durée maximale autorisée en secondes
     * @returns number
     */
    static getMaxDuration() {
        return this.MAX_DURATION_SECONDS;
    }
}
AudioValidator.MAX_DURATION_SECONDS = 30;
