'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  image?: string
  scooterModel: string
  location: string
}

const REVIEWS: Record<'vi' | 'en', Review[]> = {
  vi: [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      rating: 5,
      comment:
        'Chất lượng decal rất tốt, màu sắc đẹp và bền. Dịch vụ lắp đặt tại xưởng chuyên nghiệp, nhân viên nhiệt tình. Rất hài lòng!',
      date: '2024-01-15',
      scooterModel: 'Honda Lead',
      location: 'Nha Trang',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      rating: 5,
      comment:
        'Thiết kế độc đáo, đúng như hình ảnh. Decal bám chặt, không bong tróc sau 6 tháng sử dụng. Giá cả hợp lý.',
      date: '2024-01-10',
      scooterModel: 'Honda Vision',
      location: 'Nha Trang',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      rating: 5,
      comment:
        'Giao hàng nhanh, đóng gói cẩn thận. Tự lắp đặt theo hướng dẫn rất dễ. Sản phẩm chất lượng cao, đáng giá tiền.',
      date: '2024-01-05',
      scooterModel: 'Yamaha NVX',
      location: 'Nha Trang',
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      rating: 5,
      comment:
        'Xe của tôi trông như mới sau khi dán decal. Màu sắc tươi sáng, không phai. Bảo hành tốt, hỗ trợ nhiệt tình.',
      date: '2023-12-28',
      scooterModel: 'Honda Air Blade',
      location: 'Nha Trang',
    },
    {
      id: '5',
      name: 'Hoàng Văn E',
      rating: 5,
      comment:
        'Dịch vụ lắp đặt tại xưởng rất chuyên nghiệp. Nhân viên tư vấn tận tình, lắp đặt cẩn thận. Xe đẹp hơn nhiều!',
      date: '2023-12-20',
      scooterModel: 'VinFast',
      location: 'Nha Trang',
    },
    {
      id: '6',
      name: 'Võ Thị F',
      rating: 5,
      comment:
        'Thiết kế theo yêu cầu đẹp, in ấn sắc nét. Decal dễ dán, không bị nhăn. Chất lượng vượt mong đợi!',
      date: '2023-12-15',
      scooterModel: 'Vespa',
      location: 'Nha Trang',
    },
  ],
  en: [
    {
      id: '1',
      name: 'Nguyen Van A',
      rating: 5,
      comment:
        'Excellent vinyl quality with vibrant, durable colors. Professional installation service and very friendly staff. Highly satisfied!',
      date: '2024-01-15',
      scooterModel: 'Honda Lead',
      location: 'Nha Trang',
    },
    {
      id: '2',
      name: 'Tran Thi B',
      rating: 5,
      comment:
        'Creative designs exactly as shown. Vinyl adheres perfectly after 6 months. Great value for money.',
      date: '2024-01-10',
      scooterModel: 'Honda Vision',
      location: 'Nha Trang',
    },
    {
      id: '3',
      name: 'Le Van C',
      rating: 5,
      comment:
        'Fast delivery and careful packaging. Easy to install with the guide. Premium quality product worth every dong.',
      date: '2024-01-05',
      scooterModel: 'Yamaha NVX',
      location: 'Nha Trang',
    },
    {
      id: '4',
      name: 'Pham Thi D',
      rating: 5,
      comment:
        'My scooter looks brand new after the wrap. Bright colors that don’t fade. Great warranty and support.',
      date: '2023-12-28',
      scooterModel: 'Honda Air Blade',
      location: 'Nha Trang',
    },
    {
      id: '5',
      name: 'Hoang Van E',
      rating: 5,
      comment:
        'Installation service is top-notch. The team advised thoughtfully and worked carefully. My scooter looks amazing!',
      date: '2023-12-20',
      scooterModel: 'VinFast',
      location: 'Nha Trang',
    },
    {
      id: '6',
      name: 'Vo Thi F',
      rating: 5,
      comment:
        'Custom design turned out perfect with sharp printing. The vinyl is easy to apply without wrinkles. Beyond expectations!',
      date: '2023-12-15',
      scooterModel: 'Vespa',
      location: 'Nha Trang',
    },
  ],
}

export default function Reviews() {
  const { lang } = useTranslations()
  const reviews: Review[] = REVIEWS[lang]
  const heading = lang === 'vi' ? 'Đánh giá từ khách hàng' : 'Customer Reviews'
  const subheading =
    lang === 'vi'
      ? 'Hơn 1000+ khách hàng hài lòng với dịch vụ của chúng tôi'
      : 'Trusted by 1,000+ happy riders across Vietnam'
  const trustLabels =
    lang === 'vi'
      ? ['Khách hàng', 'Đánh giá trung bình', 'Bảo hành', 'Hài lòng']
      : ['Customers', 'Average rating', 'Warranty', 'Satisfaction']
  const dateLocale = lang === 'vi' ? 'vi-VN' : 'en-US'

  return (
    <section id="reviews" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{heading}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subheading}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-lg">
                    {review.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{review.name}</div>
                  <div className="text-sm text-gray-600">
                    {review.scooterModel} • {review.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }
                  />
                ))}
              </div>

              <Quote className="text-primary-200 mb-2" size={24} />
              <p className="text-gray-700 mb-4 italic">{review.comment}</p>

              {review.image && (
                <div className="mt-4 relative w-full h-32 rounded-lg overflow-hidden">
                  <Image
                    src={review.image}
                    alt={`Review from ${review.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              )}

              <div className="text-sm text-gray-500 mt-4">
                {new Date(review.date).toLocaleDateString(dateLocale)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
            <div className="text-gray-600">{trustLabels[0]}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">4.9/5</div>
            <div className="text-gray-600">{trustLabels[1]}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">2 năm</div>
            <div className="text-gray-600">{trustLabels[2]}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
            <div className="text-gray-600">{trustLabels[3]}</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
