import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, data: {
        shortName: string;
        description?: string;
        billingDetails?: any;
        isGrantProject?: boolean;
        grantMetadata?: any;
    }): Promise<{
        piOwner: {
            id: number;
            username: string;
            email: string;
            fullName: string;
            emailVerified: Date | null;
            passwordHash: string | null;
            title: string | null;
            position: string | null;
            role: import("@prisma/client").$Enums.UserRole | null;
            university: string | null;
            department: string | null;
            defaultIndex: string | null;
            defaultActivityCode: string | null;
            createdAt: Date;
            updatedAt: Date;
            defaultProjectId: number | null;
        };
        allocations: {
            id: number;
            projectId: number;
            resourceTypeId: number;
            allocationModel: import("@prisma/client").$Enums.AllocationModel;
            quantity: Prisma.Decimal;
            periodStart: Date;
            periodEnd: Date;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: Prisma.JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: Prisma.JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }>;
    findAll(userId?: number): Promise<({
        piOwner: {
            id: number;
            username: string;
            email: string;
            fullName: string;
            emailVerified: Date | null;
            passwordHash: string | null;
            title: string | null;
            position: string | null;
            role: import("@prisma/client").$Enums.UserRole | null;
            university: string | null;
            department: string | null;
            defaultIndex: string | null;
            defaultActivityCode: string | null;
            createdAt: Date;
            updatedAt: Date;
            defaultProjectId: number | null;
        };
        allocations: ({
            resourceType: {
                id: number;
                name: string;
                unit: string;
                isStorageType: boolean;
            };
        } & {
            id: number;
            projectId: number;
            resourceTypeId: number;
            allocationModel: import("@prisma/client").$Enums.AllocationModel;
            quantity: Prisma.Decimal;
            periodStart: Date;
            periodEnd: Date;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: Prisma.JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: Prisma.JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    })[]>;
    findOne(id: number): Promise<({
        dataShares: {
            id: number;
            createdAt: Date;
            name: string;
            projectId: number;
            sourceAllocationId: number;
            storageSubtype: import("@prisma/client").$Enums.StorageSubtype;
            dataStewardId: number | null;
            securityGroupId: number;
        }[];
        piOwner: {
            id: number;
            username: string;
            email: string;
            fullName: string;
            emailVerified: Date | null;
            passwordHash: string | null;
            title: string | null;
            position: string | null;
            role: import("@prisma/client").$Enums.UserRole | null;
            university: string | null;
            department: string | null;
            defaultIndex: string | null;
            defaultActivityCode: string | null;
            createdAt: Date;
            updatedAt: Date;
            defaultProjectId: number | null;
        };
        allocations: ({
            resourceType: {
                id: number;
                name: string;
                unit: string;
                isStorageType: boolean;
            };
        } & {
            id: number;
            projectId: number;
            resourceTypeId: number;
            allocationModel: import("@prisma/client").$Enums.AllocationModel;
            quantity: Prisma.Decimal;
            periodStart: Date;
            periodEnd: Date;
        })[];
        resourceManagers: ({
            user: {
                id: number;
                username: string;
                email: string;
                fullName: string;
                emailVerified: Date | null;
                passwordHash: string | null;
                title: string | null;
                position: string | null;
                role: import("@prisma/client").$Enums.UserRole | null;
                university: string | null;
                department: string | null;
                defaultIndex: string | null;
                defaultActivityCode: string | null;
                createdAt: Date;
                updatedAt: Date;
                defaultProjectId: number | null;
            };
        } & {
            projectId: number;
            userId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: Prisma.JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: Prisma.JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }) | null>;
    update(id: number, data: Prisma.ProjectUpdateInput): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: Prisma.JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: Prisma.JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: Prisma.JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: Prisma.JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }>;
    private generateWoerkId;
}
