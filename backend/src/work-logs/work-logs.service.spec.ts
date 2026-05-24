import { Test, TestingModule } from '@nestjs/testing';
import { WorkLogsService } from './work-logs.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockWorkLog = {
  id: 1,
  date: new Date('2026-05-24T00:00:00.000Z'),
  volume: 10,
  performer: 'Иванов И.И.',
  workTypeId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  workType: { id: 2, name: 'Кладка перегородок', unit: 'м³' },
};

const mockPrismaService = {
  workLog: {
    findMany: jest.fn().mockResolvedValue([mockWorkLog]),
    findUnique: jest.fn().mockResolvedValue(mockWorkLog),
    create: jest.fn().mockResolvedValue(mockWorkLog),
    update: jest.fn().mockResolvedValue(mockWorkLog),
    delete: jest.fn().mockResolvedValue(mockWorkLog),
  },
  workType: {
    findUnique: jest.fn().mockResolvedValue({ id: 2, name: 'Кладка перегородок', unit: 'м³' }),
  },
};

describe('WorkLogsService', () => {
  let service: WorkLogsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkLogsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkLogsService>(WorkLogsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of work logs', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockWorkLog]);
      expect(prisma.workLog.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single work log', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockWorkLog);
      expect(prisma.workLog.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { workType: true },
      });
    });

    it('should throw NotFoundException if log not found', async () => {
      jest.spyOn(prisma.workLog, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new work log', async () => {
      const dto = {
        date: '2026-05-24T00:00:00.000Z',
        volume: 10,
        performer: 'Иванов И.И.',
        workTypeId: 2,
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockWorkLog);
      expect(prisma.workLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if workType does not exist', async () => {
      jest.spyOn(prisma.workType, 'findUnique').mockResolvedValueOnce(null);
      const dto = {
        date: '2026-05-24T00:00:00.000Z',
        volume: 10,
        performer: 'Иванов И.И.',
        workTypeId: 99,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
