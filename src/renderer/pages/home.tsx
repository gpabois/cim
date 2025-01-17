import { useAppDispatch, useCurrentProject } from "@app/hooks";
import {newProject, openProject} from "@app/features/projects/projectsSlice";
import { Option } from "@app/components/option";
import { Link } from "react-router";
import { Breadcrumbs } from "@app/components/breadcrumbs";

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