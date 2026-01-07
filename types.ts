
export enum DeviceType {
  LIGHT = 'LIGHT',
  DOOR = 'DOOR',
  AC = 'AC',
  SENSOR = 'SENSOR'
}

export interface DeviceState {
  id: string;
  name: string;
  type: DeviceType;
  isOn: boolean;
  value?: number;
  unit?: string;
}

export interface HomeEnvironment {
  temperature: number;
  humidity: number;
  airQuality: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
