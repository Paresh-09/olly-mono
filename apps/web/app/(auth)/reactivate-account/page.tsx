import ReactivateAccountForm from "../_components/reactivation";

export default async function ReactivateAccountPage(props: { searchParams: Promise<{ token: string }> }) {
  const searchParams = await props.searchParams;
  return <ReactivateAccountForm token={searchParams.token} />;
}