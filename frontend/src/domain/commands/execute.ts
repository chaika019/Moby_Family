import type { Command, DemoState } from '../types';
import { createCommandContext } from './context';
import { applyPaymentsCommand } from './payments';
import { applySafetyCommand } from './safety';
import { applySavingsCommand } from './savings';
import { applyChoresCommand } from './chores';
import { applyRewardsCommand } from './rewards';
import { applySocialCommand } from './social';
export function execute(previous: DemoState, command: Command, now = new Date()): DemoState {
  const context = createCommandContext(
    previous,
    now
  );
  switch (command.type) {
    case 'topup':
    case 'pay':
    case 'sosApprove':
    case 'sosReject':
      applyPaymentsCommand(
        context,
        command
      );
      break;
    case 'freeze':
    case 'rule':
    case 'safety':
    case 'limits':
    case 'ride':
      applySafetyCommand(
        context,
        command
      );
      break;
    case 'save':
    case 'allowance':
    case 'capital':
      applySavingsCommand(
        context,
        command
      );
      break;
    case 'submit':
    case 'approve':
    case 'chore':
      applyChoresCommand(
        context,
        command
      );
      break;
    case 'quiz':
    case 'buy':
    case 'skin':
      applyRewardsCommand(
        context,
        command
      );
      break;
    case 'split':
    case 'splitClose':
    case 'splitPay':
      applySocialCommand(
        context,
        command
      );
      break;
  }
  return context.state;
}
