import { FrequencyUnit } from "./FrequencyUnit";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  frequency?: number;
  frequencyUnit?: FrequencyUnit;
  color?: string;
  dates?: Record<string, boolean | number>;
  notificationTime?: string;
  notificationEnabled?: boolean;
}
