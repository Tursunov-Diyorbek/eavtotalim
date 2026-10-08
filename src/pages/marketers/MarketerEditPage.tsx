import { useParams } from 'react-router-dom'
import { MarketerForm } from './MarketerForm'

export function MarketerEditPage() {
  const { id } = useParams()
  return <MarketerForm mode="edit" id={id} />
}
