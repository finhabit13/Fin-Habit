/** Avatar pengguna: foto bila ada, inisial sebagai cadangan. */
export default function Avatar({ user, size = "md", className = "" }) {
  const name = (user?.name || "A").trim();
  const initial = name.charAt(0).toUpperCase();
  const url = user?.avatarUrl;
  const cls = ("avatar avatar-" + size + (className ? " " + className : "")).trim();

  if (url) {
    return <img className={cls} src={url} alt={name} />;
  }
  return (
    <span className={cls} aria-hidden="true">
      {initial}
    </span>
  );
}
