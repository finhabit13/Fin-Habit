import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toastMsg, toastShow } = useApp();
  return (
    <div className={"toast" + (toastShow ? " show" : "")} role="status" aria-live="polite">
      {toastMsg}
    </div>
  );
}