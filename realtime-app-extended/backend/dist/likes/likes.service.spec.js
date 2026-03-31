"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const likes_service_1 = require("./likes.service");
describe('LikesService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [likes_service_1.LikesService],
        }).compile();
        service = module.get(likes_service_1.LikesService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=likes.service.spec.js.map