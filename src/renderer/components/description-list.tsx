import React from "react";

export interface DescriptionListProps {
  children: {
    title?: React.ReactNode,
    description?: React.ReactNode,
    fields: Array<{heading: React.ReactNode, content: React.ReactNode, key: string}>
  }
}
export function DescriptionList(props: DescriptionListProps) {
  return <div>
    {props.children.title && 
    <div className="px-4 sm:px-0">
      <h3 className="text-base/7 font-semibold text-gray-900">{props.children.title}</h3>
      {props.children.description && <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">{props.children.description}</p>}
    </div>
    }
    <div>
      <dl className="divide-y divide-gray-300">
        {props.children.fields.map(({heading, content, key}) => <div key={key} className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm/6 font-medium text-gray-900 px-2">{heading}</dt>
        <dd className="text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{content}</dd>
      </div>)}
      </dl>
    </div>
  </div>
}