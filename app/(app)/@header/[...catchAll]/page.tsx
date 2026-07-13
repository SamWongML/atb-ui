// The @header slot's catch-all: every non-list route (overview, detail/new/edit pages, …) matches
// here and renders no rail — the shell shows the route breadcrumb instead. It exists so that on a
// client navigation *away* from a list route the slot resolves to this empty match rather than
// keeping the previous rail (parallel-route slots retain unmatched state on soft nav). (ADR 0002.)
export default function HeaderCatchAll() {
  return null;
}
