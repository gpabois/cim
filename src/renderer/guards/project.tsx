import { useCurrentProject } from "@app/hooks";
import { ProjectId } from "@interface/model";
import { isNone } from "@interface/option";
import { redirect } from "react-router";

export function guardCurrentProject(): {id: ProjectId} {
    const maybeCurrentProject = useCurrentProject();

    if (isNone(maybeCurrentProject)) {
        redirect('/');
    }

    const currentProject = maybeCurrentProject!;

    return currentProject;
}