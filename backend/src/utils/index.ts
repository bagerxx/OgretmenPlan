/**
 * Tarih utility fonksiyonları
 */

export class DateUtils {
  /**
   * Eğitim yılı başlangıç ve bitiş tarihlerini hesapla
   */
  static getEducationYearDates(year: string) {
    // "2024-2025" formatından başlangıç yılını al
    const startYear = parseInt(year.split('-')[0])
    
    return {
      start: new Date(startYear, 8, 15), // 15 Eylül
      end: new Date(startYear + 1, 5, 15) // 15 Haziran
    }
  }

  /**
   * Hafta numarasına göre hafta başlangıç ve bitiş tarihlerini hesapla
   */
  static getWeekDates(weekNumber: number, educationYearStart: Date) {
    const startDate = new Date(educationYearStart)
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7)
    
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    
    return { start: startDate, end: endDate }
  }

  /**
   * İki tarih arasındaki hafta sayısını hesapla
   */
  static getWeeksBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.ceil(diffDays / 7)
  }

  /**
   * Tarihi Türkçe formatta döndür
   */
  static formatTurkish(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

/**
 * Dağılım hesaplama utility'leri
 */
export class DistributionUtils {
  /**
   * Toplam süreyi öğe sayısına eşit olarak dağıt
   */
  static distributeEqually(totalHours: number, itemCount: number) {
    if (itemCount === 0) return []
    
    const baseHours = Math.floor(totalHours / itemCount)
    const remainder = totalHours % itemCount
    
    return Array.from({ length: itemCount }, (_, index) => 
      baseHours + (index < remainder ? 1 : 0)
    )
  }

  /**
   * Ağırlıklı dağılım yap
   */
  static distributeByWeight(totalHours: number, weights: number[]) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    
    if (totalWeight === 0) return weights.map(() => 0)
    
    return weights.map(weight => 
      Math.round((weight / totalWeight) * totalHours)
    )
  }

  /**
   * Haftalık kapasiteye göre dağılım yap
   */
  static distributeToWeeks(
    items: Array<{ id: string; hours: number }>,
    weeklyCapacity: number,
    weekCount: number
  ) {
    const result: Array<Array<{ id: string; hours: number }>> = 
      Array.from({ length: weekCount }, () => [])
    
    let currentWeek = 0
    let currentWeekHours = 0
    
    for (const item of items) {
      let remainingHours = item.hours
      
      while (remainingHours > 0 && currentWeek < weekCount) {
        const availableCapacity = weeklyCapacity - currentWeekHours
        
        if (availableCapacity <= 0) {
          currentWeek++
          currentWeekHours = 0
          continue
        }
        
        const hoursToAssign = Math.min(remainingHours, availableCapacity)
        
        result[currentWeek].push({
          id: item.id,
          hours: hoursToAssign
        })
        
        remainingHours -= hoursToAssign
        currentWeekHours += hoursToAssign
        
        if (currentWeekHours >= weeklyCapacity) {
          currentWeek++
          currentWeekHours = 0
        }
      }
    }
    
    return result
  }
}

/**
 * Validation utility'leri
 */
export class ValidationUtils {
  /**
   * Eğitim yılı formatını kontrol et
   */
  static isValidEducationYear(year: string): boolean {
    const pattern = /^\d{4}-\d{4}$/
    if (!pattern.test(year)) return false
    
    const [startYear, endYear] = year.split('-').map(Number)
    return endYear === startYear + 1
  }

  /**
   * Sınıf seviyesini kontrol et
   */
  static isValidGradeLevel(level: number): boolean {
    return level >= 1 && level <= 12
  }

  /**
   * Haftalık ders saatini kontrol et
   */
  static isValidWeeklyHours(hours: number): boolean {
    return hours > 0 && hours <= 40 // Maksimum 40 saat
  }

  /**
   * CUID formatını kontrol et
   */
  static isValidCuid(id: string): boolean {
    const pattern = /^c[a-z0-9]{24}$/
    return pattern.test(id)
  }
}

/**
 * Response helper'ları
 */
export class ResponseUtils {
  /**
   * Başarılı response oluştur
   */
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      message: message || 'İşlem başarıyla tamamlandı',
      data
    }
  }

  /**
   * Hata response'u oluştur
   */
  static error(message: string, code?: string) {
    return {
      success: false,
      message,
      code: code || 'GENERAL_ERROR'
    }
  }

  /**
   * Pagination response'u oluştur
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }
}
