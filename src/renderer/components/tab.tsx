import React, { useState } from "react";

export interface Tab {id: string, label: React.ReactNode, content: React.ReactNode}

export interface TabsProps {
  selected?: number,
  children: Array<Tab>
  containerClassName?: string
  selectedTabClassName?: string,
  tabClassName?: string
}

export function Tabs(props: TabsProps) {
  const [currentTab, setCurrentTab] = useState(props.selected || 0);

  const containerClassName = `text-sm font-medium text-center text-gray-500 border-b border-gray-200 w-full mb-2 ${props.containerClassName || ""}`;
  const selectedTabClassName = `text-blue-600 border-b-2 border-blue-600 rounded-t-lg active ${props.selectedTabClassName || ""}`
  const tablClassName = `border-transparent hover:text-gray-800 hover:border-gray-800 ${props.tabClassName || ""}`
  
  return <>
    <div className={containerClassName}>
      <ul className="flex-row flex-wrap sm:flex space-x-2 items-center">
        {Array.from(props.children.entries()).map(([id, tab]) => <li key={id}>
          <a 
            onClick={(_) => setCurrentTab(id)} 
            className={`inline-block p-4 rounded-t-lg border-b-2 sm:w-full ${currentTab === id ? selectedTabClassName : tablClassName}`}>
              {tab.label}
          </a>
        </li>)}
      </ul>
    </div>
    <div>
      {props.children[currentTab].content}
    </div>
  </>
}