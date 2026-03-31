"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const likes_controller_1 = require("./likes.controller");
describe('LikesController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [likes_controller_1.LikesController],
        }).compile();
        controller = module.get(likes_controller_1.LikesController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=likes.controller.spec.js.map