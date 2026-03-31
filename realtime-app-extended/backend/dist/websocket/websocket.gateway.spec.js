"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const websocket_gateway_1 = require("./websocket.gateway");
describe('WebsocketGateway', () => {
    let gateway;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [websocket_gateway_1.WebsocketGateway],
        }).compile();
        gateway = module.get(websocket_gateway_1.WebsocketGateway);
    });
    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
//# sourceMappingURL=websocket.gateway.spec.js.map