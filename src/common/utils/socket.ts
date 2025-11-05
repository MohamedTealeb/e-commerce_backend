import { Socket } from "socket.io";

export const getSocketAuth=(client:Socket):string=>{

    const authorization=client.handshake.auth.authorization?? client.handshake.headers.authorization
    if(!authorization){

        client.emit("exception","missing authorization token")
    }
    return authorization
}