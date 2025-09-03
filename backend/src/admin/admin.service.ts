import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  dersleriGetir() {
    return this.prisma.ders.findMany({
      include: { sinif: true },
      orderBy: [ { sinif: { seviye: 'asc' } }, { ad: 'asc' } ]
    });
  }

  dersById(id: string) {
    return this.prisma.ders.findUnique({
      where: { id },
      include: {
        sinif: true,
        temalar: {
          orderBy: { sira: 'asc' },
          include: {
            beceriler: { orderBy: { sira: 'asc' } },
            kazanimlar: { orderBy: { sira: 'asc' } }
          }
        }
      }
    });
  }

  async temaEkle(dersId: string, ad: string, sira: number) {
    return this.prisma.tema.create({ data: { dersId, ad, sira } });
  }

  async beceriEkle(temaId: string, ad: string, sira: number, saatSuresi: number) {
    return this.prisma.beceri.create({ data: { temaId, ad, sira, saatSuresi } });
  }

  async kazanimEkle(temaId: string, ad: string, sira: number, saatSuresi: number) {
    return this.prisma.kazanim.create({ data: { temaId, ad, sira, saatSuresi } });
  }
}
