const amqp = require('amqplib');

let connection = null;
let channel = null;

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
    // durable: true giúp queue không bị mất khi restart server
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true, // Lưu message trên ổ đĩa
    });
    console.log(`[RabbitMQ] Đã gửi message vào queue: ${queueName}`);
    return true;
  } catch (error) {
    console.error(`[RabbitMQ] Gửi message thất bại:`, error.message);
    throw error;
  }
};

module.exports = {
  connectRabbitMQ,
  sendToQueue,
};

