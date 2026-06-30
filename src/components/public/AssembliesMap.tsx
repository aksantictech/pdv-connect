"use client";

import dynamic from "next/dynamic";
import type { PublicAssemblyMapItem } from "@/types/assemblies-map";

type LeafletAssembliesMapProps = {
assemblies: PublicAssemblyMapItem[];
};

const LeafletAssembliesMap = dynamic<LeafletAssembliesMapProps>(
() => import("@/components/public/LeafletAssembliesMap"),
{
ssr: false,
loading: () => ( <div className="flex h-[460px] items-center justify-center rounded-[2rem] bg-blue-50 text-sm font-bold text-[#0a3d82]">
Chargement de la carte… </div>
),
}
);

export type { PublicAssemblyMapItem } from "@/types/assemblies-map";

export default function AssembliesMap({
assemblies,
}: LeafletAssembliesMapProps) {
if (assemblies.length === 0) {
return null;
}

return <LeafletAssembliesMap assemblies={assemblies} />;
}
