import { HashRouter, Link, Route, Routes, useNavigate } from 'react-router';
import Home from './pages/home'
import { AiotDetails, AiotsList, CreateAiot } from './pages/aiots';
import { useCurrentProject } from './hooks';
import { Option } from './components/option';
import { Error404 } from './pages/404';
import { CreateOrganismeDeControle, OrganismeDeControleDetails, OrganismesDeControleList } from './pages/organismes-de-contrôle';
import { ControleDetails, ControlesList, CreateControle } from './pages/contrôles';
import { CreateService, ServiceDetails, ServicesList } from './pages/services';
import { ErrorBoundary } from './components/error';
import { Button } from './components/button';
import { IoClose, IoHome } from 'react-icons/io5';
import api from './api';
import { FaWindowMaximize, FaWindowMinimize } from 'react-icons/fa6';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

export function Titlebar() {
  const maybeCurrentProject = useCurrentProject();
  const navigate = useNavigate();

  return <div className="titlebar space-x-2 w-full bg-teal-800 p-1 text-white flex text-xs font-semibold items-center">
    <div className='flex-1 space-x-2 items-center flex'>
      <span>CIM v0.0.1</span>
      <Option
        value={maybeCurrentProject}
        onSome={(_) => <div className='border-l pl-2 flex items-center space-x-2'>
          <Link to={`/`} viewTransition><IoHome/></Link>
          <Link to={`/aiots`} viewTransition>AIOTS</Link>
          <Link to={`/organismes-de-contrôle`} viewTransition>Organismes</Link>
          <Link to={`/contrôles`} viewTransition>Contrôles</Link>
          <Link to={`/services`} viewTransition>Services</Link>
        </div>}
      />
    </div>
    <div className='flex space-x'>
      <Button onClick={() => navigate(-1)} theme='barebone'><BiChevronLeft/></Button>
      <Button onClick={() => navigate(1)} theme='barebone'><BiChevronRight/></Button>
      <Button onClick={() => api.ui.minimizeMainWindow()} theme='barebone'><FaWindowMinimize/></Button>
      <Button onClick={() => api.ui.maximizeMainWindow()} theme='barebone'><FaWindowMaximize/></Button>
      <Button onClick={() => api.ui.closeApp()} theme='barebone'><IoClose/></Button>
    </div>
  </div>
}

export function App() {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <HashRouter basename="/">
        <Titlebar />
        <ErrorBoundary>
          <div className='overflow-auto'>
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
              <Route path="organismes-de-contrôle">
                <Route index element={<OrganismesDeControleList />}></Route>
                <Route path="create" element={<CreateOrganismeDeControle />}></Route>
                <Route path=":id" element={<OrganismeDeControleDetails/>}></Route>
              </Route>
            </Routes>
          </div>
        </ErrorBoundary>
      </HashRouter>
    </div>
  );
}
