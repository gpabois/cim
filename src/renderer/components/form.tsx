import {forwardRef, JSX, useState} from 'react';
import { Option } from './option';
import ForeignSelect from 'react-select'
import AsyncForeignSelect from 'react-select/async';
import { Controller, useController, UseControllerProps, useFieldArray, useForm, useFormContext, UseFormRegisterReturn } from 'react-hook-form';
import { useScopedFormContext } from '@renderer/hooks';
import { Button, ButtonProps, buttonSizes, buttonThemes } from './button';
import { BiAddToQueue, BiEdit } from 'react-icons/bi';
import { isSome, Optional } from '@shared/option';

export type EditableFieldProps = JSX.IntrinsicElements['input'] & InputProps & {
  defaultValues?: string
  onSubmit?: (value: string) => void
  children: React.ReactNode
}

export function EditableField(props: EditableFieldProps) {
  const methods = useForm<{value: string}>({defaultValues: {value: props.defaultValues}});
  type ModeKind = "edit" | "view";

  const [mode, setMode] = useState<ModeKind>("view");

  const submit = ({value}) => {
    props.onSubmit?.(value);
    setMode("view");
  }

  if(mode === "edit") {
    const propsInput = {...props};
    delete propsInput["children"];
    delete propsInput["onSubmit"];
    delete propsInput["defaultValues"];

    return <form onSubmit={methods.handleSubmit(submit)}>
      <Input {...propsInput} {...methods.register("value")} />
      <div className="flex space-x-2">
        <Input type="submit" value={"Enregistrer"}/>
        <Button theme="danger" onClick={() => setMode("view")}>Annuler</Button>
      </div>
    </form>
  } else {
    return <div className='flex space-x-2'>
      <div>
        {props.children}
      </div>
      <Button theme='barebone' onClick={() => setMode("edit")}><BiEdit/></Button>
    </div>
  }
}


export interface AsyncSelectProps<T, V> {
  label?: string,
  name: string,
  loadOptions: (inputValue: string) => Promise<Array<T>>,
  transform: (item: T) => {label: string, value: V}
}

export function AsyncSelect<T, V>(props: AsyncSelectProps<T, V>) {
  const { control } = useFormContext()

  const loadOptions = async (inputValue: string): Promise<Array<{label: string, value: V}>> => {
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
  <Controller
    name={props.name}
    control={control}
    render={({field}) => <AsyncForeignSelect<{label: string, value: V}>
      classNames={{
        container: (_) => 'rounded-md',
        valueContainer: (_) => 'text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 '
      }}
      {...field} 
      onChange={(v) => field.onChange(v?.value)}
      loadOptions={loadOptions}
    />}
  />
</>
}
export interface SelectProps<V, T=V> {
  name?: string,
  label?: string,
  value?: T,
  options: Array<T>,
  transform: (item: T) => {value: V, label: string},
  onChange?: (value: V) => void
}

export function Select<V, T=V>(props: SelectProps<V, T>) {
  const onChange = (v: Optional<{value: V, label: string}>) => {
    if(isSome(v)) {
      props.onChange?.(v.value)
    }
  }
  
  return <div>
  <Option 
      value={props.label} 
      onSome={(label) => <label htmlFor={props.name} className="mb-2 text-sm font-medium text-gray-900">
          {label}
      </label>}
    />
    <ForeignSelect<{label: string, value: V}>
      classNames={{
        container: (_) => 'rounded-md',
        valueContainer: (_) => 'text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5'
      }}
      value={props.value && props.transform(props.value)}
      onChange={onChange}
      options={props.options.map(props.transform)}>
  </ForeignSelect>
  </div>
}

export function RhfSelect<V, T=V>(props: UseControllerProps & SelectProps<V, T>) {
  const { field } = useController(props);
  
  return <div>
    <Option 
      value={props.label} 
      onSome={(label) => <label htmlFor={props.name} className="mb-2 text-sm font-medium text-gray-900">
          {label}
      </label>}
    />
    <ForeignSelect<{label: string, value: V}>
      classNames={{
        container: (_) => 'rounded-md',
        valueContainer: (_) => 'text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5'
      }}
      {...field}
      onChange={(v) => field.onChange(v?.value)}
      options={props.options.map(props.transform)}>
    </ForeignSelect>
  </div>
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
    return <div>
          <input 
            ref={ref} 
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" 
            {...props} 
          />
          {props.label && <label htmlFor={props.id} className="ms-2 text-sm font-medium text-gray-900">{props.label}</label>}
    </div>;
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
      <Button theme='barebone' onClick={() => append(defaultFn())}><BiAddToQueue/></Button>
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
