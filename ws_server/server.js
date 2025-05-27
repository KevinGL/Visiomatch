import { WebSocketServer } from 'ws';
import { DateTime } from "luxon";

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

let users = [];
let conversations = [];
let admins = [];

let usersTalk = [];

const dateDuration = 10 * 60 * 1000;

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

            const indexUser = users.findIndex((u) => u.id === data.userId);

            if(indexUser === -1)
            {
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

        else
        if(data.type === "speed_dating_off")
        {
            users.splice(users.findIndex((u) => u.id === data.userId), 1);

            console.log(`Disconnect of ${data.name} (${users.length} connected)`);

            const indexConversNotOver = conversations.findIndex((c) => (c.id1 === data.userId || c.id2 === data.userId) && Date.now() - c.timestamp < dateDuration);

            //console.log(conversations, data.userId);
            //console.log(indexConversNotOver);

            if(indexConversNotOver > -1)
            {
                const conversNotOver = conversations[indexConversNotOver];
                let ghosted;

                if(conversNotOver.id1 === data.userId)
                {
                    ghosted = conversNotOver.id2;
                }

                else
                if(conversNotOver.id2 === data.userId)
                {
                    ghosted = conversNotOver.id1;
                }

                const indexGhosted = users.findIndex((u) => u.id === ghosted);

                if(indexGhosted > -1)
                {
                    users[indexGhosted].ws.send(JSON.stringify({ type: "speed_dating_ghost" }));
                }
            }

            const indexConversation = conversations.findIndex((c) => c.id1 === data.userId || c.id2 === data.userId);
            
            if(indexConversation > -1)
            {
                conversations.splice(indexConversation, 1);
            }

            //console.log(conversations);
        }

        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        //////////////////////////////

        else
        if(data.type === "talk_connect")
        {
            const index = usersTalk.findIndex((u) => u.id === data.id);
            
            if(index === -1)
            {
                usersTalk.push({ id: data.id, ws, lastPing: Date.now() });
            }
        }

        else
        if(data.type === "talk")
        {
            //console.log(data);

            const index = usersTalk.findIndex((u) => u.id === data.interlocutorId);

            //console.log(`${data.interlocutorId} => ${index}`);

            if(index !== -1)
            {
                usersTalk[index].ws.send(JSON.stringify({ type: "talk_res", author: data.id, content: data.content }));
                usersTalk[index].lastPing = Date.now();
            }
        }

        /*else
        if(data.type === "talk_ping")
        {
            const index = usersTalk.findIndex((u) => u.id === data.id);

            if(index !== -1)
            {
                usersTalk[index].lastPing = Date.now();
                console.log(`Ping of ${data.id}`);
            }
        }*/

        else
        if(data.type === "talk_off")
        {
            usersTalk = usersTalk.filter((u) => u.id !== data.id);
            console.log(`Disconnect of ${data.id}, ${usersTalk.length} connected`);
        }
    });
});

console.log("Server WebSocket listening");

const checkEndSession = () =>
{
    const currentDate = DateTime.now().setZone("Europe/Paris");

    if(currentDate.weekday === 2 || currentDate.weekday === 4 || currentDate.weekday === 7)      //Thursday, Tuesday or Sunday
    {
        if(currentDate.hour === 21 && currentDate.minute === 10)       //At 21:10 (End speed dating + latence)
        {
            users.length = 0;
            conversations.length = 0;
        }
    }
};

/*const checkUserTalking = () =>
{
    for(let i = usersTalk.length - 1 ; i > -1; i--)
    {
        //if(Date.now() - usersTalk[i].lastPing > 5 * 60 * 1000)
        if(Date.now() - usersTalk[i].lastPing > 10000)
        {
            console.log(`Disconnect ${usersTalk[i].id}`);
            usersTalk.splice(i, 1);
        }
    }
}*/

setInterval(checkEndSession, 60000);
//setInterval(checkUserTalking, 5 * 60 * 1000);
//setInterval(checkUserTalking, 5000);