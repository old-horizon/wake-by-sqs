import AWS from 'aws-sdk';
import wol from 'wakeonlan';

const region = process.env['REGION']!!;
const queueUrl = process.env['SQS_QUEUE_URL']!!;

AWS.config.update({ region });
const sqs = new AWS.SQS();

console.log('Waiting wake messages...');

(async () => {
    while (true) {
        try {
            const data = await sqs.receiveMessage({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20
            }).promise();

            for (const message of data.Messages || []) {
                const wakeMessage = JSON.parse(message.Body!!) as WakeMessage;
                await wol(wakeMessage.macAddress);
                console.log(`Magic packet has sent: ${wakeMessage.macAddress}`);

                await sqs.deleteMessage({
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle!!
                }).promise();
            }
        } catch (e) {
            console.error(e);
        }
    }
})();

interface WakeMessage {
    macAddress: string
}
