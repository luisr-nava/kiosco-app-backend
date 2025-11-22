import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Supplier } from '@prisma/client';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

interface ProductQuery {
  search?: string;
  page?: number;
  limit?: number;
  shopId?: string;
}

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, user: JwtPayload) {
    const { id: userId, role, email } = user;
    const shop = await this.prisma.shop.findUnique({
      where: { id: createProductDto.shopId },
    });
    if (!shop) throw new NotFoundException('La tienda no existe');

    let supplier: Supplier | null = null;

    if (createProductDto.supplierId) {
      supplier = await this.prisma.supplier.findUnique({
        where: { id: createProductDto.supplierId },
      });
      if (!supplier)
        throw new NotFoundException('El proveedor especificado no existe');
    }

    const existingShopProduct = await this.prisma.shopProduct.findFirst({
      where: {
        shopId: createProductDto.shopId,
        product: { barcode: createProductDto.barcode },
      },
      include: { product: true },
    });

    if (existingShopProduct) {
      throw new ConflictException(
        `Ya existe un producto con el código de barras ${createProductDto.barcode} en esta tienda (${shop.name})`,
      );
    }

    // Verificar si la categoría existe (si se proporcionó)
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('La categoría especificada no existe');
      }
      if (category.shopId !== createProductDto.shopId) {
        throw new BadRequestException('La categoría no pertenece a esta tienda');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        barcode: createProductDto.barcode,
        taxRate: createProductDto.taxRate,
        taxCategory: createProductDto.taxCategory,
        categoryId: createProductDto.categoryId,
        supplierId: createProductDto.supplierId,
      },
    });

    const shopProduct = await this.prisma.shopProduct.create({
      
      data: {
        shopId: createProductDto.shopId,
        productId: product.id,
        costPrice: createProductDto.costPrice,
        salePrice: createProductDto.salePrice,
        stock: createProductDto.stock ?? 0,
        createdBy: userId,
      },
    });

    await this.prisma.productHistory.create({
      data: {
        shopProductId: shopProduct.id,
        userId,
        changeType: 'CREATE',
        newCost: createProductDto.costPrice,
        newStock: createProductDto.stock ?? 0,
        note: supplier
          ? `Creado por ${email} con proveedor ${supplier.name}`
          : `Creado por ${email} sin proveedor asociado`,
      },
    });

    let finalSalePrice = createProductDto.salePrice;
    if (
      shop.taxCondition === 'Responsable Inscripto' &&
      createProductDto.taxRate
    ) {
      finalSalePrice =
        createProductDto.salePrice * (1 + createProductDto.taxRate / 100);
    }

    return {
      message: 'Producto creado correctamente',
      data: {
        product,
        shopProduct: {
          ...shopProduct,
          finalSalePrice,
          supplier: supplier ? supplier.name : null,
        },
      },
    };
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    user: JwtPayload,
  ) {
    const { id: userId, email } = user;

    const shopProduct = await this.prisma.shopProduct.findUnique({
      where: { id },
      include: { product: true, shop: true },
    });

    if (!shopProduct) {
      throw new NotFoundException('El producto no existe en esta tienda');
    }

    const { shop, product } = shopProduct;

    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const duplicateInSameShop = await this.prisma.shopProduct.findFirst({
        where: {
          shopId: shop.id,
          product: { barcode: updateProductDto.barcode },
          NOT: { id: shopProduct.id },
        },
        include: { product: true },
      });

      if (duplicateInSameShop) {
        throw new ConflictException(
          `Ya existe otro producto con el código de barras ${updateProductDto.barcode} en esta tienda (${shop.name})`,
        );
      }
    }

    // Verificar si la categoría existe (si se proporcionó)
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('La categoría especificada no existe');
      }
      if (category.shopId !== shop.id) {
        throw new BadRequestException('La categoría no pertenece a esta tienda');
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: updateProductDto.name ?? product.name,
        description: updateProductDto.description ?? product.description,
        barcode: updateProductDto.barcode ?? product.barcode,
        taxRate: updateProductDto.taxRate ?? product.taxRate,
        taxCategory: updateProductDto.taxCategory ?? product.taxCategory,
        categoryId: updateProductDto.categoryId !== undefined ? updateProductDto.categoryId : product.categoryId,
        supplierId: updateProductDto.supplierId !== undefined ? updateProductDto.supplierId : product.supplierId,
      },
    });

    const updatedShopProduct = await this.prisma.shopProduct.update({
      where: { id },
      data: {
        costPrice: updateProductDto.costPrice ?? shopProduct.costPrice,
        salePrice: updateProductDto.salePrice ?? shopProduct.salePrice,
        stock:
          updateProductDto.stock !== undefined
            ? updateProductDto.stock
            : shopProduct.stock,
        isActive:
          updateProductDto.isActive !== undefined
            ? updateProductDto.isActive
            : shopProduct.isActive,
      },
    });

    // Determinar el tipo de cambio para el historial
    let changeType = 'UPDATE';
    let historyNote = `Actualizado por ${email}`;

    if (updateProductDto.isActive !== undefined && updateProductDto.isActive !== shopProduct.isActive) {
      changeType = updateProductDto.isActive ? 'REACTIVATE' : 'DEACTIVATE';
      historyNote = `Producto ${updateProductDto.isActive ? 'activado' : 'desactivado'} por ${email}`;
    }

    await this.prisma.productHistory.create({
      data: {
        shopProductId: updatedShopProduct.id,
        userId,
        changeType,
        newCost: updateProductDto.costPrice ?? shopProduct.costPrice,
        newStock: updateProductDto.stock ?? shopProduct.stock,
        note: historyNote,
      },
    });

    let finalSalePrice = updatedShopProduct.salePrice;
    if (
      shop.taxCondition === 'Responsable Inscripto' &&
      updatedProduct.taxRate
    ) {
      finalSalePrice =
        updatedShopProduct.salePrice * (1 + updatedProduct.taxRate / 100);
    }
    return {
      message: 'Producto actualizado correctamente',
      data: {
        product: updatedProduct,
        shopProduct: {
          ...updatedShopProduct,
          finalSalePrice,
        },
      },
    };
  }

  async getAllProducts(user: JwtPayload, query: ProductQuery) {
    const { search, page = 1, limit = 20, shopId } = query;

    let accessibleShopIds: string[] = [];
    if (user.role === 'OWNER') {
      const shops = await this.prisma.shop.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      accessibleShopIds = shops.map((s) => s.id);
    } else {
      const employee = await this.prisma.employee.findFirst({
        where: { email: user.email },
        select: { shopId: true },
      });

      if (!employee) {
        throw new ForbiddenException('No se encontró información del empleado');
      }

      accessibleShopIds = [employee.shopId];
    }

    if (shopId && !accessibleShopIds.includes(shopId)) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    const targetShopIds = shopId ? [shopId] : accessibleShopIds;

    if (targetShopIds.length === 0) {
      throw new ForbiddenException('No tenés tiendas asignadas');
    }

    const filters: {
      shopId: { in: string[] };
      product?: {
        OR?: (
          | { name: { contains: string; mode: 'insensitive' } }
          | { barcode: { contains: string; mode: 'insensitive' } }
        )[];
      };
    } = { shopId: { in: targetShopIds } };

    if (search) {
      filters.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [shopProducts, total] = await Promise.all([
      this.prisma.shopProduct.findMany({
        where: filters,
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true },
              },
              supplier: {
                select: { name: true },
              },
            },
          },
          shop: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.shopProduct.count({ where: filters }),
    ]);

    return {
      message:
        user.role === 'OWNER'
          ? 'Productos de todas tus tiendas'
          : 'Productos de tu tienda asignada',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: shopProducts.map((sp) => ({
        id: sp.id,
        shopId: sp.shopId,
        shopName: sp.shop.name,
        productId: sp.productId,
        name: sp.product.name,
        description: sp.product.description,
        barcode: sp.product.barcode,
        categoryId: sp.product.categoryId,
        categoryName: sp.product.category?.name || "",
        supplierName: sp.product.supplier?.name || "",
        costPrice: sp.costPrice,
        salePrice: sp.salePrice,
        stock: sp.stock,
        taxRate: sp.product.taxRate,
        taxCategory: sp.product.taxCategory,
        isActive: sp.isActive,
        createdAt: sp.createdAt,
        currency: sp.currency,
      })),
    };
  }

  async toggleActiveProduct(id: string, user: JwtPayload) {
    const shopProduct = await this.prisma.shopProduct.findUnique({
      where: { id },
      include: { product: true, shop: true },
    });

    if (!shopProduct) {
      throw new NotFoundException('El producto no existe');
    }

    if (user.role !== 'OWNER') {
      throw new ForbiddenException(
        'No tenés permiso para cambiar el estado del producto',
      );
    }

    const newStatus = !shopProduct.isActive;

    const updated = await this.prisma.shopProduct.update({
      where: { id },
      data: { isActive: newStatus },
    });

    await this.prisma.productHistory.create({
      data: {
        shopProductId: shopProduct.id,
        userId: user.id,
        changeType: newStatus ? 'REACTIVATE' : 'DEACTIVATE',
        note: `Producto ${shopProduct.product.name} ${newStatus ? 'activado' : 'desactivado'} por ${user.email}`,
      },
    });

    return {
      message: `Producto ${newStatus ? 'activado' : 'desactivado'} correctamente`,
      data: {
        id: updated.id,
        name: shopProduct.product.name,
        shop: shopProduct.shop.name,
        isActive: updated.isActive,
      },
    };
  }

  async getProductByBarcode(barcode: string, user: JwtPayload, shopId: string) {
    if (!shopId) {
      throw new BadRequestException('El parámetro shopId es obligatorio');
    }
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });
    if (!shop) throw new NotFoundException('La tienda no existe');

    const shopProduct = await this.prisma.shopProduct.findFirst({
      where: {
        shopId,
        isActive: true,
        product: { barcode },
      },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true },
            },
            supplier: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!shopProduct) {
      throw new NotFoundException(
        `No se encontró un producto con el código ${barcode} en esta tienda`,
      );
    }

    return {
      message: 'Producto encontrado',
      data: {
        id: shopProduct.id,
        productId: shopProduct.productId,
        name: shopProduct.product.name,
        description: shopProduct.product.description,
        barcode: shopProduct.product.barcode,
        categoryId: shopProduct.product.categoryId,
        categoryName: shopProduct.product.category?.name || "",
        supplierName: shopProduct.product.supplier?.name || "",
        salePrice: shopProduct.salePrice,
        costPrice: shopProduct.costPrice,
        stock: shopProduct.stock,
        isActive: shopProduct.isActive,
        currency: shopProduct.currency,
      },
    };
  }
}
