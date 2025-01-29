export interface StackedItemProps {
  key: string,
  content: React.ReactNode | string,
  subcontent?: React.ReactNode | string
}

export interface StackedListProps {
  children: Array<StackedItemProps> | StackedItemProps
}

export function StackedList(props: StackedListProps) {
  const items = Array.isArray(props.children) ? props.children : [props.children];

  return <ul role="list" className="divide-y divide-gray-300">
    {items.map(({key, content, subcontent}) => (
      <li className="flex justify-between gap-x-6 py-5 px-2" key={key}>
        <div className="flex min-w-0 gap-x-4">
          <div className="min-w-0 flex-auto">
            <p className="text-sm/6 font-semibold text-gray-900">{content}</p>
            <p className="mt-1 truncate text-xs/5 text-gray-500">{subcontent}</p>
          </div>
        </div>
    </li>))}
  </ul>
}