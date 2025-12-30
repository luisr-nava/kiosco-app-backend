export class CashRegisterStateDto {
  hasOpenCashRegister!: boolean;
  cashRegisterId?: string;
}

export class GetCashRegisterStateResponseDto {
  message!: string;
  data!: CashRegisterStateDto;
}

export class OpenCashRegisterActorDto {
  id!: string;
  fullName!: string;
  role!: string;
}

export class OpenCashRegisterDto {
  id!: string;
  openedByUser!: OpenCashRegisterActorDto;
  openedAt!: string;
  expectedAmount!: number;
  status!: 'OPEN';
}

export class GetOpenCashRegistersResponseDto {
  message!: string;
  data!: {
    cashRegisters: OpenCashRegisterDto[];
  };
}
