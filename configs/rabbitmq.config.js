const amqp = require('amqplib');

let connection = null;
let channel = null;

// Tách riêng tên queue cho môi trường Development (local) và Production (Render)
// Tránh việc Worker trên Render và Local cướp message của nhau khi dùng chung CloudAMQP
const MEDIA_QUEUE = process.env.RABBITMQ_MEDIA_QUEUE || (
  process.env.NODE_ENV === 'production' ? 'media_upload_queue' : 'media_upload_queue_dev'
);

const resolveQueueName = (name) => {
  if (name === 'media_upload_queue') {
    return MEDIA_QUEUE;
  }
  return name;
};

const connectRabbitMQ = async () => {
  try {
    if (channel) return channel;

    const rabbitUrl = process.env.RABBITMQ_URL;
    if (!rabbitUrl) {
      throw new Error('Chưa cấu hình biến RABBITMQ_URL trong file .env');
    }

    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();

    connection.on('error', (err) => {
      console.error('RabbitMQ Connection Error:', err.message);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      console.warn('RabbitMQ Connection Closed');
      channel = null;
      connection = null;
    });

    console.log('Đã kết nối RabbitMQ thành công!');
    return channel;
  } catch (error) {
    console.error('Lỗi kết nối RabbitMQ:', error.message);
    throw error;
  }
};

const sendToQueue = async (queueName, data) => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }
    const actualQueue = resolveQueueName(queueName);
    // durable: true giúp queue không bị mất khi restart server
    await channel.assertQueue(actualQueue, { durable: true });
    channel.sendToQueue(actualQueue, Buffer.from(JSON.stringify(data)), {
      persistent: true, // Lưu message trên ổ đĩa
    });
    console.log(`[RabbitMQ] Đã gửi message vào queue: ${actualQueue}`);
    return true;
  } catch (error) {
    console.error(`[RabbitMQ] Gửi message thất bại:`, error.message);
    throw error;
  }
};

module.exports = {
  connectRabbitMQ,
  sendToQueue,
  MEDIA_QUEUE,
};

