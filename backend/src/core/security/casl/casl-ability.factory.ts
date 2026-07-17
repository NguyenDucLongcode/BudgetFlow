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

        // =========================
        // WALLET
        // =========================
        can(Action.Create, 'Wallet');

        can(Action.Read, 'Wallet', {
          userId: user.sub,
        });

        can(Action.Update, 'Wallet', {
          userId: user.sub,
        });

        can(Action.Delete, 'Wallet', {
          userId: user.sub,
        });

        // =========================
        // CATEGORY
        // =========================
        can(Action.Create, 'Category');

        can(Action.Read, 'Category', {
          userId: user.sub,
        });

        can(Action.Update, 'Category', {
          userId: user.sub,
        });

        can(Action.Delete, 'Category', {
          userId: user.sub,
        });

        // =========================
        // TRANSACTION
        // =========================
        can(Action.Create, 'Transaction');

        can(Action.Read, 'Transaction', {
          userId: user.sub,
        });

        can(Action.Update, 'Transaction', {
          userId: user.sub,
        });

        can(Action.Delete, 'Transaction', {
          userId: user.sub,
        });

        // =========================
        // BUDGET
        // =========================

        can(Action.Create, 'Budget');
        can(Action.Read, 'Budget', {
          userId: user.sub,
        });
        can(Action.Update, 'Budget', {
          userId: user.sub,
        });
        can(Action.Delete, 'Budget', {
          userId: user.sub,
        });

        // =========================
        // RECURRING TRANSACTION
        // =========================
        can(Action.Create, 'RecurringTransaction');
        can(Action.Read, 'RecurringTransaction', {
          userId: user.sub,
        });
        can(Action.Update, 'RecurringTransaction', {
          userId: user.sub,
        });
        can(Action.Delete, 'RecurringTransaction', {
          userId: user.sub,
        });

        // =========================
        // GOAL
        // =========================
        can(Action.Create, 'Goal');
        can(Action.Read, 'Goal', {
          userId: user.sub,
        });
        can(Action.Update, 'Goal', {
          userId: user.sub,
        });
        can(Action.Delete, 'Goal', {
          userId: user.sub,
        });

        // =========================
        // DEBT
        // =========================
        can(Action.Create, 'Debt');
        can(Action.Read, 'Debt', {
          userId: user.sub,
        });
        can(Action.Update, 'Debt', {
          userId: user.sub,
        });
        can(Action.Delete, 'Debt', {
          userId: user.sub,
        });

        // =========================
        // DEBT PAYMENT
        // =========================
        can(Action.Create, 'DebtPayment');
        can(Action.Read, 'DebtPayment', {
          debt: {
            userId: user.sub,
          },
        });
        can(Action.Update, 'DebtPayment', {
          debt: {
            userId: user.sub,
          },
        });
        can(Action.Delete, 'DebtPayment', {
          debt: {
            userId: user.sub,
          },
        });

        // =========================
        // USER PREFERENCE
        // =========================
        can(Action.Create, 'UserPreference');
        can(Action.Read, 'UserPreference', {
          userId: user.sub,
        });
        can(Action.Update, 'UserPreference', {
          userId: user.sub,
        });
        can(Action.Delete, 'UserPreference', {
          userId: user.sub,
        });

        // =========================
        // NOTIFICATION
        // =========================
        can(Action.Create, 'Notification');
        can(Action.Read, 'Notification', {
          userId: user.sub,
        });
        can(Action.Update, 'Notification', {
          userId: user.sub,
        });
        can(Action.Delete, 'Notification', {
          userId: user.sub,
        });

        // =========================
        // TAG
        // =========================
        can(Action.Create, 'Tag');
        can(Action.Read, 'Tag', {
          userId: user.sub,
        });
        can(Action.Update, 'Tag', {
          userId: user.sub,
        });
        can(Action.Delete, 'Tag', {
          userId: user.sub,
        });

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
