import { Injectable } from '@nestjs/common';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';

import { Role } from 'generated/prisma/client';

import { JwtPayload } from 'src/modules/auth/strategies/type';

import { Action } from './actions.enum';
import { AppAbility } from './app-ability.type';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JwtPayload): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (!user) {
      return build();
    }

    switch (user.role) {
      case Role.ADMIN: {
        // Admin có toàn quyền
        can(Action.Manage, 'all');
        break;
      }

      case Role.USER: {
        // =========================
        // USER PROFILE
        // =========================
        can(Action.Read, 'User', {
          id: user.sub,
        });

        can(Action.Update, 'User', {
          id: user.sub,
        });

        // // =========================
        // // WALLET
        // // =========================
        // can(Action.Manage, 'Wallet', {
        //   userId: user.sub,
        // });

        // // =========================
        // // CATEGORY
        // // =========================
        // can(Action.Manage, 'Category', {
        //   userId: user.sub,
        // });

        // // =========================
        // // TRANSACTION
        // // =========================
        // can(Action.Manage, 'Transaction', {
        //   userId: user.sub,
        // });

        // // =========================
        // // BUDGET
        // // =========================
        // can(Action.Manage, 'Budget', {
        //   userId: user.sub,
        // });

        // // =========================
        // // SESSION
        // // =========================
        // can(Action.Read, 'Session', {
        //   userId: user.sub,
        // });

        // can(Action.Delete, 'Session', {
        //   userId: user.sub,
        // });

        break;
      }

      default:
        break;
    }

    return build();
  }
}
