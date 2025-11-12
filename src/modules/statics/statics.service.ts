import { Injectable } from '@nestjs/common';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { UserRepository } from 'src/DB/repository/user.repository';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { OrderStatus, PaymentType } from 'src/common/enums/payment.enums';

@Injectable()
export class StaticsService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async getStatistics() {
    const [allUsers, allProducts, allOrders, allCategories, allBrands] = await Promise.all([
      this.userRepository.find({ filter: {} }),
      this.productRepository.find({ filter: {} }),
      this.orderRepository.find({ filter: {} }),
      this.categoryRepository.find({ filter: {} }),
      this.brandRepository.find({ filter: {} }),
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const paidOrdersRevenue = allOrders
      .filter((order) => order.paidAt || order.status !== OrderStatus.Pending)
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const ordersByStatus = {
      pending: allOrders.filter((order) => order.status === OrderStatus.Pending).length,
      placed: allOrders.filter((order) => order.status === OrderStatus.Placed).length,
      onWay: allOrders.filter((order) => order.status === OrderStatus.OnWay).length,
      delivered: allOrders.filter((order) => order.status === OrderStatus.Delivered).length,
      cancelled: allOrders.filter((order) => order.status === OrderStatus.Cancelled).length,
    };

    const totalItemsSold = allProducts.reduce((sum, product) => sum + (product.soldItems || 0), 0);

    const topSellingProducts = allProducts
      .sort((a, b) => (b.soldItems || 0) - (a.soldItems || 0))
      .slice(0, 5)
      .map((product) => ({
        id: product._id,
        name: product.name,
        soldItems: product.soldItems || 0,
        stock: product.stock || 0,
      }));

    const lowStockProducts = allProducts
      .filter((product) => (product.stock || 0) < 10)
      .map((product) => ({
        id: product._id,
        name: product.name,
        stock: product.stock || 0,
      }));

    const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    const revenueByPaymentType = {
      cash: allOrders
        .filter((order) => order.paymentType === PaymentType.Cash)
        .reduce((sum, order) => sum + (order.total || 0), 0),
      card: allOrders
        .filter((order) => order.paymentType === PaymentType.Card)
        .reduce((sum, order) => sum + (order.total || 0), 0),
    };

    return {
      overview: {
        totalUsers: allUsers.length,
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalCategories: allCategories.length,
        // totalBrands: allBrands.length,
        // totalItemsSold,
        // totalRevenue: Math.round(totalRevenue * 100) / 100,
        // paidRevenue: Math.round(paidOrdersRevenue * 100) / 100,
        // averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      },
    //   orders: {
    //     byStatus: ordersByStatus,
    //     revenueByPaymentType: {
    //       cash: Math.round(revenueByPaymentType.cash * 100) / 100,
    //       card: Math.round(revenueByPaymentType.card * 100) / 100,
    //     },
    //   },
    //   products: {
    //     topSelling: topSellingProducts,
    //     lowStock: lowStockProducts,
    //     lowStockCount: lowStockProducts.length,
    //   },
    };
  }
}

