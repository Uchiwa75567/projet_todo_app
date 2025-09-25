import fs from 'fs';
import path from 'path';
export class AudioValidator {
    /**
     * Validation simple basée sur la taille du fichier
     * @param filePath Chemin vers le fichier audio
     * @returns AudioValidationResult
     */
    static validateAudioFile(filePath) {
        try {
            // Vérifier si le fichier existe
            if (!fs.existsSync(filePath)) {
                return {
                    isValid: false,
                    error: 'Fichier audio non trouvé'
                };
            }
            // Obtenir la taille du fichier
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            // Estimation approximative: 128kbps = ~16KB par seconde
            // Donc pour 30 secondes max: ~480KB
            if (fileSize > this.MAX_FILE_SIZE) {
                return {
                    isValid: false,
                    error: `Le fichier audio est trop volumineux (${(fileSize / 1024 / 1024).toFixed(1)}MB). Limite: ${(this.MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB`
                };
            }
            return {
                isValid: true,
                duration: Math.ceil(fileSize / (128 * 1024 / 8)) // Estimation approximative
            };
        }
        catch (error) {
            return {
                isValid: false,
                error: `Erreur lors de la validation du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
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
    /**
     * Obtient la taille maximale autorisée en octets
     * @returns number
     */
    static getMaxFileSize() {
        return this.MAX_FILE_SIZE;
    }
}
AudioValidator.MAX_DURATION_SECONDS = 30;
AudioValidator.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (estimation approximative pour 30s)
