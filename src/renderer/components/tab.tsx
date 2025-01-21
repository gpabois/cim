import React, { useState } from "react";

export interface TabsProps {
  children: Array<{id: string, label: React.ReactNode, content: React.ReactNode}>
}

export function Tabs(props: TabsProps) {
  const [currentTab, setCurrentTab] = useState(0);

  return <>
    <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 w-full mb-2 )g">
      <ul className="flex flex-row flex-wrap space-x-2 items-end">
        {Array.from(props.children.entries()).map(([id, tab]) => <li key={id}>
          <a 
            onClick={(_) => setCurrentTab(id)} 
            className={`inline-block p-4 rounded-t-lg border-b-2 ${currentTab === id ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active" : "border-transparent hover:text-gray-800 hover:border-gray-800"}`}>
              {tab.label}
          </a>
        </li>)}
      </ul>
    </div>
    <div className="pt-2">
      {props.children[currentTab].content}
    </div>
  </>
}