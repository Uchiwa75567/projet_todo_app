import { Request, Response } from "express";
import { actionLogService } from "../services/ActionLogService.js";

export const getHistory = async (req: Request, res: Response) => {
  try {
    const logs = await actionLogService.getHistory();

    // Formatage pour gérer les tâches supprimées
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      timestamp: log.timestamp,
      user: {
        id: log.user.id,
        name: log.user.name,
      },
      task: log.task
        ? { id: log.task.id, title: log.task.title }
        : { id: null, title: "[Tâche supprimée]" },
    }));

    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
};
