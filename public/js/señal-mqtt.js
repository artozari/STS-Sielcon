const mqtt = require("mqtt");
const brokerUrl = "ws://dev01.sielcon.net:9105";
const client = mqtt.connect(brokerUrl);

client.on("connect", function () {
    console.log("Connected to MQTT broker:", brokerUrl);
    client.subscribe("cutoff/enable", { qos: 1 }, function (err) {
        if (err) {
            console.error("Subscribe error:", err);
            return;
        }
        console.log("Subscribed to cutoff/enable topic");
    });
});

client.publish("cutoff/enable", "true", { qos: 1 }, function (err) {
    if (err) {
        console.error("Publish error:", err);
    } else {
        console.log("Published 'true' to cutoff/enable topic");
    }
});

setInterval(async () => {
    const response = await fetch("http://localhost:3000/lastCutOff", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    client.publish("cutoff/enable", JSON.stringify(data), { qos: 1 }, function (err) {
        if (err) {
            console.error("Publish error:", err);
        } else {
            console.log("Published data to cutoff/enable topic");
        }
    });
}, 3000);

client.on("reconnect", function () {
    console.log("Reconnecting to MQTT broker...");
});

client.on("close", function () {
    console.log("MQTT connection closed");
});

client.on("offline", function () {
    console.log("MQTT client is offline");
});

client.on("error", function (err) {
    console.error("MQTT error:", err?.message || err);
});

client.on("message", function (topic, message) {
    console.log("MQTT message received:", topic, message.toString());
});
