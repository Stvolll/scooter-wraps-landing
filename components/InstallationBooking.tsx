'use client'

import { useState, ChangeEvent, FormEvent, MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin } from 'lucide-react'
import { format, addDays, isSameDay, isPast } from 'date-fns'
import { useTranslations } from '@/hooks/useTranslations'

interface InstallationBookingProps {
  onClose: () => void
}

type Workshop = { id: string; name: string; address: string }

const WORKSHOP_PARTNERS: Record<'vi' | 'en', Workshop[]> = {
  vi: [
    { id: '1', name: 'Xưởng chính - Trần Phú', address: '123 Đường Trần Phú, Nha Trang' },
    {
      id: '2',
      name: 'Xưởng phụ - Nguyễn Thị Minh Khai',
      address: '456 Đường Nguyễn Thị Minh Khai, Nha Trang',
    },
  ],
  en: [
    { id: '1', name: 'Main workshop - Tran Phu', address: '123 Tran Phu Street, Nha Trang' },
    {
      id: '2',
      name: 'Partner workshop - Nguyen Thi Minh Khai',
      address: '456 Nguyen Thi Minh Khai Street, Nha Trang',
    },
  ],
}

const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
]

export default function InstallationBooking({ onClose }: InstallationBookingProps) {
  const { lang } = useTranslations()
  const workshopPartners = WORKSHOP_PARTNERS[lang]
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1))
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>(workshopPartners[0]?.id ?? '')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    scooterModel: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1))

  const heading = lang === 'vi' ? 'Đặt lịch lắp đặt' : 'Book installation'
  const selectWorkshopLabel = lang === 'vi' ? 'Chọn xưởng lắp đặt' : 'Choose a workshop'
  const selectDateLabel = lang === 'vi' ? 'Chọn ngày' : 'Select date'
  const selectTimeLabel = lang === 'vi' ? 'Chọn giờ' : 'Select time'
  const customerInfoLabel = lang === 'vi' ? 'Thông tin khách hàng' : 'Customer information'
  const namePlaceholder = lang === 'vi' ? 'Họ và tên *' : 'Full name *'
  const phonePlaceholder = lang === 'vi' ? 'Số điện thoại *' : 'Phone number *'
  const emailPlaceholder = lang === 'vi' ? 'Email' : 'Email'
  const modelPlaceholder =
    lang === 'vi' ? 'Mẫu xe (VD: Honda Lead) *' : 'Scooter model (e.g. Honda Lead) *'
  const notesPlaceholder = lang === 'vi' ? 'Ghi chú thêm (tùy chọn)' : 'Additional notes (optional)'
  const confirmButton = lang === 'vi' ? 'Xác nhận đặt lịch' : 'Confirm booking'
  const submittingText = lang === 'vi' ? 'Đang xử lý...' : 'Processing...'
  const selectTimeAlert = lang === 'vi' ? 'Vui lòng chọn giờ lắp đặt' : 'Please select a time slot'
  const successMessage =
    lang === 'vi'
      ? 'Đặt lịch thành công! Chúng tôi sẽ xác nhận lại với bạn qua điện thoại.'
      : 'Booking successful! We will confirm the appointment by phone.'
  const errorMessage =
    lang === 'vi'
      ? 'Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp.'
      : 'Something went wrong. Please try again or contact us directly.'
  const weekDays =
    lang === 'vi'
      ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months =
    lang === 'vi'
      ? ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const formatDay = (date: Date) => weekDays[date.getDay()]
  const formatMonth = (date: Date) => months[date.getMonth()]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTime) {
      alert(selectTimeAlert)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/book-installation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString(),
          time: selectedTime,
          workshopId: selectedWorkshop,
          timezone: 'Asia/Ho_Chi_Minh',
        }),
      })

      if (response.ok) {
        alert(successMessage)
        onClose()
      } else {
        throw new Error('Booking failed')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange =
    (field: 'name' | 'phone' | 'email' | 'scooterModel') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value })
    }

  const handleNotesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, notes: event.target.value })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Workshop Selection */}
            <div className="space-y-3">
              <label className="block font-semibold text-lg mb-3">
                <MapPin size={20} className="inline mr-2" />
                {selectWorkshopLabel}
              </label>
              {workshopPartners.map((workshop: Workshop) => (
                <label
                  key={workshop.id}
                  className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="workshop"
                    value={workshop.id}
                    checked={selectedWorkshop === workshop.id}
                    onChange={() => setSelectedWorkshop(workshop.id)}
                    className="w-5 h-5 text-primary-600 mt-1"
                  />
                  <div>
                    <div className="font-semibold">{workshop.name}</div>
                    <div className="text-sm text-gray-600">{workshop.address}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <label className="block font-semibold text-lg mb-3">
                <Calendar size={20} className="inline mr-2" />
                {selectDateLabel}
              </label>
              <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
                {availableDates.slice(0, 14).map(date => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedTime('')
                    }}
                    disabled={isPast(date)}
                    className={`p-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                      isSameDay(date, selectedDate)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isPast(date) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-xs">{formatDay(date)}</div>
                    <div className="text-sm font-bold">{format(date, 'd')}</div>
                    <div className="text-xs">{formatMonth(date)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-3">
              <label className="block font-semibold text-lg mb-3">
                <Clock size={20} className="inline mr-2" />
                {selectTimeLabel}
              </label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                      selectedTime === time
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-semibold text-lg">{customerInfoLabel}</h3>
              <input
                type="text"
                placeholder={namePlaceholder}
                required
                value={formData.name}
                onChange={handleInputChange('name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              <input
                type="tel"
                placeholder={phonePlaceholder}
                required
                value={formData.phone}
                onChange={handleInputChange('phone')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              <input
                type="email"
                placeholder={emailPlaceholder}
                value={formData.email}
                onChange={handleInputChange('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              <input
                type="text"
                placeholder={modelPlaceholder}
                required
                value={formData.scooterModel}
                onChange={handleInputChange('scooterModel')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              <textarea
                placeholder={notesPlaceholder}
                value={formData.notes}
                onChange={handleNotesChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedTime}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors min-h-[44px]"
            >
              {isSubmitting ? submittingText : confirmButton}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
