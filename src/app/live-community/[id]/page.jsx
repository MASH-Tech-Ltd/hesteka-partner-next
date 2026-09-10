import { notFound } from "next/navigation";
import LiveCommunityClient from "../LiveCommunityClient";

export const metadata = {
  title: "La communauté en direct | Hesteka",
  description: "Rejoignez la communauté Hesteka en direct",
};

export default async function LiveCommunityPage({ params }) {
  const { id } = await params;
  const validId = "3dc0cc7b-3111-4d7d-833c346-efhdf3-b1be0";
  
  if (id !== validId) {
    notFound();
  }
  
  return <LiveCommunityClient />;
}
