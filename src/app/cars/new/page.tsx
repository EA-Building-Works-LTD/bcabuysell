import { redirect } from 'next/navigation';

export default function NewCarRedirect() {
  redirect('/cars/add');
} 