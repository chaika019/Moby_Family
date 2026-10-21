import { Check, ChevronRight, LockKeyhole } from 'lucide-react';
import { usePhone } from '../../app/PhoneProvider';
import { lessons as sampleLessons } from '../../data/lessons';

type Lesson = typeof sampleLessons[number];

export function LessonNode({ lesson, index }: { lesson: Lesson; index: number }) {
  const { state, selectLesson, openModal, lessons,child } = usePhone();
  const completed = state.lessons.includes(lesson.id);
  const unlocked = child?!!child.academy.lessons.find(l=>l.id===lesson.id)?.unlocked:completed || index === 0 || state.lessons.includes(lessons[index - 1].id);
  const status = completed ? 'done' : unlocked ? 'current' : 'locked';
  const Icon = completed ? Check : !unlocked ? LockKeyhole : lesson.icon;

  function openLesson() {
    if (!unlocked) return;
    selectLesson(lesson.id);
    openModal('lesson');
  }

  return (
    <button
      className={`lesson-node ${status}`}
      onClick={openLesson}
      disabled={!unlocked}
    >
      <span className="island-platform" aria-hidden="true" />
      <span className="lesson-number">
        <Icon size={completed ? 21 : !unlocked ? 20 : 23} />
      </span>
      <span>
        <small>УРОК {index + 1}{completed ? ' · ПРОЙДЕН' : ''}</small>
        <strong>{lesson.title}</strong>
        <small>{lesson.description}</small>
      </span>
      {unlocked && !completed && <ChevronRight size={18} />}
    </button>
  );
}
