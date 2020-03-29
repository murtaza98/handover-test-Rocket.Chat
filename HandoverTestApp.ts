import {
    IAppAccessors,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { ILivechatMessage, ILivechatRoom, IVisitor } from '@rocket.chat/apps-engine/definition/livechat';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { LivechatUpdater } from '@rocket.chat/apps-engine/server/accessors/LivechatUpdater';
import { AppManager } from '@rocket.chat/apps-engine/server/AppManager';

export class HandoverTestApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executePostMessageSent( message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
            const livechatMessage: ILivechatMessage = message;
            const livechatRoom: ILivechatRoom = livechatMessage.room as ILivechatRoom;

            const livechatVisitor: IVisitor = livechatRoom.visitor;
            const livechatUpdater: LivechatUpdater = new LivechatUpdater(
                AppManager.Instance.getBridges(),
                this.getID());

            livechatUpdater.transferVisitor(
                livechatVisitor,
                {
                    currentRoom: livechatRoom,
                    targetDepartment: 'TestBotDepartment',
                },
            );
    }
}
