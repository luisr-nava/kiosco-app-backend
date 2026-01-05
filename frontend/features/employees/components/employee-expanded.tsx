import { Employee } from "../types";
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";

interface EmployeeExpandedProps {
  employee: Employee;
}

export default function EmployeeExpanded({ employee }: EmployeeExpandedProps) {
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="grid grid-cols-2 gap-4 p-4 text-sm">
      {/* Columna izquierda */}
      <div className="space-y-2">
        <div>
          <p className="text-muted-foreground">DNI</p>
          <p className="font-medium">{employee.dni || "Sin DNI"}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Fecha de contratación</p>
          <p className="font-medium">
            {employee.hireDate
              ? new Date(employee.hireDate).toLocaleDateString()
              : "Sin fecha"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Salario</p>
          <p className="font-medium">
            {employee.salary != null ? formatCurrency(employee.salary) : "—"}
          </p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="space-y-2">
        <div>
          <p className="text-muted-foreground">Dirección</p>
          <p className="font-medium">{employee.address || "Sin dirección"}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Contacto de emergencia</p>
          <p className="font-medium">
            {employee.emergencyContact || "Sin contacto"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Notas</p>
          <p className="font-medium">{employee.notes || "Sin notas"}</p>
        </div>
      </div>
    </div>
  );
}

