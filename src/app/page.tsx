import { loadConundrumDataset } from "@/lib/sheets-loader";
import { ConundrumWorkspace } from "@/components/ConundrumWorkspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialData = await loadConundrumDataset();
  return <ConundrumWorkspace initialData={initialData} />;
}
