import { usePhone } from "../../app/PhoneProvider";
import {
  Home,
  Bike,
  ShieldCheck,
  GraduationCap,
  LayoutGrid,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { type Tab } from "../../lib/demo";
export function BottomNavigation() {
  const {
    isChild,
    tab,
    navigate,
    state
  } = usePhone();
  return (
    <nav
      className="bottom-nav"
      aria-label={
        isChild
          ? 'Навигация ребёнка'
          : 'Навигация родителя'
      }
    >
      {
        ([{
          id: 'home',
          icon: Home,
          label: 'Главная'
        }, {
          id: 'family',
          icon: isChild
            ? Bike
            : ShieldCheck,
          label: isChild
            ? 'Мечты'
            : 'Защита'
        }, {
          id: 'academy',
          icon: isChild
            ? GraduationCap
            : LayoutGrid,
          label: isChild
            ? 'Академия'
            : 'Дела'
        }, {
          id: 'more',
          icon: MoreHorizontal,
          label: 'Ещё'
        }] as {
          id: Tab;
          icon: LucideIcon;
          label: string;
        }[]).map(
          item => <button
            className={
              tab === item.id
                ? 'active'
                : ''
            }
            aria-current={
              tab === item.id
                ? 'page'
                : undefined
            }
            key={item.id}
            onClick={() => navigate(item.id)}
          >
            {
              item.id === 'home'
                ? <img
                  src="/favicon.svg"
                  alt=""
                />
                : <item.icon
                  size={24}
                  strokeWidth={
                    tab === item.id
                      ? 2.3
                      : 1.8
                  }
                />
            }
            <span>
              {item.label}
            </span>
            {
              item.id === 'academy' && !isChild && state.chores.some(chore => chore.status === 'review') && <i />
            }
          </button>
        )
      }
    </nav>
  );
}
