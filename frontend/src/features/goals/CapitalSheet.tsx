import { usePhone } from "../../app/PhoneProvider";
import { CapitalForm } from "./CapitalForm";
export function CapitalSheet() {
  const {
    state,
    executeCommand,
    closeModal,child
  } = usePhone();
  return (
    <CapitalForm
      state={state}
      plan={child?.capital18}
      onSubmit={
        async (initial, monthly) => {
          if (await executeCommand(
            {
              type: 'capital',
              initial,
              monthly
            },
            'План сохранён. Реальный вклад не открывался'
          )) closeModal();
        }
      }
    />
  );
}
