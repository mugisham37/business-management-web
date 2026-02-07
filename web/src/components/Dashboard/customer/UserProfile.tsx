// Re-export from shared component with customer variant
export { DropdownUserProfile } from "@/components/Dashboard/shared/DropdownUserProfile"

// For backward compatibility, export a wrapper that uses customer variant by default
import { DropdownUserProfile as BaseDropdownUserProfile } from "@/components/Dashboard/shared/DropdownUserProfile"

export function DropdownUserProfileCustomer() {
  return BaseDropdownUserProfile
}
