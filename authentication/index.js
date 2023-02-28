const express = require("express");
const amqp = require("amqplib");
const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(express.urlencoded({extended: true, limit: '1mb'}))

app.set('view engine', 'pug');

connectQueue()

var channel, connection;  //global variables
async function connectQueue() {
    try {
        connection = await amqp.connect("amqp://nginx-mq:9000");
        channel = await connection.createChannel()

        await channel.assertQueue("notify")
        await channel.assertQueue("logs")

    } catch (error) {
        console.log(error)
    }
}

async function sendData(data) {
    // send data to queue
    await channel.sendToQueue("notify", Buffer.from(JSON.stringify(data)));

    // close the channel and connection
    // await channel.close();
    // await connection.close();
}

async function logs(data) {
    // send data to queue
    await channel.sendToQueue("logs", Buffer.from(JSON.stringify(data)));

    // close the channel and connection
    // await channel.close();
    // await connection.close();
}
app.get("/", (req, res) =>{
    res.render('index', {
        title: 'Welcome to RabbitMQ',
    });
})
app.post("/auth", (req, res) => {
    // data to be sent
    const data = {
        email: req.body.email,
        password: req.body.password,
    }

    res.render('success', {
        title: 'Your are logged in RabbitMQ',
    });
    sendData(data);  // pass the data to the function we defined
    logs(data)
    console.log("A message is sent to queue")

})
app.listen(PORT, () => console.log("Server running at port " + PORT));