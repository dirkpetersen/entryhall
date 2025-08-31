import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
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
    } | null>;
}
export {};
