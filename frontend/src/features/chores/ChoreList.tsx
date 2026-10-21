import { usePhone } from '../../app/PhoneProvider';
import { Empty } from '../../components/ui';
import { ChoreCard } from './ChoreCard';
export function ChoreList({
  full = false
}: {
  full?: boolean;
}) {
  const {
    state
  } = usePhone();
  const chores = state.chores.filter(chore => full || chore.status !== 'done').slice(
    0,
    full
      ? 100
      : 2
  );
  const allCompleted = state.chores.every(chore => chore.status === 'done');
  return (
    <div className="chore-list">
      {
        chores.map(chore => <ChoreCard
          key={chore.id}
          chore={chore}
        />)
      }
      {
        allCompleted && !full && <Empty>
          Все дела сделаны. Отличная команда! ✨
        </Empty>
      }
    </div>
  );
}
