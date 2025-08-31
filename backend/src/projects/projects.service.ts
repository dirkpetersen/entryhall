import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: {
    shortName: string;
    description?: string;
    billingDetails?: any;
    isGrantProject?: boolean;
    grantMetadata?: any;
  }) {
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

  async findAll(userId?: number) {
    const where: Prisma.ProjectWhereInput = userId
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

  async findOne(id: number) {
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

  async update(id: number, data: Prisma.ProjectUpdateInput) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  private generateWoerkId(): string {
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
}