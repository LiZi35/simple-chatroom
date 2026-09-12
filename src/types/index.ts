export interface Message {
    messageId: number
    senderId: string
    senderNickname: string
    content: string
    date: Date
}
export interface ServerMessages {
    messageId: number
    senderId: string
    senderNickname: string
    content: string
    date: number
}
export interface ResMessagesList {
    status: number
    message: string
    newMessages: ServerMessages
}
export interface ResLimitMessagesList {
    status: number
    messageId: number
    limit: number
    messageList: ServerMessages[]
}
export interface socketError {
    on: 'sendMessage' | 'getBeforeMessage' | 'getAfterMessage' | 'getLatestMessageId'
    shouldOut: boolean
    message: string
}
