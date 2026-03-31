"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const followers_controller_1 = require("./followers.controller");
describe('FollowersController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [followers_controller_1.FollowersController],
        }).compile();
        controller = module.get(followers_controller_1.FollowersController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=followers.controller.spec.js.map