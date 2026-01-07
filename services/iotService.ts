
import mqtt, { MqttClient } from 'mqtt';

/**
 * 华为云 IoTDA 真实参数 (基于您提供的 MQTT 链接参数)
 */
export const IOT_CONFIG = {
  // 浏览器必须使用 WSS 协议，通常端口为 443
  hostname: '5bc5a47419.st1.iotda-device.cn-east-3.myhuaweicloud.com',
  port: 443, 
  protocol: 'wss' as const,
  username: '693118372447a4269a6466e2_TEST',
  password: 'e81ca851c91ff6b60798187a44abdeda9a7282c51ba5541d11c1ec164577b89f',
  clientId: '693118372447a4269a6466e2_TEST_0_0_2026010716',
  serviceId: 'light',
  propertyId: 'dengguang'
};

class IoTService {
  private client: MqttClient | null = null;
  private isConnected: boolean = false;
  private onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void;

  /**
   * 建立真实的 MQTT 连接
   */
  async connect(onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void) {
    this.onStatusChange = onStatusChange;
    
    // 华为云 WebSocket URL 格式
    const url = `${IOT_CONFIG.protocol}://${IOT_CONFIG.hostname}:${IOT_CONFIG.port}/mqtt`;
    
    console.log(`[MQTT] 正在通过 WSS 建立连接: ${url}`);

    this.client = mqtt.connect(url, {
      clientId: IOT_CONFIG.clientId,
      username: IOT_CONFIG.username,
      password: IOT_CONFIG.password,
      clean: true,
      connectTimeout: 10000,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('✅ MQTT 连接成功！华为云控制台现在应该显示设备为“在线”。');
      this.onStatusChange?.('connected');
      
      // 订阅属性设置 Topic，以便接收云端下发的命令
      const subTopic = `$oc/devices/${IOT_CONFIG.username}/sys/properties/set/#`;
      this.client?.subscribe(subTopic, (err) => {
        if (!err) console.log(`[MQTT] 已订阅命令下发 Topic: ${subTopic}`);
      });
    });

    this.client.on('error', (err) => {
      console.error('❌ MQTT 连接错误:', err);
      this.onStatusChange?.('error');
    });

    this.client.on('close', () => {
      this.isConnected = false;
      console.log('🔌 MQTT 连接已关闭');
      this.onStatusChange?.('disconnected');
    });

    return new Promise((resolve) => {
      this.client?.once('connect', () => resolve(true));
      this.client?.once('error', () => resolve(false));
    });
  }

  /**
   * 实时上报属性到云端 (MQTT 消息)
   */
  async updateProperty(value: number) {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ 无法上报：MQTT 未连接。设备在云端可能显示为离线。');
      return;
    }

    const topic = `$oc/devices/${IOT_CONFIG.username}/sys/properties/report`;
    const payload = {
      services: [{
        service_id: IOT_CONFIG.serviceId,
        properties: {
          [IOT_CONFIG.propertyId]: value
        },
        event_time: new Date().toISOString().replace(/\.\d+Z$/, 'Z')
      }]
    };

    console.log(`📤 [MQTT PUBLISH] Topic: ${topic}, Value: ${value}`);
    
    this.client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error('上报失败:', err);
      } else {
        console.log('✨ 属性上报成功！请检查云端“物模型数据”刷新。');
      }
    });
  }

  async getCloudStatus() {
    // 默认初始值
    return { dengguang: 125 };
  }

  getIsConnected() {
    return this.isConnected;
  }
}

export const iotService = new IoTService();
