import {forwardRef, JSX} from 'react';
import { Option } from './option';
import ForeignSelect from 'react-select'
import AsyncForeignSelect from 'react-select/async';
import { FieldValues, useController, UseControllerProps, useFieldArray, UseFormRegisterReturn } from 'react-hook-form';
import { useScopedFormContext } from '@app/hooks';
import { ButtonProps, buttonSizes, buttonThemes } from './button';

export interface AsyncSelectProps<V, T=any> {
  label?: string,
  loadOptions: (inputValue: string) => Promise<Array<T>>,
  transform: (item: T) => {label: string, value: V}
}

export function AsyncSelect<T extends FieldValues, V>(props: UseControllerProps<T> & AsyncSelectProps<V>) {
  const { field } = useController(props);

  const loadOptions = async (inputValue: string) => {
    const items = await props.loadOptions(inputValue);
    return items.map(props.transform)
  }

  return <>
  <Option 
    value={props.label} 
    onSome={(label) => <label htmlFor={props.name} className="mb-2 text-sm font-medium text-gray-900">
        {label}
    </label>}
  />
  <AsyncForeignSelect<{label: string, value: V}>
    classNames={{
      container: (_) => 'rounded-md',
      valueContainer: (_) => 'text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 '
    }}
    {...field} 
    loadOptions={loadOptions}
  />
</>
}
export interface SelectProps<V, T=V> {
  label?: string,
  options: Array<T>,
  transform: (item: T) => {value: V, label: string}
}

export function Select<V, T=V>(props: UseControllerProps & SelectProps<V, T>) {
  const { field } = useController(props);
  
  return <>
    <Option 
      value={props.label} 
      onSome={(label) => <label htmlFor={props.name} className="mb-2 text-sm font-medium text-gray-900">
          {label}
      </label>}
    />
    <ForeignSelect<{label: string, value: V}>
      classNames={{
        container: (_) => 'rounded-md',
        valueContainer: (_) => 'text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
      }}
      {...field}
      options={props.options.map(props.transform)}>
    </ForeignSelect>
  </>
}

export interface InputButton {
    key: string,
    content: JSX.Element | string,
    onClick?: () => void
}

export interface InputProps {
    label?: string | React.ReactNode,
    buttons?: Array<InputButton>,
    theme?: ButtonProps['theme'],
    size?: ButtonProps['size']
}

export const Input =  forwardRef<HTMLInputElement, Partial<UseFormRegisterReturn> & JSX.IntrinsicElements['input'] & InputProps>(function (props, ref) {

  if(props.type === "radio") {
    return <>
          <input 
            ref={ref} 
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" 
            {...props} 
          />
          {props.label && <label htmlFor={props.id} className="ms-2 text-sm font-medium text-gray-900">{props.label}</label>}
    </>;
  }

  if(props.type === "button" || props.type === "submit") {
    const className = `font-medium ${props.className || ""} ${buttonSizes[props.size || "md"]} ${buttonThemes[props.theme || 'primary']}`
    return <input ref={ref} {...props} className={className}/>
  }

  return <div className={props.className}>
      <Option 
          value={props.label} 
          onSome={(label) => <label htmlFor={props.id} className="mb-2 text-sm font-medium text-gray-900">
              {label}
          </label>}
      />
      <div className="flex flex-wrap items-stretch">
          <input 
            ref={ref} 
            {...props} 
            className={`${(props.buttons?.length || 0) == 0 ? "rounded-lg": "rounded-none rounded-s-lg"}  bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5`} 
          />
          {props.buttons?.map((btn) => <button key={btn.key} onClick={(_) => btn?.onClick?.()} className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-e-md">
              {btn.content}
          </button>)}
      </div>
  </div>
});


export interface MultiInputProps {
  label?: string,
  defaultFn?: () => string
}

export function MultiInput(props: UseControllerProps & MultiInputProps) {
  const {register} = useScopedFormContext(props.name);
  
  const { fields, append, remove} = useFieldArray({
    control: props.control,
    name: props.name,
  });

  const defaultFn: () => string = props.defaultFn || (() => "");

  return <>
    <div className='flex mb-2 text-sm font-medium text-gray-900'>
      <Option 
        value={props.label} 
        onSome={(label) => <label htmlFor={props.name} className="flex-1"> 
            {label}
        </label>}
      />
      <button onClick={(_) => append(defaultFn())}>Ajouter</button>
    </div>
    <div className='space-y-2 border border-gray-200 rounded-md p-2'>
      {fields.map((field, index) => 
        <Input 
          key={field.id}
          {...register(`${index}` as any)}
          buttons={[{key: "remove", content: "Supprimer", onClick: () => remove(index)}]}
        />
      )}
    </div>
  </>
}

export default function Form() {
    return <></>
}

Form.Input = Input;
