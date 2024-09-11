export default function Page({ params, searchParams }) {
  const { shop, host, hmac, embedded } = searchParams;
  console.log('%c shop', 'color: green; font-weight: bold;', shop);
  console.log('%c host', 'color: green; font-weight: bold;', host);
  console.log('%c hmac', 'color: green; font-weight: bold;', hmac);
  console.log('%c embedded', 'color: green; font-weight: bold;', embedded);
  return (
    <div>
      <h1>Home page!</h1>
    </div>
  );
}
