// The @header parallel-route slot fills the shell's header region for list routes with their
// server-rendered <ListRail> (ADR 0002). This default renders for a hard load whose route has no
// rail; the shell shows the route breadcrumb there instead, so the slot contributes nothing.
export default function HeaderDefault() {
  return null;
}
