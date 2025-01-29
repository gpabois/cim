import api from "@renderer/api";
import { AsyncResolved } from "@renderer/components/async";
import { Page } from "@renderer/components/page";
import { StackedList } from "@renderer/components/stacked-list";
import { guardCurrentProject } from "@renderer/guards/project";
import { useAsync } from "@renderer/hooks";
import { SerChunkQuery } from "@shared/database/query";
import { AiotFields } from "@shared/model/aiots";
import { BiAddToQueue } from "react-icons/bi";
import { Link } from "react-router";

export function AiotsList() {
  const {id: projectId} = guardCurrentProject();

  const promiseFn = async ({ projectId, search}) => {
    const query: SerChunkQuery<AiotFields> = {};
    if(search.length > 0) {
      query.filter = {
        "$or": [
          {"nom": {"$like": search}},
          {"codeAiot": {"$like": search}},
          {"adresse": {"codePostal": {"$like": search}}},
          {"adresse": {"commune": {"$like": search}}},
        ]
      }
    }
    const promise = api.aiots.list(projectId, query);
    return await promise;
  };

  const state = useAsync(promiseFn, {projectId, search: ""});

  const updateSearch = (search: string) => {
    state.run({projectId, search})
  }

  return <Page heading="Liste des AIOTS" breadcrumbs={[<Link to="/">Home</Link>, <span>AIOTS</span>]} hasSearch onSearch={updateSearch} action={<Link to="/aiots/create"><BiAddToQueue/></Link>}>
      <AsyncResolved state={state}>
        {aiots =>
          <StackedList>
            {aiots.map(aiot => ({
              key: aiot.codeAiot,
              content: <Link to={`/aiots/${aiot.codeAiot}`}>{aiot.nom}</Link>,
              subcontent: <>{aiot.adresse.lines.join(', ')}, {aiot.adresse.commune}, {aiot.adresse.codePostal}</>
            }))}
          </StackedList>
        } 
      </AsyncResolved>
    </Page>
}
