export type EmployeeRole = "OWNER" | "MANAGER" | "EMPLOYEE";

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: EmployeeRole;
  shopId: string;
  shopName?: string;
  isActive: boolean;
  dni?: string | null;
  address?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  notes?: string | null;
  profileImage?: string | null;
  emergencyContact?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDto {
  fullName: string;
  email: string;
  password: string;
  dni: string;
  phone?: string | null;
  address?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  notes?: string | null;
  profileImage?: string | null;
  emergencyContact?: string | null;
  role: Exclude<EmployeeRole, "OWNER"> | "OWNER";
  shopId: string;
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
