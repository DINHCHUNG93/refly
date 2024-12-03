import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MINIO_INTERNAL } from '@/common/minio.service';
import { MinioService } from '@/common/minio.service';
import { PrismaService } from '@/common/prisma.service';
import { MiscService } from '@/misc/misc.service';
import { SyncStorageUsageJobData } from '@/subscription/subscription.dto';
import { QUEUE_SYNC_STORAGE_USAGE } from '@/utils/const';
import { CanvasNotFoundError } from '@refly-packages/errors';
import {
  DeleteCanvasRequest,
  ListCanvasesData,
  UpsertCanvasRequest,
  User,
} from '@refly-packages/openapi-schema';
import { genCanvasID } from '@refly-packages/utils';
import { CollabService } from '@/collab/collab.service';

@Injectable()
export class CanvasService {
  private logger = new Logger(CanvasService.name);

  constructor(
    private prisma: PrismaService,
    private collabService: CollabService,
    private miscService: MiscService,
    @Inject(MINIO_INTERNAL) private minio: MinioService,
    @InjectQueue(QUEUE_SYNC_STORAGE_USAGE) private ssuQueue: Queue<SyncStorageUsageJobData>,
  ) {}

  async listCanvases(user: User, param: ListCanvasesData['query']) {
    const { page, pageSize } = param;

    return this.prisma.canvas.findMany({
      where: {
        uid: user.uid,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async createCanvas(user: User, param: UpsertCanvasRequest) {
    const canvasId = genCanvasID();
    const stateStorageKey = `state/${canvasId}`;
    const canvas = await this.prisma.canvas.create({
      data: {
        uid: user.uid,
        canvasId,
        stateStorageKey,
        ...param,
      },
    });

    const { document } = await this.collabService.openDirectConnection(canvasId, {
      user,
      entity: canvas,
      entityType: 'canvas',
    });

    document.transact(() => {
      document.getText('title').insert(0, param.title);

      // We have to add a dummy node and then remove it to make sure the yjs document
      // can be connected. The reason is still unclear.
      document
        .getArray('nodes')
        .insert(0, [{ id: '1', position: { x: 0, y: 0 }, data: { label: '1' } }]);
      document.getArray('nodes').delete(0, 1);
    });

    this.logger.log(`updated canvas data: ${JSON.stringify(document.toJSON())}`);

    return canvas;
  }

  async updateCanvas(user: User, param: UpsertCanvasRequest) {
    const { canvasId, title = '' } = param;

    const updatedCanvas = await this.prisma.canvas.update({
      where: { canvasId, uid: user.uid, deletedAt: null },
      data: { title },
    });

    if (!updatedCanvas) {
      throw new CanvasNotFoundError();
    }

    return updatedCanvas;
  }

  async deleteCanvas(user: User, param: DeleteCanvasRequest) {
    const { uid } = user;
    const { canvasId } = param;

    const canvas = await this.prisma.canvas.findFirst({
      where: { canvasId, uid, deletedAt: null },
    });
    if (!canvas) {
      throw new CanvasNotFoundError();
    }

    const cleanups: Promise<any>[] = [
      this.prisma.canvas.update({
        where: { canvasId },
        data: { deletedAt: new Date() },
      }),
      this.miscService.removeFilesByEntity(user, {
        entityId: canvas.canvasId,
        entityType: 'canvas',
      }),
    ];

    if (canvas.stateStorageKey) {
      cleanups.push(this.minio.client.removeObject(canvas.stateStorageKey));
    }

    const files = await this.prisma.staticFile.findMany({
      where: { entityId: canvas.canvasId, entityType: 'canvas' },
    });

    if (files.length > 0) {
      cleanups.push(
        this.prisma.staticFile.deleteMany({
          where: { entityId: canvas.canvasId, entityType: 'canvas' },
        }),
      );
    }

    await Promise.all(cleanups);

    // Sync storage usage
    await this.ssuQueue.add({
      uid,
      timestamp: new Date(),
    });
  }
}
