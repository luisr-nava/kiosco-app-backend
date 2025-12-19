import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePaginationParams } from "@/app/(private)/hooks/useQueryParams";
import { Employee, CreateEmployeeDto } from "../interfaces";
import { useEmployees } from "./useEmployees";
import { useEmployeeMutations } from "./useEmployeeMutations";

interface UseEmployeePageParams {
  isOwner: boolean;
  activeShopId?: string | null;
}

export const useEmployee = ({
  isOwner,
  activeShopId,
}: UseEmployeePageParams) => {
  const { search, setSearch, debouncedSearch, page, limit, setPage, setLimit } =
    usePaginationParams(300);

  const { employees, pagination, employeesLoading, isFetching } = useEmployees(
    debouncedSearch,
    page,
    limit,
    isOwner && Boolean(activeShopId),
  );

  const { createMutation, updateMutation, deleteMutation } =
    useEmployeeMutations();

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const deletingId = useMemo(
    () =>
      deleteMutation.isPending && deleteMutation.variables
        ? (deleteMutation.variables as string)
        : null,
    [deleteMutation.isPending, deleteMutation.variables],
  );

  const handleSubmit = (values: {
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
  }) => {
    if (!activeShopId) {
      toast.error("Selecciona una tienda para gestionar empleados.");
      return;
    }

    const salaryValue = values.salary;
    const normalizedSalary =
      salaryValue === undefined ||
      salaryValue === null ||
      Number.isNaN(Number(salaryValue))
        ? null
        : Number(salaryValue);

    if (editingEmployee) {
      const updatePayload: Partial<CreateEmployeeDto> = {
        fullName: values.fullName,
        email: values.email,
        dni: values.dni,
        phone: values.phone || null,
        address: values.address || null,
        hireDate: values.hireDate || null,
        salary: normalizedSalary,
        notes: values.notes || null,
        profileImage: values.profileImage || null,
        emergencyContact: values.emergencyContact || null,
        role: "EMPLOYEE",
        shopId: activeShopId,
      };
      if (values.password) {
        updatePayload.password = values.password;
      }

      updateMutation.mutate(
        { id: editingEmployee.id, payload: updatePayload },
        {
          onSuccess: () => {
            setEditingEmployee(null);
            setIsModalOpen(false);
          },
        },
      );
    } else {
      const createPayload: CreateEmployeeDto = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        dni: values.dni,
        phone: values.phone || null,
        address: values.address || null,
        hireDate: values.hireDate || null,
        salary: normalizedSalary,
        notes: values.notes || null,
        profileImage: values.profileImage || null,
        emergencyContact: values.emergencyContact || null,
        role: "EMPLOYEE",
        shopId: activeShopId,
      };

      createMutation.mutate(createPayload, {
        onSuccess: () => {
          setEditingEmployee(null);
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  const handleDelete = (employee: Employee) => setDeleteTarget(employee);
  const closeDeleteModal = () => setDeleteTarget(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (editingEmployee?.id === deleteTarget.id) {
          setEditingEmployee(null);
        }
        closeDeleteModal();
      },
    });
  };

  useEffect(() => {
    if (!pagination) return;
    const maxPage = Math.max(pagination.totalPages, 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pagination, setPage]);

  return {
    // pagination/search
    search,
    setSearch,
    debouncedSearch,
    page,
    limit,
    setPage,
    setLimit,
    pagination,
    // data
    employees,
    employeesLoading,
    isFetching,
    // modals / state
    isModalOpen,
    editingEmployee,
    deleteTarget,
    deletingId,
    // handlers
    handleSubmit,
    handleOpenCreate,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
    // mutations
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

