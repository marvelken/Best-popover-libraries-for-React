export type Role = 'Admin' | 'User'

export type RolePickerProps = {
  /** "0".."5" for table rows, "corner" for the fixed bottom-right trigger */
  id: string
  role: Role
  onSelect: (role: Role) => void
}

export type RolePicker = (props: RolePickerProps) => React.ReactNode
