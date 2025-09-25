import { ZodError } from 'zod';
export const validate = (schema) => (req, res, next) => {
    try {
        // ✅ On parse directement le body si le schéma concerne le body
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            const details = error.issues.map((err) => {
                const field = err.path.join('.');
                let message = err.message;
                if (err.code === 'invalid_type') {
                    const invalidTypeErr = err;
                    if (invalidTypeErr.received === 'null') {
                        message = `Le champ '${field}' ne peut pas être null.`;
                    }
                    else {
                        message = `Le champ '${field}' doit être de type ${invalidTypeErr.expected}.`;
                    }
                }
                else if (err.code === 'too_small') {
                    message = `Le champ '${field}' doit contenir au moins ${err.minimum} caractères.`;
                }
                else if (err.code === 'too_big') {
                    message = `Le champ '${field}' ne peut pas dépasser ${err.maximum} caractères.`;
                }
                return { champ: field, message };
            });
            return res.status(400).json({
                erreur: 'La requête est invalide.',
                details
            });
        }
        return res.status(500).json({
            erreur: 'Erreur interne du serveur.'
        });
    }
};
