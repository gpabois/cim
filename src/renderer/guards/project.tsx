import { useCurrentProject } from "@renderer/hooks";
import { ProjectId } from "@shared/model";
import { isNone } from "@shared/option";
import { redirect } from "react-router";

export function guardCurrentProject(): {id: ProjectId} {
    const maybeCurrentProject = useCurrentProject();

    if (isNone(maybeCurrentProject)) {
        redirect('/');
    }

    const currentProject = maybeCurrentProject!;

    return currentProject;
}