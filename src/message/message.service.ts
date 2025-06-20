import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as WebSocket from 'ws';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PancakeApiService } from 'src/pancake-api/pancake-api.service';
import axios from 'axios';
import { PagesService } from 'src/pages/pages.service';
@Injectable()
export class MessageService implements OnModuleDestroy {
    private ws: WebSocket;
    private readonly websocketUrl = 'wss://pages.fm/socket/websocket?vsn=2.0.0';
    private heartbeatInterval: NodeJS.Timeout;
    private abortFetchingN8NControllers: Map<string, AbortController> = new Map();
    private isReconnecting: boolean = false;
    private reconnectInterval: NodeJS.Timeout;
    private accessTokens: string[];
    private accessTokenHealthInterval: NodeJS.Timeout;
    private currentAccessToken: string;
    private currentActivePages: any[];
    constructor(
        private readonly pancakeApiService: PancakeApiService,
        private readonly pagesService: PagesService,
    ) { }

    async onModuleDestroy() {
        this.closeWebSocket();
    }

    private reconnectWebSocket(): void {
        if (this.isReconnecting) {
            console.log('Reconnect already in progress...');
            return;
        }
        this.isReconnecting = true;
        this.reconnectInterval = setInterval(async () => {
            console.log('Attempting to reconnect WebSocket...');
            try {
                await this.connectWebSocket(this.accessTokens);
                clearInterval(this.reconnectInterval);
                this.isReconnecting = false;
                console.log('WebSocket reconnected successfully!');
            } catch (error) {
                console.error('Reconnect attempt failed:', error.message);
            }
        }, 5000);
    }

