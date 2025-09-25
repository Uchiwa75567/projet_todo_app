import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AudioValidator } from './audioValidation.js';
const uploadDir = path.join(process.cwd(), 'uploads');
// Crée le dossier uploads si inexistant
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext)
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-_\.]/g, '');
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`;
        cb(null, filename);
    }
});
export const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        // Types de fichiers autorisés
        const allowedTypes = [
            // Images
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            // Documents
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            // Audio pour messages vocaux
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/wave',
            'audio/m4a',
            'audio/aac',
            'audio/ogg',
            'audio/webm'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Type de fichier non supporté: ${file.mimetype}`));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max pour les fichiers audio
    }
});
// Middleware spécifique pour les fichiers audio avec validation de durée
export const uploadAudio = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        // Vérifier que c'est un fichier audio
        if (AudioValidator.isAudioFile(file.originalname)) {
            cb(null, true);
        }
        else {
            cb(new Error('Seuls les fichiers audio sont autorisés'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max pour les fichiers audio
    }
});
// Middleware pour valider la durée après l'upload
export const validateAudioDuration = async (req, res, next) => {
    try {
        const files = req.files;
        if (files?.voice?.[0]) {
            const voiceFile = files.voice[0];
            const filePath = path.join(uploadDir, voiceFile.filename);
            const validation = AudioValidator.validateAudioFile(filePath);
            if (!validation.isValid) {
                // Supprimer le fichier en cas d'erreur
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.status(400).json({
                    error: validation.error
                });
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
