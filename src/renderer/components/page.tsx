import { useForm } from "react-hook-form";
import { BreadcrumbProps, Breadcrumbs } from "./breadcrumbs";
import { Tabs, TabsProps } from "./tab";
import { useEffect } from "react";
import { Input } from "./form";

export interface PageProps {
  breadcrumbs?: BreadcrumbProps["children"],
  heading?: React.ReactNode,
  subheading?: React.ReactNode,
  hasSearch?: React.ReactNode,
  onSearch?: (search: string) => void,
  action?: React.ReactNode,
  tabs?: TabsProps["children"],
  children?: React.ReactNode
}

export function Page(props: PageProps) {
  const searchForm = useForm<{search: string}>({defaultValues: {search: ""}});
  const search = searchForm.watch("search");

  useEffect(() => props.onSearch?.(search), [search])

  return <>
  <div className="bg-teal-600 pt-2 pb-4 px-2">
    <Breadcrumbs className="pb-4">
      {props.breadcrumbs || []}
    </Breadcrumbs>
    <div className="flex flex-row space-x-2 items-center">
      <div className="flex-1">
        <h1 className="text-2xl pb-2 text-white font-bold flex space-x-2 items-center">
          {props.heading}
        </h1>
        {props.subheading && 
        <h2 className="text-md pb-2 text-teal-100 font-semibold flex space-x-2 items-center">
          {props.subheading}
        </h2>}  
      </div>
      {props.hasSearch && <div className="flex-1">
        <form onSubmit={searchForm.handleSubmit(({search}) => props.onSearch?.(search))}>
          <Input {...searchForm.register("search")} />
        </form>
        </div>}
      {props.action && <div>{props.action}</div>}
    </div>
  </div>
  {props.tabs && <Tabs containerClassName="bg-teal-600" tabClassName="hover:border-teal-200 text-white hover:text-teal-200" selectedTabClassName="text-teal-200 border-teal-200">{props.tabs}</Tabs>}  
  {props.children}
  </>
}