import { MongoAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import { User } from 'generated/prisma/client';
import { Action } from './actions.enum';

export type AppSubjects =
  | Subjects<{
      User: User;
    }>
  | 'all';

export type AppAbility = MongoAbility<[Action, AppSubjects], PrismaQuery>;
