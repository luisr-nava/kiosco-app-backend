import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'node:path';

@Injectable()
export class PrivateStorageService {
  private readonly basePath: string;
  private readonly logger = new Logger(PrivateStorageService.name);

  constructor() {
    const envPath = process.env.PRIVATE_STORAGE_PATH;
    this.basePath = envPath
      ? path.resolve(envPath)
      : path.resolve(process.cwd(), 'private-storage');
  }

  async saveFile(key: string, buffer: Buffer) {
    const target = path.resolve(this.basePath, key);
    await this.ensureDir(path.dirname(target));
    await fs.writeFile(target, buffer);
    return target;
  }

  async getFile(key: string) {
    const target = path.resolve(this.basePath, key);
    try {
      return await fs.readFile(target);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async deleteFile(key: string) {
    const target = path.resolve(this.basePath, key);
    try {
      await fs.unlink(target);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return;
      }
      this.logger.warn(
        `Error deleting file ${key}: ${(error as Error).message}`,
      );
    }
  }

  private async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }
}
