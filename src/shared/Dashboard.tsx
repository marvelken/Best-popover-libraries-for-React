import { useState } from 'react'
import { USERS } from './data'
import type { Role, RolePicker } from './types'

/** Shared page shell: every route renders the same table, wrapper and fixed corner trigger. */
export function Dashboard({ title, Picker }: { title: string; Picker: RolePicker }) {
  const [roles, setRoles] = useState<Role[]>(USERS.map((u) => u.role))
  const [cornerRole, setCornerRole] = useState<Role>('User')

  return (
    <main className="page">
      <header className="page-header" data-testid="empty-area">
        {/* tabIndex -1 keeps the link out of the Tab order the keyboard tests count. The label is drawn
            by CSS so it stays out of document text, which test 5 records when focus exits to body. */}
        <a className="crumb" href="/" tabIndex={-1} aria-label="Popover Test Bench">
          <span className="crumb-mark" aria-hidden="true" />
        </a>
        <span className="crumb-sep" aria-hidden="true" />
        <h1>{title}</h1>
      </header>
      <div className="table-wrap" data-testid="table-wrap">
        <table className="users">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => (
              <tr key={u.email}>
                <td data-testid={`user-cell-${i}`}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Picker
                    id={String(i)}
                    role={roles[i]}
                    onSelect={(r) => setRoles((prev) => prev.map((p, j) => (j === i ? r : p)))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="after-table">
        <button type="button" data-testid="after-table">
          Next focusable element
        </button>
      </p>
      <div className="spacer" aria-hidden="true" />
      <div className="corner">
        <Picker id="corner" role={cornerRole} onSelect={setCornerRole} />
      </div>
    </main>
  )
}
