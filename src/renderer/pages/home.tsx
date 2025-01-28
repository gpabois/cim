import { useAppDispatch, useCurrentProject } from "../hooks";
import {newProject, openProject} from "../features/projects/projectsSlice";
import { Option } from "../components/option";
import { Link } from "react-router";
import { Breadcrumbs } from "../components/breadcrumbs";

export default function Home() {
  const dispatch = useAppDispatch();
  const maybeCurrentProject = useCurrentProject();

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Home</Link>
    </Breadcrumbs>
    <Option value={maybeCurrentProject}
      onSome={(_) => <div className="flex flex-col">
        <Link to={`/aiots`}>AIOTS</Link>
        <Link to={`/organismeDeControle`}>Organismes de contrôle</Link>
        <Link to={`/contrôles`}>Contrôles inopinés</Link>

      </div>}
      onNone={() => <div className="flex flex-col">
        <button onClick={(_) => dispatch(newProject())}>Nouveau</button>
        <button onClick={(_) => dispatch(openProject())}>Ouvrir</button>
      </div>}
    >
    </Option>
  </div>;
}