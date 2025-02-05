import { None, Optional } from "@shared/option";
import { useState } from "react"

export interface AccordeonProps {
  selected?: Optional<number>,
  onSelected?: (number: Optional<number>) => void,
  children: Array<{key: string, title: React.ReactNode, content: React.ReactNode}>
}
export function Accordeon(props: AccordeonProps) {
  const [row, setRow] = useState<Optional<number>>(props.selected);

  const updateRow = (id: Optional<number>) => {
    props.onSelected?.(id);
    setRow(id);
  }

  return <div className="space-y-4 pt-2">
    {props.children.map(({key, title, content}, index) => {
      const isSelected = index == row;
      const className = isSelected ? "border-b-blue-600 text-blue-600" : "border-b-gray-200 text-gray-600 hover:border-b-gray-400 hover:text-gray-600";
      return <div key={key}>
        <div onClick={() => isSelected ? updateRow(None) : updateRow(index)} className={`${className} pb-4 font-semibold border-b-2 px-2`}>{title}</div>
        {isSelected && <div className="border-b-2 pb-4 bg-white">{content}</div>}
      </div>
    })}
  </div>
}