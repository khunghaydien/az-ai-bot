export class ListPageDto {
    accessToken: string;
}


export class GetMessagesDto {
    accessToken: string;
    customerId: string;
    conversationId: string;
    pageId: string;
    currentCount?: string;
}

export class SendInboxDto {
    pageId: string;
    conversationId: string;
    accessToken: string;
    data: any;
}
export class MarkSeenDto {
    pageId: string;
    conversationId: string;
    accessToken: string;
}

export class CheckActivedPages {
    accessToken: string
    pageIds: string[]
}