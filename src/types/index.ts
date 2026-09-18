export interface Message {
    messageId: number
    senderId: string
    senderNickname: string
    content: string
    date: Date
}
export interface ServerMessage {
    messageId: number
    senderId: string
    senderNickname: string
    content: string
    date: number
}
export interface ResMessage {
    status: number
    message: string
    newMessage: ServerMessage
}
export interface ResLimitMessagesList {
    status: number
    messageId: number
    limit: number
    messageList: ServerMessage[]
}
export interface socketError {
    on: 'sendMessage' | 'getBeforeMessage' | 'getAfterMessage' | 'getLatestMessageId'
    shouldOut: boolean
    message: string
}
