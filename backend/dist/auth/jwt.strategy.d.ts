import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
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
    } | null>;
}
export {};
