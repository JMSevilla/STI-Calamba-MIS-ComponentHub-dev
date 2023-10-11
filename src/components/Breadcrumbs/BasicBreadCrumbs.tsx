import { Link } from 'react-router-dom';
import routes, { Path } from '../../router/path';
import { useReferences } from '../../core/hooks/useStore';
import { useApiCallback } from '../../core/hooks/useApi';
interface BreadcrumbProps {
  pageName: string;
}
export const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  const [references, setReferences] = useReferences()
  const findRoutes: any = routes.find((o) => o.access === references?.access_level && o.isIndex === true)?.path
  const apiRemoveFromTheCurrentMeeting = useApiCallback(
    async (api, id: number) => 
    await api.internal.deleteJoinedParticipants(id)
  )
  function removeFromTheCurrentMeeting() {
      apiRemoveFromTheCurrentMeeting.execute(references?.id)
  }
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link onClick={removeFromTheCurrentMeeting} to={findRoutes}>Dashboard /</Link>
          </li>
          <li className="text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};