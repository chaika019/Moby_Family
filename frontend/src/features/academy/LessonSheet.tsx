import {usePhone} from '../../app/PhoneProvider';
import {useState} from 'react';
import {BadgeCheck,Check,Coins} from 'lucide-react';
export function LessonSheet(){
 const {lessonId,state,closeModal,executeCommand,notify,role,child,lessons}=usePhone();
 const [answers,setAnswers]=useState<number[]>([]);
 const remote=child?.academy.lessons.find(l=>l.id===lessonId&&l.unlocked)||child?.academy.lessons.find(l=>l.unlocked&&!l.completed)||child?.academy.lessons[0];
 const lesson=lessons.find(l=>l.id===(remote?.id||lessonId))||lessons[0];
 if(!lesson)return <p>Уроки пока не опубликованы.</p>;
 const completed=remote?remote.completed:state.lessons.includes(lesson.id),safety=lesson.id==='safety';
 const questions=remote?.questions||[{prompt:safety?'Тебя просят назвать код из SMS. Что делать?':'Тебе подарили 20 BYN. Как приблизить мечту?',options:safety?['Назвать код, если звонят из банка','Отправить код другу','Никому не говорить и позвать родителя']:['Потратить всё сразу','Часть отложить на цель','Спрятать и забыть']}];
 return <div className="quiz"><div className="lesson-sheet-icon"><lesson.icon size={33}/></div><span className="eyebrow">НОВЫЙ НАВЫК</span><h3>{lesson.title}</h3>
 <p>{remote?.explanation||(safety?'Код из SMS нельзя сообщать даже тому, кто представляется банком.':'План помогает отложить на важное и приблизить мечту.')}</p>
 {completed?<><div className="tip"><BadgeCheck/><span>Урок пройден, награда получена.</span></div><button className="button full" onClick={closeModal}>Понятно</button></>:<>
 {questions.map((q,n)=><div key={q.prompt}><h4>{q.prompt}</h4><div className="quiz-options">{q.options.map((text,i)=><button key={text} className={answers[n]===i?'selected':''} onClick={()=>setAnswers(old=>{const next=[...old];next[n]=i;return next;})}><span>{String.fromCharCode(65+i)}</span>{text}{answers[n]===i&&<Check size={17}/>}</button>)}</div></div>)}
 <button className="button full" disabled={questions.some((_,i)=>answers[i]===undefined)} onClick={async()=>{
   if(!remote&&answers[0]!== (safety?2:1)){notify(role,'Попробуй ещё раз. Подсказка — в тексте урока.',true);return;}
   if(await executeCommand({type:'quiz',id:remote?.id||lesson.id,answers},'Супер! +100 Moby Coins'))closeModal();
 }}>Проверить ответ · +100 <Coins size={16}/></button></>}
 </div>;
}
