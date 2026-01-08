import { CreateEmployeeDto, Employee } from "../types";
import { useShopStore } from "@/features/shop/shop.store";
import {
  useEmployeeCreateMutation,
  useEmployeeUpdateMutation,
} from "./useEmployeeMutations";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";

const initialForm: CreateEmployeeDto = {
  id: "",
  fullName: "",
  email: "",
  password: "",
  dni: "",
  phone: "",
  address: "",
  hireDate: undefined,
  role: "EMPLOYEE",
  salary: 0,
  notes: "",
  profileImage: "",
  emergencyContact: "",
  shopIds: [],
};

function mapEmployeeToForm(
  employee: Employee,
  initialForm: CreateEmployeeDto
): CreateEmployeeDto {
  return {
    ...initialForm,
    fullName: employee.fullName ?? "",
    email: employee.email ?? "",
    dni: employee.dni ?? "",
    phone: employee.phone ?? "",
    address: employee.address ?? "",
    hireDate: employee.hireDate
      ? String(employee.hireDate).slice(0, 10)
      : undefined,
    salary: employee.salary ?? 0,
    notes: employee.notes ?? "",
    profileImage: employee.profileImage ?? "",
    emergencyContact: employee.emergencyContact ?? "",
    shopIds: employee.shopIds ?? [],
    role: employee.role ?? "EMPLOYEE",
  };
}

export const useEmployeeForm = (
  editEmployee?: Employee,
  isEdit?: boolean,
  onClose?: () => void
) => {
  const { activeShopId } = useShopStore();
  const createMutation = useEmployeeCreateMutation();
  const updateMutation = useEmployeeUpdateMutation();

  const form = useForm<CreateEmployeeDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreateEmployeeDto) => {
    const payload: CreateEmployeeDto = {
      ...values,
      shopIds: [activeShopId!],
      hireDate: values.hireDate || undefined,
    };

    if (editEmployee) {
      updateMutation.mutate(
        { id: editEmployee.id, payload },
        {
          onSuccess: () => {
            toast.success("Empleado actualizado");
            onClose?.();
            form.reset(initialForm);
          },
          onError: () => {
            toast.error("No se pudo actualizar el empleado");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Empleado creado");
          onClose?.();
          form.reset(initialForm);
        },
        onError: () => {
          toast.error("No se pudo crear el empleado");
        },
      });
    }
  };

  useEffect(() => {
    if (!isEdit) {
      form.reset(initialForm);
      return;
    }

    if (editEmployee) {
      form.reset(mapEmployeeToForm(editEmployee, initialForm));
    }
  }, [isEdit, editEmployee]);

  return {
    form,
    onSubmit,
    initialForm,
    reset: form.reset,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
  };
};
