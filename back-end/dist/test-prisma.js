// Import du client Prisma pour interagir avec la base de données
import { PrismaClient } from '@prisma/client';
// Création d'une instance du client Prisma
const prisma = new PrismaClient();
// Fonction principale asynchrone pour tester la connexion à la base de données
async function main() {
    // Récupère toutes les tâches de la base de données
    const tasks = await prisma.task.findMany();
    // Affiche les tâches dans la console
    console.log('Tasks:', tasks);
}
// Exécute la fonction principale
main()
    // Gère les erreurs potentielles
    .catch(e => console.error(e))
    // Déconnecte le client Prisma une fois terminé
    .finally(async () => await prisma.$disconnect());
