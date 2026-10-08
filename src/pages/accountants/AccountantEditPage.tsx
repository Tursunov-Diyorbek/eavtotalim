import { useParams } from 'react-router-dom'
import { AccountantForm } from './AccountantForm'

export function AccountantEditPage() {
  const { id } = useParams()
  return <AccountantForm mode="edit" id={id} />
}
