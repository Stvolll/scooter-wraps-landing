'use client'

import { useLanguage } from '@/contexts/LanguageContext'

type TranslationKey = 
  | 'header.orderNow'
  | 'menu.models'
  | 'menu.designs'
  | 'menu.howToInstall'
  | 'menu.production'
  | 'menu.reviews'
  | 'menu.contact'
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.swipeHint'
  | 'hero.tapHint'
  | 'designs.title'
  | 'designs.filterAll'
  | 'designs.filterNew'
  | 'designs.buyNow'
  | 'checkout.title'
  | 'checkout.cod'
  | 'checkout.momo'
  | 'checkout.zalopay'
  | 'checkout.bankTransfer'
  | 'checkout.card'
  | 'footer.description'
  | 'footer.quickLinks'
  | 'footer.followUs'
  | 'footer.businessHours'
  | 'footer.rights'

const translations: Record<'vi' | 'en', Record<TranslationKey, string>> = {
  vi: {
    'header.orderNow': 'Đặt ngay',
    'menu.models': 'Mẫu xe',
    'menu.designs': 'Thiết kế',
    'menu.howToInstall': 'Hướng dẫn',
    'menu.production': 'Sản xuất',
    'menu.reviews': 'Đánh giá',
    'menu.contact': 'Liên hệ',
    'hero.title': 'Dán Decal Xe Máy Cao Cấp',
    'hero.subtitle': 'Thiết kế độc đáo, chất lượng cao, bảo hành uy tín',
    'hero.swipeHint': 'Vuốt để xoay / Xem thiết kế',
    'hero.tapHint': 'Chạm để xem thiết kế',
    'designs.title': 'Bộ sưu tập thiết kế',
    'designs.filterAll': 'Tất cả',
    'designs.filterNew': 'Mới',
    'designs.buyNow': 'Đặt làm',
    'checkout.title': 'Thanh toán',
    'checkout.cod': 'Thanh toán khi nhận hàng',
    'checkout.momo': 'Ví MoMo',
    'checkout.zalopay': 'ZaloPay',
    'checkout.bankTransfer': 'Chuyển khoản',
    'checkout.card': 'Thẻ tín dụng/Ghi nợ',
    'footer.description': 'Chuyên dán decal, bọc phim xe máy cao cấp tại Nha Trang',
    'footer.quickLinks': 'Liên kết nhanh',
    'footer.followUs': 'Theo dõi chúng tôi',
    'footer.businessHours': 'Giờ làm việc: 8:00 - 20:00 (Thứ 2 - Chủ nhật)',
    'footer.rights': 'Tất cả quyền được bảo lưu.',
  },
  en: {
    'header.orderNow': 'Order Now',
    'menu.models': 'Models',
    'menu.designs': 'Designs',
    'menu.howToInstall': 'How to Install',
    'menu.production': 'Production',
    'menu.reviews': 'Reviews',
    'menu.contact': 'Contact',
    'hero.title': 'Premium Scooter Vinyl Wraps',
    'hero.subtitle': 'Unique designs, high quality, trusted warranty',
    'hero.swipeHint': 'Swipe to rotate / View designs',
    'hero.tapHint': 'Tap to view designs',
    'designs.title': 'Design Collection',
    'designs.filterAll': 'All',
    'designs.filterNew': 'New',
    'designs.buyNow': 'Order Now',
    'checkout.title': 'Checkout',
    'checkout.cod': 'Cash on Delivery',
    'checkout.momo': 'MoMo Wallet',
    'checkout.zalopay': 'ZaloPay',
    'checkout.bankTransfer': 'Bank Transfer',
    'checkout.card': 'Credit/Debit Card',
    'footer.description': 'Premium vinyl wraps and decals for scooters in Nha Trang',
    'footer.quickLinks': 'Quick Links',
    'footer.followUs': 'Follow Us',
    'footer.businessHours': 'Business Hours: 8:00 AM - 8:00 PM (Mon - Sun)',
    'footer.rights': 'All rights reserved.',
  },
}

export function useTranslations() {
  const { language, setLanguage } = useLanguage()
  const lang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi'

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || key
  }

  const toggleLang = () => {
    setLanguage(lang === 'en' ? 'vi' : 'en')
  }

  return { t, lang, setLang: setLanguage, toggleLang }
}

