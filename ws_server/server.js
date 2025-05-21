import { WebSocketServer } from 'ws';
import crypto from "crypto";

function decodeId(id)
{
    const decipher = crypto.createDecipher("aes-256-ctr", "#Ge*wLajd/aln5)I(rQbf6hSa_B(wr:4");
    const decrypted = decipher.update(id, "hex", "utf8") + decipher.final("utf8");
    return decrypted.split("|");
}

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

let sessions = new Map();
let admins = [];
//let conversationAdmins = [];

wss.on('connection', (ws) =>
{
    console.log("New connection WebSocket");

    ws.on("message", (message) =>
    {
        const data = JSON.parse(message);
        //console.log(data);

        if(data.type === "visio_on")
        {
            //console.log(`Test avec ${data.id}, ${data.name}`);

            if(admins.length >= 2)
            {
                ws.send(JSON.stringify({ type: "error", message: "Session pleine, accès refusé." }));
                ws.close();
                return;
            }
            
            //admins.set(data.id, {name: data.name, ws});
            admins.push({ id: data.id, name: data.name, ws });

            console.log(`Connection of ${data.name} (${admins.length} users connected)`);

            if(admins.length === 2)
            {
                //console.log("Open session");
                
                admins[0].ws.send(JSON.stringify({ type: "open_session", role: "caller" }));
                //admins[1].ws.send(JSON.stringify({ type: "open_session", role: "callee" }));
            }
        }

        else
        if(data.type === "offer")
        {
            //console.log("receive offer, send to callee");
            admins[1].ws.send(JSON.stringify({ type: "receive_offer", offer: data.offer }));
        }

        else
        if(data.type === "answer")
        {
            //console.log("receive answer, send to caller");
            admins[0].ws.send(JSON.stringify({ type: "receive_answer", answer: data.answer }));
        }

        else
        if(data.type === "ice_candidate")
        {
            //console.log("Receive ICE Candidates");
            
            if(data.role === "caller")
            {
                //console.log("Send ICE candidates to callee");
                
                admins[1].ws.send(JSON.stringify({ type: "receive_ice_candidate", candidate: data.candidate }));
            }

            else
            if(data.role === "callee")
            {
                //console.log("Send ICE candidates to caller");
                
                admins[0].ws.send(JSON.stringify({ type: "receive_ice_candidate", candidate: data.candidate }));
            }
        }

        else
        if(data.type == "visio_off")
        {
            admins.splice(admins.findIndex((item) => item.id == data.id), 1);

            console.log(`Disconnect of ${data.name} (${admins.length} users connected)`);
        }
    });

    ws.on('close', () =>
    {
        /*if (waitingUser === ws)
        {
            waitingUser = null; // Libérer la place si l'utilisateur quitte avant le match
        }*/
    });
});

console.log("Server WebSocket listening");
