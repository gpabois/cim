import { HashRouter, Link, Route, Routes } from 'react-router';
import '@app/style.css';
import Home from '@app/pages/home'
import { AiotDetails, AiotsList, CreateAiot } from '@app/pages/aiots';
import { useCurrentProject } from '@app/hooks';
import { Option } from '@app/components/option';
import { Error404 } from './pages/404';
import { CreateOrganismeDeControle, OrganismesDeControleList } from './pages/organismeDeControle';
import { ControleDetails, ControlesList, CreateControle } from './pages/controles';
import { CreateService, ServiceDetails, ServicesList } from './pages/services';
import { ErrorBoundary } from './components/error';

export function Titlebar() {
  const maybeCurrentProject = useCurrentProject();

  return <div className="titlebar mb-2 space-x-2 w-full bg-teal-800 p-1 text-white border-b border-teal-600 flex text-xs font-semibold">
    <span>CIM v0.0.1</span>
    <Option
      value={maybeCurrentProject}
      onSome={(_) => <>
        <Link to={`/aiots`} viewTransition>AIOTS</Link>
        <Link to={`/organismesDeControle`} viewTransition>Organismes</Link>
        <Link to={`/contrôles`} viewTransition>Contrôles</Link>
        <Link to={`/services`} viewTransition>Services</Link>
      </>}
    />
  </div>
}

export default function App() {
  return (
    <div className="flex flex-col">
      <HashRouter basename="/">
        <Titlebar />
        <ErrorBoundary>
          <Routes>
            <Route index element={<Home />}></Route>
            <Route path="404" element={<Error404 />}></Route>
            <Route path="aiots">
              <Route index element={<AiotsList />}></Route>
              <Route path="create" element={<CreateAiot />}></Route>
              <Route path=":codeAiot" element={<AiotDetails />}></Route>
            </Route>
            <Route path="services">
              <Route index element={<ServicesList />}></Route>
              <Route path="create" element={<CreateService />}></Route>
              <Route path=":id" element={<ServiceDetails />}></Route>
            </Route>
            <Route path="contrôles">
              <Route index element={<ControlesList />}></Route>
              <Route path="create" element={<CreateControle />}></Route>
              <Route path=":id" element={<ControleDetails/>}></Route>
            </Route>
            <Route path="organismesDeControle">
              <Route index element={<OrganismesDeControleList />}></Route>
              <Route path="create" element={<CreateOrganismeDeControle />}></Route>
            </Route>
          </Routes>
        </ErrorBoundary>
      </HashRouter>
    </div>
  );
}
