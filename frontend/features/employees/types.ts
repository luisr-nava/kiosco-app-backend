export type EmployeeRole = "OWNER" | "MANAGER" | "EMPLOYEE";

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: EmployeeRole;
  shopName?: string;
  isActive: boolean;
  dni?: string | null;
  address?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  notes?: string | null;
  profileImage?: string | null;
  emergencyContact?: string | null;
  shopIds?: string[];
}
export interface EmployeeAuth {
  message: string;
  userId: string;
}

export interface CreateEmployeeDto {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  dni: string;
  phone?: string | null;
  address?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  notes?: string | null;
  profileImage?: string | null;
  emergencyContact?: string | null;
  role: Exclude<EmployeeRole, "OWNER"> | "OWNER";
  shopIds: string[];
  isActive?: boolean;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

export interface GetEmployeesResponse {
  message?: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: Employee[];
}

