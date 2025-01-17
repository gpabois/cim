import React, { useState } from "react";

export interface TabsProps {
  children: Array<{id: string, label: React.ReactNode, content: React.ReactNode}>
}

export function Tabs(props: TabsProps) {
  const [currentTab, setCurrentTab] = useState(0);

  return <>
    <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
      <ul className="flex flex-wrap -mb-px">
        {Array.from(props.children.entries()).map(([id, tab]) => <li key={id} className="me-2">
          <a 
            onClick={(_) => setCurrentTab(id)} 
            className={`inline-block p-4 border-b-2 rounded-t-lg ${currentTab === id ? "text-blue-500 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"}`}>
              {tab.label}
          </a>
        </li>)}
      </ul>
    </div>
    {props.children[currentTab].content}
  </>
}