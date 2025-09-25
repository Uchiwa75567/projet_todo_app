import { actionLogRepository } from "../repositories/ActionLogRepository.js";
export const actionLogService = {
    async logAction(action, taskId, userId) {
        return actionLogRepository.create(action, taskId, userId);
    },
    async getHistory() {
        return actionLogRepository.getAll();
    },
};
