import { WebSocketServer } from 'ws';
import crypto from "crypto";

function decodeId(id)
{
    const decipher = crypto.createDecipher("aes-256-ctr", "#Ge*wLajd/aln5)I(rQbf6hSa_B(wr:4");
    const decrypted = decipher.update(id, "hex", "utf8") + decipher.final("utf8");
    return decrypted.split("|");
}

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

let users = [];
let conversations = [];
//let likes = [];
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
        if(data.type === "visio_off")
        {
            admins.splice(admins.findIndex((item) => item.id == data.id), 1);

            console.log(`Disconnect of ${data.name} (${admins.length} users connected)`);
        }

        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        //////////////////////////////

        else
        if(data.type === "speed_dating_on")
        {
            //console.log(data.orientation);

            const user = {
                id: data.userId,
                idMeeting: data.idMeeting,
                name: data.name,
                orientation: data.orientation,
                gender: data.gender,
                ws
            };

            users.push(user);

            console.log(`Connection of ${data.name} (${users.length} connected)`);

            const indexOtherUser = users.findIndex((u) => u.idMeeting === user.idMeeting && u.id !== user.id);
            
            if(indexOtherUser > -1)
            {
                const conversation = { id1: user.id, id2: users[indexOtherUser].id, timestamp: Date.now() };
                
                if((data.orientation === "man_woman" && users[indexOtherUser].gender !== user.gender ||
                   data.orientation !== "man_woman" && users[indexOtherUser].gender === user.gender) &&
                   conversations.findIndex((c) => conversation.id1 === c.id1 && conversation.id2 === c.id2 || conversation.id1 === c.id2 && conversation.id2 === c.id1) === -1)
                {
                    ws.send(JSON.stringify({ type: "speed_dating_open_session", interlocutor: users[indexOtherUser].id, role: "caller", timestamp: conversation.timestamp }));
                    //users[indexOtherUser].ws.send(JSON.stringify({ type: "speed_dating_open_session", index: users.length - 1, role: "callee" }));
                    
                    conversations.push(conversation);

                    console.log(conversation);
                }
            }
        }

        else
        if(data.type === "speed_dating_offer")
        {
            //console.log("receive offer, send to callee");

            const indexInterlocutor = users.findIndex((u) => u.id === data.interlocutor);

            if(indexInterlocutor > -1)
            {
                const indexConversation = conversations.findIndex((c) => c.id1 === data.userId && c.id2 === data.interlocutor || c.id2 === data.userId && c.id1 === data.interlocutor);
                
                users[indexInterlocutor].ws.send(JSON.stringify({ type: "speed_dating_receive_offer", offer: data.offer, callerId: data.userId, timestamp: conversations[indexConversation].timestamp }));
            }
        }

        else
        if(data.type === "speed_dating_answer")
        {
            //console.log("receive answer, send to caller");

            const indexCaller = users.findIndex((u) => u.id === data.callerId);

            if(indexCaller > -1)
            {
                users[indexCaller].ws.send(JSON.stringify({ type: "speed_dating_receive_answer", answer: data.answer }));
            }
        }

        else
        if(data.type === "speed_dating_ice_candidates")
        {
            console.log("Receive ICE Candidates");

            const indexInterlocutor = users.findIndex((u) => u.id === data.interlocutor);

            //console.log(data.interlocutor, indexInterlocutor);
            
            if(indexInterlocutor > -1)
            {
                //console.log("Send ICE candidates to callee");
                
                users[indexInterlocutor].ws.send(JSON.stringify({ type: "speed_dating_receive_ice_candidate", candidate: data.candidate }));
            }
        }

        /*else
        if(data.type === "speed_dating_like")
        {
            const like = { emit: data.userId, recept: data.interlocutor, value: data.value, ws };
            
            likes.push(like);

            //console.log(likes);

            const indexLike = likes.findIndex((l) => (l.emit === like.recept || l.recept === like.emit) && like.value && l.value);

            let match = false;

            if(indexLike > -1)
            {
                //console.log("Match");
                match = true;
            }

            ws.send(JSON.stringify({ type: "speed_dating_match", match: match ? data.interlocutor : "" }));
        }*/

        else
        if(data.type === "speed_dating_off")
        {
            users.splice(users.findIndex((u) => u.id === data.userId), 1);

            console.log(`Disconnect of ${data.name} (${users.length} connected)`);
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
