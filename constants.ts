
import { DeviceType, DeviceState } from './types';

export const INITIAL_DEVICES: DeviceState[] = [
  { id: 'l1', name: '客厅灯', type: DeviceType.LIGHT, isOn: true },
  { id: 'l2', name: '厨房灯', type: DeviceType.LIGHT, isOn: false },
  { id: 'l3', name: '卧室灯', type: DeviceType.LIGHT, isOn: false },
  { id: 'd1', name: '入户门锁', type: DeviceType.DOOR, isOn: true }, // isOn means Locked
  { id: 'd2', name: '车库门', type: DeviceType.DOOR, isOn: true },
  { id: 'a1', name: '中央空调', type: DeviceType.AC, isOn: false, value: 24, unit: '°C' }
];

export const MOCK_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temp: 22 + Math.random() * 5,
  humidity: 45 + Math.random() * 10
}));
