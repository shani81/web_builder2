import type { UserRecord } from '@buildr/types';
import { BaseRepository } from './base.repository.js';

/**
 * User store. Emails are persisted lowercased, so all lookups normalize too.
 */
class UserRepository extends BaseRepository<UserRecord> {
  protected fileName = 'users.json';

  async findByEmail(email: string): Promise<UserRecord | null> {
    const lower = email.toLowerCase();
    const users = await this.findMany();
    return users.find((user) => user.email === lower) ?? null;
  }
}

export const userRepository = new UserRepository();
