import type { ComponentProps } from 'react'
import logo from '../assets/logo.svg'

export function Logo(props: ComponentProps<'img'>) {
  return <img src={logo} alt="brev.ly" {...props} />
}
