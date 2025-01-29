import api from "@renderer/api";
import { AsyncResolved } from "@renderer/components/async";
import { Breadcrumbs } from "@renderer/components/breadcrumbs";
import { ControleSymbol } from "@renderer/components/contrôle";
import { Page } from "@renderer/components/page";
import { StackedList } from "@renderer/components/stacked-list";
import { guardCurrentProject } from "@renderer/guards/project";
import { useAsync } from "@renderer/hooks";
import { BiAddToQueue } from "react-icons/bi";
import { Link } from "react-router";

export function ControlesList() {
  const {id: projectId} = guardCurrentProject();

  const promiseFn = async ({ projectId }) => {
    return await api.controles.list(projectId, {});
  };

  const state = useAsync(promiseFn, {projectId});

  return <Page heading="Liste des contrôles" breadcrumbs={[<Link to="/">Home</Link>,<span>Contrôles</span>]} action={<Link to="/contrôles/create"><BiAddToQueue/></Link>}>
    <AsyncResolved state={state}>
    {controles =>
      <StackedList>
        {controles.map(controle => ({
          key: controle.id,
          content: <div className="flex items-center space-x-2">
              <ControleSymbol kind={controle.kind}/>
              <Link to={`/contrôles/${controle.id}`}>{controle.nom}</Link>
            </div>,
        }))}
      </StackedList>
    }
    </AsyncResolved>
  </Page>
}
