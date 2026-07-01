export interface message {
    messageId: number
    senderId: string
    senderNickname: string
    content: string
    date: Date
}
export interface reqMessagesList {
    status: number
    message: string
    messagesList: message[]
}
