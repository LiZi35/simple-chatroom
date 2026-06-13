export interface message {
    messageId: number
    senderId: string
    senderNickname: string
    content: string
}
export interface reqMessagesList {
    status: number
    message: string
    messagesList: message[]
}
