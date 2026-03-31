"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const followers_service_1 = require("./followers.service");
describe('FollowersService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [followers_service_1.FollowersService],
        }).compile();
        service = module.get(followers_service_1.FollowersService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=followers.service.spec.js.map