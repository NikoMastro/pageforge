import { useParams } from 'react-router-dom';
import { LinkBioConfiguration } from '../../../components/linkbioconfig';

export default function LinkBioEditorPage() {
  const { e } = useParams<{ e?: string }>();

  // If id is 'new', pass undefined to create a new LinkBio
  const linkBioId = e === 'new' ? undefined : e;

  return <LinkBioConfiguration linkBioId={linkBioId} />;
}
