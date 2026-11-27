import { Injectable } from '@nestjs/common';
import {
  DebtType,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { MonthlyReportQueryDto } from './dto/MonthlyReportQueryDto';

export interface DailyReportPoint {
  date: string;
  day: number;
  income: number;
  expense: number;
  net: number;
}

export interface TopCategoryReportItem {
  categoryId: string | null;
  nameVi: string;
  nameEn: string | null;
  icon: string | null;
  color: string | null;
  amount: number;
  percentage: number;
}

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private calcPercentChange(current: number, previous: number): number | null {
    if (previous === 0) {
      return current === 0 ? 0 : null;
    }
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return Number(pct.toFixed(1));
  }

  async getMonthlyReport(userId: string, query: MonthlyReportQueryDto) {
    const now = new Date();
    const year = query.year ?? now.getUTCFullYear();
    const month = query.month ?? now.getUTCMonth() + 1;

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const prevStartDate = new Date(Date.UTC(year, month - 2, 1, 0, 0, 0, 0));
    const prevEndDate = new Date(
      Date.UTC(year, month - 1, 0, 23, 59, 59, 999),
    );

    const [currentTransactions, prevGrouped, debtPaymentAgg, goalContributionAgg] =
      await Promise.all([
        this.prisma.transaction.findMany({
          where: {
            userId,
            deletedAt: null,
            status: TransactionStatus.COMPLETED,
            type: { in: [TransactionType.INCOME, TransactionType.EXPENSE] },
            date: { gte: startDate, lte: endDate },
          },
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            date: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                nameVi: true,
                nameEn: true,
                icon: true,
                color: true,
              },
            },
            wallet: {
              select: {
                id: true,
                nameVi: true,
                nameEn: true,
              },
            },
          },
          orderBy: { date: 'asc' },
        }),
        this.prisma.transaction.groupBy({
          by: ['type'],
          where: {
            userId,
            deletedAt: null,
            status: TransactionStatus.COMPLETED,
            type: { in: [TransactionType.INCOME, TransactionType.EXPENSE] },
            date: { gte: prevStartDate, lte: prevEndDate },
          },
          _sum: { amount: true },
        }),
        this.prisma.debtPayment.aggregate({
          where: {
            paymentDate: { gte: startDate, lte: endDate },
            debt: {
              userId,
              type: DebtType.LOAN,
              deletedAt: null,
            },
          },
          _sum: { amount: true },
        }),
        this.prisma.goalContribution.aggregate({
          where: {
            contributionDate: { gte: startDate, lte: endDate },
            goal: {
              userId,
              deletedAt: null,
            },
          },
          _sum: { amount: true },
        }),
      ]);

    // Build daily map initialized to 0 for all days in month
    const monthStr = String(month).padStart(2, '0');
    const dailyMap = new Map<number, DailyReportPoint>();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      dailyMap.set(day, {
        date: `${year}-${monthStr}-${dayStr}`,
        day,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    let totalIncome = 0;
    let totalExpense = 0;

    const categoryTotals = new Map<
      string,
      {
        categoryId: string | null;
        nameVi: string;
        nameEn: string | null;
        icon: string | null;
        color: string | null;
        amount: number;
      }
    >();

    const expenseTransactions: Array<{
      id: string;
      description: string | null;
      amount: number;
      date: string;
      category: {
        id: string;
        nameVi: string;
        nameEn: string | null;
        icon: string | null;
        color: string | null;
      } | null;
      wallet: {
        id: string;
        nameVi: string;
        nameEn: string | null;
      } | null;
    }> = [];

    for (const tx of currentTransactions) {
      const amount = Number(tx.amount) || 0;
      const day = tx.date.getUTCDate();
      const point = dailyMap.get(day);

      if (tx.type === TransactionType.INCOME) {
        totalIncome += amount;
        if (point) {
          point.income += amount;
          point.net = point.income - point.expense;
        }
      } else if (tx.type === TransactionType.EXPENSE) {
        totalExpense += amount;
        if (point) {
          point.expense += amount;
          point.net = point.income - point.expense;
        }

        const catKey = tx.categoryId ?? 'uncategorized';
        const existing = categoryTotals.get(catKey);
        if (existing) {
          existing.amount += amount;
        } else {
          categoryTotals.set(catKey, {
            categoryId: tx.category?.id ?? null,
            nameVi: tx.category?.nameVi ?? 'Khác',
            nameEn: tx.category?.nameEn ?? 'Other',
            icon: tx.category?.icon ?? null,
            color: tx.category?.color ?? '#64748b',
            amount,
          });
        }

        expenseTransactions.push({
          id: tx.id,
          description: tx.description,
          amount,
          date: tx.date.toISOString(),
          category: tx.category,
          wallet: tx.wallet,
        });
      }
    }

    const net = totalIncome - totalExpense;

    let prevIncome = 0;
    let prevExpense = 0;
    for (const group of prevGrouped) {
      const sum = Number(group._sum.amount) || 0;
      if (group.type === TransactionType.INCOME) prevIncome = sum;
      if (group.type === TransactionType.EXPENSE) prevExpense = sum;
    }
    const prevNet = prevIncome - prevExpense;

    const topCategories: TopCategoryReportItem[] = Array.from(
      categoryTotals.values(),
    )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((cat) => ({
        ...cat,
        percentage:
          totalExpense > 0
            ? Number(((cat.amount / totalExpense) * 100).toFixed(1))
            : 0,
      }));

    const topTransactions = expenseTransactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const debtPaymentTotal = Number(debtPaymentAgg._sum.amount) || 0;
    const goalContributionTotal = Number(goalContributionAgg._sum.amount) || 0;
    const livingExpense = Math.max(
      0,
      totalExpense - debtPaymentTotal - goalContributionTotal,
    );

    const cashFlowBreakdown = [
      {
        key: 'living',
        name: 'Sinh hoạt',
        value: livingExpense,
        color: '#EF4444',
      },
      {
        key: 'debt',
        name: 'Trả nợ',
        value: debtPaymentTotal,
        color: '#F59E0B',
      },
      {
        key: 'savings',
        name: 'Tiết kiệm mục tiêu',
        value: goalContributionTotal,
        color: '#10B981',
      },
    ];

    return {
      year,
      month,
      summary: {
        totalIncome,
        totalExpense,
        net,
        previousMonth: {
          totalIncome: prevIncome,
          totalExpense: prevExpense,
          net: prevNet,
        },
        comparison: {
          incomeChangePercent: this.calcPercentChange(totalIncome, prevIncome),
          expenseChangePercent: this.calcPercentChange(
            totalExpense,
            prevExpense,
          ),
          netChangePercent: this.calcPercentChange(net, prevNet),
        },
      },
      daily: Array.from(dailyMap.values()),
      topCategories,
      topTransactions,
      cashFlowBreakdown,
    };
  }
}
