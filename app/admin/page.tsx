import type { Metadata } from 'next';
import { AdminDashboardView } from '@/src/components/admin/AdminDashboardView';

export const metadata: Metadata = {
  title: 'لوحة إدارة شبكة طلقة نت | المشرف',
  description: 'لوحة التحكم السحابية لإدارة المحتوى والمسابقة وصندوق الجوائز في شبكة طلقة نت.',
};

export default function AdminPage() {
  return <AdminDashboardView />;
}
