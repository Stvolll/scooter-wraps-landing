'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Clock, Award, Shield, Calendar, CheckCircle } from 'lucide-react'
import InstallationBooking from './InstallationBooking'
import { useTranslations } from '@/hooks/useTranslations'

type ProcessStep = {
  step: string
  title: string
  desc: string
}

export default function ProductionQC() {
  const [showBooking, setShowBooking] = useState(false)
  const { lang } = useTranslations()

  const sectionTitle =
    lang === 'vi' ? 'Sản xuất & Kiểm soát chất lượng' : 'Production & Quality Control'
  const sectionSubtitle =
    lang === 'vi'
      ? 'Xưởng sản xuất và lắp đặt chuyên nghiệp tại Nha Trang với tiêu chuẩn chất lượng cao'
      : 'Professional production and installation workshop in Nha Trang with rigorous quality standards.'
  const workshopTitle = lang === 'vi' ? 'Địa chỉ xưởng' : 'Workshop address'
  const workshopAddress =
    lang === 'vi'
      ? '123 Đường Trần Phú, Phường Vĩnh Nguyên, Nha Trang, Khánh Hòa'
      : '123 Tran Phu Street, Vinh Nguyen Ward, Nha Trang, Khanh Hoa'
  const viewMap = lang === 'vi' ? 'Xem trên bản đồ →' : 'View on map →'
  const businessHoursTitle = lang === 'vi' ? 'Giờ làm việc' : 'Opening hours'
  const businessHours =
    lang === 'vi' ? 'Thứ 2 - Chủ nhật: 8:00 - 20:00' : 'Monday - Sunday: 8:00 AM - 8:00 PM'
  const timezoneLabel = lang === 'vi' ? '(Giờ Việt Nam, UTC+7)' : '(Vietnam Time, UTC+7)'

  const certificationTitle = lang === 'vi' ? 'Chứng nhận & Bảo hành' : 'Certifications & Warranty'
  const certifications: string[] =
    lang === 'vi'
      ? [
          'Chứng nhận chất lượng ISO 9001',
          'Bảo hành 2 năm chống phai màu',
          'Kiểm tra chất lượng 100% sản phẩm',
        ]
      : [
          'ISO 9001 quality certification',
          '2-year anti-fade warranty',
          '100% quality inspection before delivery',
        ]

  const galleryTitle = lang === 'vi' ? 'Hình ảnh xưởng sản xuất' : 'Workshop gallery'

  const processTitle = lang === 'vi' ? 'Quy trình sản xuất' : 'Production process'
  const processSteps: ProcessStep[] =
    lang === 'vi'
      ? [
          { step: '1', title: 'Thiết kế', desc: 'Thiết kế độc đáo theo yêu cầu' },
          { step: '2', title: 'In ấn', desc: 'In chất lượng cao với mực chuyên dụng' },
          { step: '3', title: 'Cắt', desc: 'Cắt CNC chính xác theo kích thước' },
          { step: '4', title: 'Kiểm tra', desc: 'Kiểm tra chất lượng trước khi giao' },
        ]
      : [
          { step: '1', title: 'Design', desc: 'Custom design tailored to your request' },
          { step: '2', title: 'Printing', desc: 'High-quality printing with premium inks' },
          { step: '3', title: 'Cutting', desc: 'Precision CNC cutting to exact sizes' },
          { step: '4', title: 'Inspection', desc: 'Quality check before delivery' },
        ]

  const bookingButton = lang === 'vi' ? 'Đặt lịch lắp đặt tại xưởng' : 'Book workshop installation'

  return (
    <section id="production" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{sectionTitle}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{sectionSubtitle}</p>
        </motion.div>

        {/* Location & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-xl p-6"
          >
            <div className="flex items-start space-x-4 mb-6">
              <MapPin className="text-primary-600 flex-shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{workshopTitle}</h3>
                <p className="text-gray-600">{workshopAddress}</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline mt-2 inline-block"
                >
                  {viewMap}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="text-primary-600 flex-shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{businessHoursTitle}</h3>
                <p className="text-gray-600">
                  {businessHours}
                  <br />
                  {timezoneLabel}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{certificationTitle}</h3>
            <div className="space-y-4">
              {certifications.map((item, index) => (
                <div key={item} className="flex items-center space-x-3">
                  {index === 0 && <Award className="text-primary-600" size={24} />}
                  {index === 1 && <Shield className="text-primary-600" size={24} />}
                  {index === 2 && <CheckCircle className="text-primary-600" size={24} />}
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{galleryTitle}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i: number) => (
              <div
                key={i}
                className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden"
              >
                <Image
                  src={`/production/workshop-${i}.jpg`}
                  alt={`Workshop ${i}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  onError={e => {
                    // Fallback placeholder
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EWorkshop%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{processTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {processSteps.map((item: ProcessStep) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Booking CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={() => setShowBooking(true)}
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors min-h-[44px]"
          >
            <Calendar size={24} />
            <span>{bookingButton}</span>
          </button>
        </motion.div>
      </div>

      {showBooking && <InstallationBooking onClose={() => setShowBooking(false)} />}
    </section>
  )
}
