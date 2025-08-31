"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        const woerkId = this.generateWoerkId();
        return this.prisma.project.create({
            data: {
                woerkId,
                shortName: data.shortName,
                description: data.description,
                piOwnerId: userId,
                billingDetails: data.billingDetails,
                isGrantProject: data.isGrantProject || false,
                grantMetadata: data.grantMetadata,
            },
            include: {
                piOwner: true,
                allocations: true,
            },
        });
    }
    async findAll(userId) {
        const where = userId
            ? { piOwnerId: userId }
            : {};
        return this.prisma.project.findMany({
            where,
            include: {
                piOwner: true,
                allocations: {
                    include: {
                        resourceType: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        return this.prisma.project.findUnique({
            where: { id },
            include: {
                piOwner: true,
                allocations: {
                    include: {
                        resourceType: true,
                    },
                },
                dataShares: true,
                resourceManagers: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async update(id, data) {
        return this.prisma.project.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.project.delete({
            where: { id },
        });
    }
    generateWoerkId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 2; i++) {
            result += chars.charAt(Math.floor(Math.random() * 26));
        }
        result += '-';
        for (let i = 0; i < 2; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map