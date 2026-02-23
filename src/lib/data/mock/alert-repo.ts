import type { Alert } from "../types";
import type { AlertRepository } from "../repositories";
import { store } from "./store";

export class MockAlertRepository implements AlertRepository {
  async getAll(): Promise<Alert[]> {
    return store.alerts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActive(): Promise<Alert[]> {
    return store.alerts
      .filter((a) => !a.dismissed)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }

  async dismiss(id: string): Promise<void> {
    const alert = store.alerts.find((a) => a.id === id);
    if (alert) {
      alert.dismissed = true;
    }
  }

  async create(
    data: Omit<Alert, "id" | "createdAt">
  ): Promise<Alert> {
    const alert: Alert = {
      ...data,
      id: `alert-${String(store.alerts.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };
    store.alerts.push(alert);
    return alert;
  }
}
