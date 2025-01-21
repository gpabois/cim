export interface BreadcrumbProps {
  children: Array<React.ReactNode> | React.ReactNode,
  className?: string
}
export function Breadcrumbs(props: BreadcrumbProps) {
  const children = Array.isArray(props.children) ? props.children : [props.children];
  const className = ["flex items-center whitespace-nowrap pb-2 text-sm font-semibold text-gray-600", props.className || ""].join(" ");
  return <ol className={className}>
    {Array.from(children.entries()).map(([i, step]) => [i, i == children.length - 1, step]).map(([i, isLast, step]) => (
        <li key={`${i}`} className="inline-flex items-center">
          {step}
          {!isLast && <svg className="shrink-0 mx-2 size-4 text-gray-400 dark:text-neutral-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"></path>
          </svg>}
        </li>
    ))}
</ol>
}