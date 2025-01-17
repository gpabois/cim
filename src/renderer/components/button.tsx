export interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string
    size?: "lg" | "md" | "sm"
    theme?: "primary" | "danger" | "barebone" | "quick"
}

export const buttonSizes = {
  'lg': 'px-4 py-2.5 me-2 mb-2 text-lg rounded-lg',
  'md': 'px-2 py-1 text-md rounded-md',
  'sm': 'text-sm rounded-sm p-0.2'
};

export const buttonThemes = {
  'primary': 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300',
  'danger': 'bg-red-700 text-white hover:bg-red-800 focus:ring-4 focus:ring-red-300',
  'quick': 'bg-gray-800 rounded-0 text-white border-gray-900',
  'barebone': ''
}

export function Button(props: ButtonProps) {
  const className = `font-medium ${props.className || ""} ${buttonSizes[props.size || "md"]} ${buttonThemes[props.theme || 'primary']}`
  
  return <button 
    onClick={props.onClick} 
    type="button" 
    className={className}>
      {props.children}
  </button>
}