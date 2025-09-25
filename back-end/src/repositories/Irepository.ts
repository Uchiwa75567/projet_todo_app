// Interface générique pour définir les opérations CRUD de base
export interface IRepository<T> {
    // Récupère tous les éléments
    findAll(): Promise<T[]>;
    // Récupère un élément par son ID
    findById(id: number): Promise<T | null>;
    // Récupère les éléments avec pagination
    findAllPaginated(page: number, limit: number): Promise<{ data: T[], total: number, totalPages: number, currentPage: number }>;
    // Crée un nouvel élément
    create(data: any): Promise<T>;
    // Met à jour un élément existant
    update(id: number, data: any): Promise<T>;
    // Supprime un élément
    delete(id: number): Promise<void>;
}
