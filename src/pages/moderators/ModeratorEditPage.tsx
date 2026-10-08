import { useParams } from 'react-router-dom'
import { ModeratorForm } from './ModeratorForm'

export function ModeratorEditPage() {
  const { id } = useParams()
  return <ModeratorForm mode="edit" id={id} />
}
