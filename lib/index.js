// dsh-illuminating-skin — HOST half.
//
// Deliberately inert. This plugin is all browser-side CSS: it appends one
// <style> element and touches nothing else. Keeping the host half empty means
// no route, no tool, no service, nothing that can stall a profile boot.
//
// The row has to exist because cordis.patch.yml registers the host half into a
// profile; the BROWSER half is auto-discovered from package.json `exports["./client"]`
// + `dsh.client` and needs no row of its own.
export const name = 'illuminating-skin'
/** Nothing to wait on — applies immediately, cannot stall boot. */
export const inject = []
export function apply() {
  console.log('[illuminating-skin] host half loaded (inert by design); ' +
    'the browser half injects the frosted-glass stylesheet.')
}
