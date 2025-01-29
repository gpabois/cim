import { useAppDispatch, useCurrentProject } from "../hooks";
import {newProject, openProject} from "../features/projects/projectsSlice";
import { Option } from "../components/option";
import { Link } from "react-router";
import { Breadcrumbs } from "../components/breadcrumbs";
import { FaDatabase } from "react-icons/fa6";
import { Button } from "@renderer/components/button";

export default function Home() {
  const dispatch = useAppDispatch();
  const maybeCurrentProject = useCurrentProject();

  return <div className="w-full">

    <Option value={maybeCurrentProject}
      onSome={(_) => <>
        <Breadcrumbs>
          <Link to="/">Home</Link>
        </Breadcrumbs>
        <div className="flex flex-col">
          <Link to={`/aiots`}>AIOTS</Link>
          <Link to={`/organismeDeControle`}>Organismes de contrôle</Link>
          <Link to={`/contrôles`}>Contrôles inopinés</Link>
        </div>
      </>}
      onNone={() => <div className="flex flex-col justify-center w-full gap-10 mt-10 items-center">
        <h2 className="text-lg font-bold text-center  leading-relaxed pb-1">Aucun projet n'est ouvert</h2>
        <p className="text-center text-black text-sm font-normal leading-snug pb-4">Vous pouvez <a href="#">ouvrir</a> ou <a href="#">créer</a> un projet.</p>
        <FaDatabase className="w-20 h-20"/>
        <div className="flex items-center space-x-2">
          <Button onClick={() => dispatch(newProject())}>Nouveau</Button>
          <Button onClick={() => dispatch(openProject())}>Ouvrir</Button>
        </div>
      </div>}
    >
    </Option>
  </div>;
}