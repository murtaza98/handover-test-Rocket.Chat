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
import {LivechatUpdater} from '@rocket.chat/apps-engine/server/accessors/LivechatUpdater';
import {AppManager} from '@rocket.chat/apps-engine/server/AppManager';

export class HandoverTestApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executePostMessageSent(
        message: IMessage, read: IRead, http: IHttp, persistence: IPersistence,
        modify: IModify): Promise<void> {

            const SettingBotUsername = 'LiveAgentBot';
            if (message.sender.username === SettingBotUsername) {
                return;
            } else if (message.room.type !== 'l') {
                return;
            }

            const lmessage: ILivechatMessage = message;
            const lroom: ILivechatRoom = lmessage.room as ILivechatRoom;
            let lBotUser: IUser = message.sender; // tmp assignment since lroom.servedBy can be undefined
            if (lroom.servedBy) {
                lBotUser = lroom.servedBy;
            }

            // Debug
            // this.getLogger().log(`app.${ this.getNameSlug() }`);
            this.getLogger().log('message sent by username --> ' + message.sender.username);
            this.getLogger().log('Room type --> ' + message.room.type);
            this.getLogger().log('roles --> ' + message.sender.roles);
            this.getLogger().log('served by --> ' + lBotUser.username);

            if (SettingBotUsername !== lBotUser.username) {
                return;
            }
            if (message.text === 'perform_handover') {
                const visitor: IVisitor = (lmessage.visitor && lmessage.visitor) || {name: 'temp', token: 'dummy', username: 'dummy'};
                console.log(visitor.name);
                const livechatUpdater: LivechatUpdater = new LivechatUpdater(AppManager.Instance.getBridges(), this.getID());
                livechatUpdater.transferVisitor(visitor, {currentRoom: lroom, targetDepartment: 'TestBotDepartment'});
                console.log('done');
            }
    }
}
