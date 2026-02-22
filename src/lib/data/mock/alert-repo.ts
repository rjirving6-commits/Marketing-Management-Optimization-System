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
}
