const express = require("express");
const amqp = require("amqplib");
const app = express();
const PORT = process.env.PORT || 5002;
app.use(express.json());

var channel, connection;
connectQueue()  // call the connect function
 
async function connectQueue() {
    try {
        connection = await amqp.connect("amqp://nginx-mq:9000");
        channel    = await connection.createChannel()
        
        await channel.assertQueue("notify")
        
        channel.consume("notify", data => {
            const msg = `${Buffer.from(data.content)}`
            const json = JSON.parse(msg)
            console.log(`send notification to ${json.email}`)
            // console.log(`${Buffer.from(data.content)}`);
            channel.ack(data);
        })
    } catch (error) {
        console.log(error);
    }
}

app.listen(PORT, () => console.log("Server running at port " + PORT));