    async connectWebSocket(accessTokens: string[]): Promise<void> {
        try {
            this.accessTokens = accessTokens;
            const { accessToken, activePages } = await this.getRandomAccessToken()
            this.currentAccessToken = accessToken;
            this.currentActivePages = activePages;
            this.ws = new WebSocket(this.websocketUrl);
            this.ws.on('open', async () => {
                console.log('WebSocket connection opened');
                await this.handleWebSocketOpen(this.currentAccessToken, this.currentActivePages);
            });

            this.ws.on('message', (message) => {
                this.handleWebSocketMessage(message, this.currentActivePages);
            });

            this.ws.on('close', (code, reason: string) => {
                this.handleWebSocketClose(code, reason);
            });

            this.ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.stopHeartbeat();
                this.stopAccessTokenHealthCheck();
            });
        } catch (error) {
            console.error('Error connecting WebSocket:', error.message);
        }
    }

    private async handleWebSocketOpen(accessToken: string, activePages: any[]): Promise<void> {
        try {
            const userId = await this.generateUserId(accessToken)
            const joinMessage = JSON.stringify([
                "4",
                "4",
                `users:${userId}`,
                "phx_join",
                {
                    accessToken,
                    userId,
                    platform: "web",
                },
            ]);
            await this.ws.send(joinMessage);
            const activedPageIdes = activePages.map(({ id }) => id);
            console.log('actived pages:', activedPageIdes)
            const message = JSON.stringify([
                "7",
                "7",
                activePages.length === 1
                    ? `pages:${activePages[0].id}`
                    : `multiple_pages:${userId}`,
                "phx_join",
                {
                    accessToken,
                    userId,
                    clientSession: uuidv4(),
                    pageIds: activedPageIdes,
                    platform: "web",
                },
            ]);
            await this.ws.send(message);
            await this.startHeartbeat();
            await this.startAccessTokenHealthCheck()
        } catch (error) {
            console.error('Error during WebSocket open handling:', error.message);
        }
    }

    private async handleWebSocketMessage(message: WebSocket.Data, activePages: any[]): Promise<void> {
        try {
            const parsedMessage = JSON.parse(message.toString());
            const eventType = parsedMessage[3];
            const payload = parsedMessage[4];
            const { page_id: pageId, conversation } = payload;
            const hasSomeTags = conversation?.tags?.some(tag => tag >= 0)
            if (hasSomeTags) {
                console.log('Event type is not a new message:', conversation?.tags);
                return
            }

            if (eventType !== 'pages:update_conversation') {
                console.log('Event type is not a new message:', eventType);
                return;
            }

            const isSentByBot = activePages.some(({ name }) => name === conversation?.last_sent_by?.name)
            if (!Array.isArray(parsedMessage) || parsedMessage.length <= 4 || !conversation?.id) {
                console.warn('Unexpected message format:', parsedMessage);
                return;
            }

            if (!pageId || !conversation) {
                console.warn('Missing pageId or conversation in message payload');
                return;
            }
            if (isSentByBot) {
                console.log('Message sent by bot, ignoring...');
                return;
            }
            if (conversation.assignee_ids.length || conversation.assignee_group_id) {
                console.log('Message assignee to someone else, ignoring...');
                return;
            }
            await this.sendBackMessage(pageId, conversation, activePages);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error.message);
        }
    }

    private handleWebSocketClose(code: number, reason: string): void {
        console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
        this.stopHeartbeat();
        this.stopAccessTokenHealthCheck();
        this.reconnectWebSocket();
    }

    private closeWebSocket(): void {
        if (this.ws) {
            this.ws.close();
            console.log('WebSocket connection closed manually');
        }
        this.stopHeartbeat();
        this.stopAccessTokenHealthCheck();
    }

    private startAccessTokenHealthCheck() {
        this.accessTokenHealthInterval = setInterval(async () => {
            try {
                await this.pancakeApiService.listPage({ accessToken: this.currentAccessToken })
                console.log('Checked access token...')
            } catch (error) {
                console.warn('Changing access token...')
                const { accessToken, activePages } = await this.getRandomAccessToken();
                this.currentAccessToken = accessToken;
                this.currentActivePages = activePages;
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    await this.handleWebSocketOpen(this.currentAccessToken, this.currentActivePages);
                }
            }
        }, 60000);
    }

    private stopAccessTokenHealthCheck() {
        if (this.accessTokenHealthInterval) {
            clearInterval(this.accessTokenHealthInterval);
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                console.log('Sending heartbeat...');
                this.ws.ping();
            }
        }, 50000);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            console.log('Heartbeat stopped');
        }
        this.reconnectWebSocket();
    }

    private async sendBackMessage(
        pageId: string,
        conversation: any,
        activePages: any
    ): Promise<void> {
        try {
            const isInSupportedTime = await this.isInSupportedTime()
            if (!isInSupportedTime) {
                console.log('Out of supported reply time, skipping...');
                return;
            }
            const { accessToken } = await this.getRandomAccessToken()
            const conversationId = conversation?.id;
            const customerId = conversation?.customers?.[0]?.id || '';
            const customerName = conversation?.customers?.[0]?.name || '';
            if (!pageId || !conversationId || !customerId) {
                console.warn('Missing get messages :', { pageId, conversationId, customerId });
                return;
            }
            const { messages } = await this.pancakeApiService.getMessages({
                pageId,
                conversationId,
                accessToken,
                customerId
            });
            const { product } = await this.pagesService.getPageByPancakePageId(pageId)

            if (!product.id) {
                console.log("No Product Supported!")
                return
            }
            const historyMessage = messages.map((m) => {
                if (m.attachments.length === 1 && m.attachments[0].type === 'replied_message') {
                    return (
                        {
                            message: `${activePages.some(({ name }) => name === m.attachments[0].from.name) ?
                                "shop nói: " :
                                "mình nói: "} ${m.attachments[0].message}
                              ${m.original_message}`,
                            type: activePages.some(({ name }) => name === m.from.name) ? "system" : 'human',
                            image_urls: m.attachments?.[0]?.attachments
                                ?.filter(item => item?.url)
                                .map(item => item.url.toString()) || []
                        }
                    )
                } else if (m.attachments.length === 1 && m.attachments[0].type === 'sticker') {
                    return (
                        {
                            message: messages.length === 1 ? "." : "ok",
                            type: activePages.some(({ name }) => name === m.from.name) ? "system" : 'human',
                            image_urls: []
                        }
                    )
                }
                return ({
                    message: m.original_message,
                    type: activePages.some(({ name }) => name === m.from.name) ? "system" : 'human',
                    image_urls: (m.attachments || [])
                        .filter(a => a?.url)
                        .map(a => a.url.toString())
                })
            })

            const response = await this.getResponseFromN8N({ conversationId, messages: historyMessage, product_id: product.id, customer_name: customerName })
            if (!response.length) {
                console.log("No response")
                return
            }

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            for (const item of response) {
                if (item.content === 'no_response') {
                    console.log("no_response")
                    return
                }
                if (item.attach_files.length) {
                    const defaultDimension = {
                        width: 1080,
                        height: 1080
                    };
                    const MAX_IMAGES_PER_MESSAGE = 15;
                    const chunks: any[] = [];
                    for (let i = 0; i < item.attach_files.length; i += MAX_IMAGES_PER_MESSAGE) {
                        chunks.push(item.attach_files.slice(i, i + MAX_IMAGES_PER_MESSAGE));
                    }
                    for (const chunk of chunks) {
                        await this.pancakeApiService.sendInbox({
                            data: {
                                content_urls: chunk,
                                dimensions: chunk.map(() => ({ ...defaultDimension })),
                            },
                            pageId,
                            conversationId,
                            accessToken
                        });
                        await delay(100);
                    }
                }
                const sentences = item.content
                    .replace(/{{customer_name}}|customer_name/g, customerName)
                    .split(".")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);

                for (const sentence of sentences) {
                    await this.pancakeApiService.sendInbox({
                        data: {
                            message: sentence.replace(/(\\n)+/g, "\r\n"),
                        },
                        pageId,
                        conversationId,
                        accessToken,
                    });
                    await delay(100)
                }
            };

            await this.pancakeApiService.markUnread({ pageId, conversationId, accessToken })
        } catch (error) {
            console.error('Error send back message :', error.message);
        }
    }

    async generateUserId(token: string): Promise<string> {
        try {
            const decoded: any = jwt.decode(token);
            return decoded?.uid || '';
        } catch (error) {
            console.error('Error decoding token:', error.message);
            return ''
        }
    }

    private async getResponseFromN8N(request: any): Promise<any[]> {
        const { conversationId, messages, product_id, customer_name } = request
        try {
            if (this.abortFetchingN8NControllers.has(conversationId)) {
                console.log(`Aborting previous request for conversation ${conversationId}`);
                this.abortFetchingN8NControllers.get(conversationId)?.abort();
            }
            const controller = new AbortController();
            this.abortFetchingN8NControllers.set(conversationId, controller);
            const data = {
                messages,
                product_id,
                customer_name
            }
            const apiUrl = 'https://n8n.aibus.dev/webhook/az-ai-bot/83e2d517-56f8-4e7a-a7ad-d95b7e9cda24'
            console.log(apiUrl)
            const response = await axios.post(apiUrl, data, {
                signal: controller.signal
            });
            return response?.data
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log(`Request for conversation ${conversationId} was canceled.`);
            } else {
                console.error('Error when get response from n8n:', error.message);
            }
            return []
        }
        finally {
            this.abortFetchingN8NControllers.delete(conversationId);
        }
    }

    private async getRandomAccessToken(): Promise<{
        accessToken: string,
        activePages: any[]
    }> {
        let tokens = [...this.accessTokens];
        while (tokens.length > 0) {
            const randomIndex = Math.floor(Math.random() * tokens.length);
            const accessToken = tokens[randomIndex];
            try {
                const supportedPages = await this.pagesService.getPagesByAccessToken(accessToken)
                const supportedPageIds = supportedPages.map(({ page_id }) => page_id)
                const pancakePages = await this.pancakeApiService.listPage({ accessToken });
                const checkActivedPages = await this.pancakeApiService.checkActivedPages({ accessToken, pageIds: pancakePages?.categorized?.activated_page_ids })
                let activePages = !!checkActivedPages.success ?
                    pancakePages?.categorized?.activated :
                    pancakePages?.categorized?.activated?.filter(({ id }) => {
                        const errorPageIds = checkActivedPages?.errors?.map(({ page_id }) => page_id)
                        return !errorPageIds.includes(id)
                    })
                activePages = activePages.filter(page => supportedPageIds.includes(page.id));
                if (!activePages.length) {
                    process.exit(1);
                }
                return {
                    accessToken,
                    activePages
                }
            } catch (error) {
                tokens.splice(randomIndex, 1);
                this.accessTokens = this.accessTokens.filter(t => t !== accessToken);
                console.warn(`AccessToken died and removed: ${accessToken}`);
            }
        }
        console.error('No alive access token found');
        process.exit(1);
    }

    private async isInSupportedTime(): Promise<boolean> {
        const supportedTime = process.env.SUPPORTED_TIME || "";
        if (!supportedTime) {
            return true;
        }

        const [startStr, endStr] = supportedTime.replace(/h/g, '').split('-');
        const startHour = parseInt(startStr, 10);
        const endHour = parseInt(endStr, 10);

        const now = new Date();
        const vnHour = (now.getUTCHours() + 7) % 24;

        if (startHour > endHour) {
            return vnHour >= startHour || vnHour <= endHour;
        }

        return vnHour >= startHour && vnHour <= endHour;
    }
}

