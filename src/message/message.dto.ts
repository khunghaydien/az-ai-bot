export class GetAttachmentMessageDto {
    customers: any;
    pageAccessToken: string;
    pageId: string;
    conversationId: string
}
export class GetResponseFromN8N {
    messages: {
        message: string,
        image_urls: string[],
        isSentByCustomer: boolean
    }[]
    conversationId: string
}