import { FamilyProvider } from './app/FamilyProvider';
import { Workspace } from './components/layout/Workspace';
export default function App() {
  return (
    <FamilyProvider>
      <Workspace />
    </FamilyProvider>
  );
}
