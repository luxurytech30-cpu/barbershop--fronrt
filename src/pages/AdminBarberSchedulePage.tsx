import { useParams } from "react-router-dom";
import AdminBarberSchedule from "@/components/admin/AdminBarberSchedule";

export default function AdminBarberSchedulePage() {
  const { id } = useParams();
  return <AdminBarberSchedule barberId={id} />;
}
