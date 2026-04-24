import { redirect } from 'next/navigation';

export default function Redirect({ params }: { params: { id: string } }) {
  redirect(`/creator-dashboard/services/${params.id}/edit`);
}
