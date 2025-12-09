'use client'

import { motion } from 'framer-motion'
import { CheckCircle, PlayCircle } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

type Step = {
  number: number
  title: string
  description: string
}

const STEPS: Record<'vi' | 'en', Step[]> = {
  vi: [
    {
      number: 1,
      title: 'Chuẩn bị bề mặt',
      description:
        'Làm sạch và khử dầu mỡ bề mặt xe máy. Đảm bảo bề mặt khô ráo và không có bụi bẩn.',
    },
    {
      number: 2,
      title: 'Đo và cắt',
      description: 'Đo kích thước chính xác và cắt decal theo hình dạng của từng bộ phận xe.',
    },
    {
      number: 3,
      title: 'Áp dụng dung dịch',
      description: 'Phun dung dịch nước xà phòng loãng lên bề mặt để dễ dàng điều chỉnh vị trí.',
    },
    {
      number: 4,
      title: 'Dán decal',
      description: 'Dán từ từ, dùng dụng cụ ép để loại bỏ bọt khí, bắt đầu từ giữa ra ngoài.',
    },
    {
      number: 5,
      title: 'Cắt viền',
      description: 'Cắt phần thừa cẩn thận bằng dao chuyên dụng, đảm bảo viền gọn gàng.',
    },
    {
      number: 6,
      title: 'Hoàn thiện',
      description:
        'Làm nóng bằng máy sấy để decal bám chặt, kiểm tra và chỉnh sửa các chi tiết cuối cùng.',
    },
  ],
  en: [
    {
      number: 1,
      title: 'Prepare the surface',
      description:
        'Clean and degrease the scooter thoroughly. Make sure the surface is dry and dust-free.',
    },
    {
      number: 2,
      title: 'Measure & trim',
      description: 'Measure accurately and trim the vinyl to match each body panel of the scooter.',
    },
    {
      number: 3,
      title: 'Apply solution',
      description: 'Spray a light soap-water solution to help reposition the vinyl easily.',
    },
    {
      number: 4,
      title: 'Lay the vinyl',
      description: 'Work slowly, using a squeegee to remove air bubbles from the center outwards.',
    },
    {
      number: 5,
      title: 'Trim edges',
      description: 'Carefully trim excess vinyl with a precision knife for clean edges.',
    },
    {
      number: 6,
      title: 'Finish up',
      description: 'Use a heat gun to seal the vinyl, then inspect and refine the final details.',
    },
  ],
}

export default function HowToInstall() {
  const { lang } = useTranslations()
  const steps: Step[] = STEPS[lang]
  const sectionTitle = lang === 'vi' ? 'Hướng dẫn lắp đặt' : 'Installation Guide'
  const sectionSubtitle =
    lang === 'vi'
      ? 'Làm theo 6 bước đơn giản để tự lắp đặt decal tại nhà, hoặc đặt lịch lắp đặt chuyên nghiệp tại xưởng của chúng tôi.'
      : 'Follow 6 simple steps to install decals at home, or book a professional session at our workshop.'
  const videoTitle =
    lang === 'vi' ? 'Xem video hướng dẫn chi tiết' : 'Watch the step-by-step tutorial'
  const videoSubtitle =
    lang === 'vi'
      ? 'Video hướng dẫn từng bước với hình ảnh rõ ràng, dễ hiểu'
      : 'Clear, step-by-step instructions with close-up footage.'
  const videoCta = lang === 'vi' ? 'Xem video' : 'Watch video'
  const ctaTitle =
    lang === 'vi'
      ? 'Dịch vụ lắp đặt chuyên nghiệp tại Nha Trang'
      : 'Professional installation in Nha Trang'
  const ctaDescription =
    lang === 'vi'
      ? 'Đặt lịch lắp đặt tại xưởng của chúng tôi để đảm bảo chất lượng hoàn hảo'
      : 'Book an appointment at our workshop for a flawless result.'
  const ctaButton = lang === 'vi' ? 'Đặt lịch lắp đặt' : 'Book installation'

  return (
    <section id="how-to-install" className="py-20 bg-gray-50">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step: Step, index: number) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{videoTitle}</h3>
              <p className="text-gray-600">{videoSubtitle}</p>
            </div>
            <button className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]">
              <PlayCircle size={24} />
              <span>{videoCta}</span>
            </button>
          </div>
        </motion.div>

        {/* Professional Installation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
        >
          <CheckCircle size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">{ctaTitle}</h3>
          <p className="text-lg mb-6 opacity-90">{ctaDescription}</p>
          <button
            onClick={() => {
              const element = document.getElementById('production')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors min-h-[44px]"
          >
            {ctaButton}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
