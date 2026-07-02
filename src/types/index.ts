export interface Message {
    messageId: number
    senderId: string
    senderNickname: string
    content: string
    date: Date
}
export interface ResMessagesList {
    status: number
    message: string
    messagesList: Message[]
}
