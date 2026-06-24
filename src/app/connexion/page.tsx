import LoginForm from "@/components/auth/LoginForm";

type ConnexionPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function ConnexionPage({
  searchParams,
}: ConnexionPageProps) {
  const params = await searchParams;

  const messages: Record<string, string> = {
    not_authorized:
      "Votre compte est actif, mais aucun rôle administratif ne vous a encore été attribué.",
  };

  return (
    <LoginForm
      nextPath={params.next}
      initialMessage={params.error ? messages[params.error] : undefined}
    />
  );
}