import React from "react";
import UsersClient from "./UsersClient";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export function generateStaticParams() {
  return [
    { appId: "auditbusiness-6ac2e" },
    { appId: "analyzer-a7b76" },
    { appId: "astra-e1afa" },
    { appId: "diceblue-20f13" },
    { appId: "n8n---content-creation" }
  ];
}

export default async function Page({ params }: PageProps) {
  return <UsersClient params={params} />;
}
