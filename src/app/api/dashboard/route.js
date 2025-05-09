import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalOpportunities = await prisma.opportunity.count({
        where: {
          deadline: {
            gte: new Date(), 
          },
        },
        orderBy: {
          deadline: 'asc',
        },
      });  

    const proposalsSubmitted = await prisma.opportunity.count({
      where: {
        stage: 'SUBMITTED',
      },
    });

    const proposalsActive = await prisma.opportunity.count({
        where: {
          AND: [
            { reviewStatus: 'APPROVED' },
            {
              OR: [
                { stage: 'CAPTURE' },
                { stage: 'PROPOSAL' }
              ]
            }
          ]
        }
      });      

    const statusCounts = await prisma.opportunity.groupBy({
      by: ['reviewStatus'],
      _count: true,
    });

    const stageCounts = await prisma.opportunity.groupBy({
      by: ['stage'],
      _count: true,
    });

    const branchCounts = await prisma.opportunity.groupBy({
      by: ['branch'],
      _count: true,
    });

    const stateCounts = await prisma.opportunity.groupBy({
      by: ['state'],
      where: {
        state: {
          not: 'N/A',
        },
      },
      _count: true,
    });

    const departmentCounts = await prisma.opportunity.findMany({
      select: { department: true }
    });

    const departmentMap = {};
    departmentCounts.forEach(op => {
      (op.department || []).forEach(dep => {
        departmentMap[dep] = (departmentMap[dep] || 0) + 1;
      });
    });

    const submittedOpportunities = await prisma.opportunity.findMany({
      where: {
        OR: [{ stage: 'SUBMITTED' }, { stage: 'WON' }],
        contractValue: { not: null }
      },
      select: {
        contractValue: true
      }
    });

    const totalProposalValue = submittedOpportunities.reduce((sum, opp) => {
      const val = parseFloat(
        String(opp.contractValue ?? '').replace(/[^0-9.]/g, '')
      );
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const byStatus = statusCounts.map(s => ({
      name: s.reviewStatus.replace(/_/g, ' '),
      value: s._count
    }));

    const byStage = stageCounts.map(s => ({
      name: s.stage,
      value: s._count
    }));

    const byBranch = branchCounts.map(b => ({
      name: b.branch,
      value: b._count
    }));

    const byState = stateCounts.map(s => ({
      name: s.state || 'N/A',
      value: s._count
    }));

    const byDepartment = Object.entries(departmentMap).map(([key, value]) => ({
      name: key,
      value
    }));

    const [all, watchlist, proposals] = await Promise.all([
      prisma.opportunity.findMany({ select: { department: true } }),
      prisma.opportunity.findMany({ where: { reviewStatus: 'IN_REVIEW' }, select: { department: true } }),
      prisma.opportunity.findMany({ where: { stage: { in: ['SUBMITTED', 'PROPOSAL'] } }, select: { department: true, stage: true } })
    ]);
    
    const countByDepartment = (records) => {
      const map = {};
      records.forEach(({ department }) => {
        (department || []).forEach((d) => {
          map[d] = (map[d] || 0) + 1;
        });
      });
      return map;
    };
    
    const proposalsByStage = {
      submitted: proposals.filter(p => p.stage === 'SUBMITTED').length,
      active: proposals.filter(p => p.stage === 'PROPOSAL').length,
    };

    return NextResponse.json({
      totalOpportunities,
      proposalsSubmitted,
      proposalsActive,
      totalProposalValue,
      byStatus,
      byStage,
      byBranch,
      byState,
      byDepartment,
      departmentBreakdown: {
        all: countByDepartment(all),
        watchlist: countByDepartment(watchlist),
        proposals: countByDepartment(proposals),
        proposalsByStage,
      },
    });

  } catch (error) {
    console.error('[API:dashboard]', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
