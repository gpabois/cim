import { None, Optional } from "@interface/option";
import { useState } from "react"

export interface AccordeonProps {
  children: Array<{key: string, title: React.ReactNode, content: React.ReactNode}>
}
export function Accordeon(props: AccordeonProps) {
  const [row, setRow] = useState<Optional<number>>(None);

  return <div className="space-y-4">
    {props.children.map(({key, title, content}, index) => {
      const isSelected = index == row;
      const className = isSelected ? "border-b-blue-600 text-blue-600" : "border-b-gray-200 text-gray-600 hover:border-b-gray-400 hover:text-gray-600";
      return <div key={key}>
        <div onClick={() => isSelected ? setRow(None) : setRow(index)} className={`${className} pb-4 font-semibold border-b-2`}>{title}</div>
        {isSelected && <div>{content}</div>}
      </div>
    })}
  </div>
}