import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(req: any, createProjectDto: any): Promise<{
        piOwner: {
            verificationToken: string | null;
            id: number;
            username: string;
            email: string;
            fullName: string;
            firstName: string | null;
            lastName: string | null;
            emailVerified: boolean;
            passwordHash: string | null;
            title: string | null;
            position: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            university: string | null;
            department: string | null;
            defaultIndex: string | null;
            defaultActivityCode: string | null;
            verificationTokenExpires: Date | null;
            passwordResetToken: string | null;
            passwordResetTokenExpires: Date | null;
            createdAt: Date;
            updatedAt: Date;
            defaultProjectId: number | null;
        };
        allocations: {
            id: number;
            projectId: number;
            resourceTypeId: number;
            allocationModel: import("@prisma/client").$Enums.AllocationModel;
            quantity: import("@prisma/client/runtime/library").Decimal;
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
        billingDetails: import("@prisma/client/runtime/library").JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }>;
    findAll(req: any): Promise<({
        piOwner: {
            verificationToken: string | null;
            id: number;
            username: string;
            email: string;
            fullName: string;
            firstName: string | null;
            lastName: string | null;
            emailVerified: boolean;
            passwordHash: string | null;
            title: string | null;
            position: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            university: string | null;
            department: string | null;
            defaultIndex: string | null;
            defaultActivityCode: string | null;
            verificationTokenExpires: Date | null;
            passwordResetToken: string | null;
            passwordResetTokenExpires: Date | null;
            createdAt: Date;
            updatedAt: Date;
            defaultProjectId: number | null;
        };
        allocations: ({
            resourceType: {
                name: string;
                id: number;
                unit: string;
                isStorageType: boolean;
            };
        } & {
            id: number;
            projectId: number;
            resourceTypeId: number;
            allocationModel: import("@prisma/client").$Enums.AllocationModel;
            quantity: import("@prisma/client/runtime/library").Decimal;
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
        billingDetails: import("@prisma/client/runtime/library").JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    })[]>;
    findOne(id: string): Promise<({
        dataShares: {
            name: string;
            id: number;
            createdAt: Date;
            projectId: number;
            sourceAllocationId: number;
            storageSubtype: import("@prisma/client").$Enums.StorageSubtype;
            dataStewardId: number | null;
            securityGroupId: number;
        }[];
        piOwner: {
            verificationToken: string | null;
            id: number;
            username: string;
            email: string;
            fullName: string;
            firstName: string | null;
            lastName: string | null;
            emailVerified: boolean;
            passwordHash: string | null;
            title: string | null;
            position: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            university: string | null;
            department: string | null;
            defaultIndex: string | null;
            defaultActivityCode: string | null;
            verificationTokenExpires: Date | null;
            passwordResetToken: string | null;
            passwordResetTokenExpires: Date | null;
            createdAt: Date;
            updatedAt: Date;
            defaultProjectId: number | null;
        };
        allocations: ({
            resourceType: {
                name: string;
                id: number;
                unit: string;
                isStorageType: boolean;
            };
        } & {
            id: number;
            projectId: number;
            resourceTypeId: number;
            allocationModel: import("@prisma/client").$Enums.AllocationModel;
            quantity: import("@prisma/client/runtime/library").Decimal;
            periodStart: Date;
            periodEnd: Date;
        })[];
        resourceManagers: ({
            user: {
                verificationToken: string | null;
                id: number;
                username: string;
                email: string;
                fullName: string;
                firstName: string | null;
                lastName: string | null;
                emailVerified: boolean;
                passwordHash: string | null;
                title: string | null;
                position: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                university: string | null;
                department: string | null;
                defaultIndex: string | null;
                defaultActivityCode: string | null;
                verificationTokenExpires: Date | null;
                passwordResetToken: string | null;
                passwordResetTokenExpires: Date | null;
                createdAt: Date;
                updatedAt: Date;
                defaultProjectId: number | null;
            };
        } & {
            userId: number;
            projectId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: import("@prisma/client/runtime/library").JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }) | null>;
    update(id: string, updateProjectDto: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: import("@prisma/client/runtime/library").JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        woerkId: string;
        shortName: string;
        billingDetails: import("@prisma/client/runtime/library").JsonValue | null;
        isGrantProject: boolean;
        grantMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        piOwnerId: number;
        defaultDataStewardId: number | null;
        defaultSecurityGroupId: number | null;
    }>;
}
