export type Role = 'admin' | 'adult' | 'child'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type RepeatFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ProjectStatus = 'planned' | 'in_progress' | 'completed'

export type Category =
  | 'groceries'
  | 'bills'
  | 'vehicles'
  | 'home'
  | 'school'
  | 'vacation'
  | 'medical'
  | 'pets'
  | 'other'

export interface Family {
  id: string
  name: string
  invite_code: string
  created_at: string
  created_by: string
}

export interface FamilyMember {
  id: string
  family_id: string
  user_id: string | null
  display_name: string
  role: Role
  avatar_color: string
  created_at: string
}

export interface GroceryItem {
  id: string
  family_id: string
  name: string
  quantity: string
  category: Category
  needed_by: string | null
  added_by: string | null
  assigned_store: string | null
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  created_at: string
  added_by_member?: FamilyMember
}

export interface Reminder {
  id: string
  family_id: string
  title: string
  assigned_to: string | null
  due_date: string | null
  repeat_frequency: RepeatFrequency
  priority: Priority
  category: Category
  notes: string | null
  completed: boolean
  created_at: string
  assigned_member?: FamilyMember
}

export interface Upload {
  id: string
  family_id: string
  storage_path: string
  title: string
  file_type: string | null
  category: Category
  notes: string | null
  assigned_to: string | null
  linked_reminder_id: string | null
  created_by: string | null
  created_at: string
  assigned_member?: FamilyMember
  created_by_member?: FamilyMember
}

export interface Bill {
  id: string
  family_id: string
  title: string
  due_date: string | null
  amount: number | null
  autopay: boolean
  paid: boolean
  notes: string | null
  category: Category
  created_at: string
}

export interface Vehicle {
  id: string
  family_id: string
  name: string
  make: string | null
  model: string | null
  year: number | null
  mileage: number | null
  insurance_expiry: string | null
  inspection_expiry: string | null
  registration_expiry: string | null
  notes: string | null
  created_at: string
  maintenance?: VehicleMaintenance[]
}

export interface VehicleMaintenance {
  id: string
  vehicle_id: string
  family_id: string
  title: string
  due_mileage: number | null
  due_date: string | null
  completed: boolean
  notes: string | null
  created_at: string
}

export interface HomeProject {
  id: string
  family_id: string
  title: string
  priority: Priority
  status: ProjectStatus
  notes: string | null
  due_date: string | null
  assigned_to: string | null
  created_at: string
  assigned_member?: FamilyMember
}

export interface MealPlan {
  id: string
  family_id: string
  plan_date: string
  meal_type: MealType
  title: string
  notes: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      families: {
        Row: Family
        Insert: Omit<Family, 'id' | 'created_at' | 'invite_code'>
        Update: Partial<Omit<Family, 'id' | 'created_at'>>
      }
      family_members: {
        Row: FamilyMember
        Insert: Omit<FamilyMember, 'id' | 'created_at'>
        Update: Partial<Omit<FamilyMember, 'id' | 'created_at'>>
      }
      grocery_items: {
        Row: GroceryItem
        Insert: Omit<GroceryItem, 'id' | 'created_at'>
        Update: Partial<Omit<GroceryItem, 'id' | 'created_at'>>
      }
      reminders: {
        Row: Reminder
        Insert: Omit<Reminder, 'id' | 'created_at'>
        Update: Partial<Omit<Reminder, 'id' | 'created_at'>>
      }
      uploads: {
        Row: Upload
        Insert: Omit<Upload, 'id' | 'created_at'>
        Update: Partial<Omit<Upload, 'id' | 'created_at'>>
      }
      bills: {
        Row: Bill
        Insert: Omit<Bill, 'id' | 'created_at'>
        Update: Partial<Omit<Bill, 'id' | 'created_at'>>
      }
      vehicles: {
        Row: Vehicle
        Insert: Omit<Vehicle, 'id' | 'created_at'>
        Update: Partial<Omit<Vehicle, 'id' | 'created_at'>>
      }
      vehicle_maintenance: {
        Row: VehicleMaintenance
        Insert: Omit<VehicleMaintenance, 'id' | 'created_at'>
        Update: Partial<Omit<VehicleMaintenance, 'id' | 'created_at'>>
      }
      home_projects: {
        Row: HomeProject
        Insert: Omit<HomeProject, 'id' | 'created_at'>
        Update: Partial<Omit<HomeProject, 'id' | 'created_at'>>
      }
      meal_plans: {
        Row: MealPlan
        Insert: Omit<MealPlan, 'id' | 'created_at'>
        Update: Partial<Omit<MealPlan, 'id' | 'created_at'>>
      }
    }
  }
}
