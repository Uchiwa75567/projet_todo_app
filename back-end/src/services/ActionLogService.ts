import { actionLogRepository } from "../repositories/ActionLogRepository.js";

export const actionLogService = {
  async logAction(action: string, taskId: number, userId: number) {
    return actionLogRepository.create(action, taskId, userId);
  },

  async getHistory() {
    return actionLogRepository.getAll();
  },
};
