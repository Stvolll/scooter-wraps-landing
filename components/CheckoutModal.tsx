'use client'

import { useState, ChangeEvent, FormEvent, MouseEvent } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

interface Design {
  id: string
  name: string
  price: number
  image: string
}

interface CheckoutModalProps {
  design: Design
  onClose: () => void
}

type PaymentMethod = 'cod' | 'momo' | 'zalopay' | 'bank' | 'card'

export default function CheckoutModal({ design, onClose }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [deliveryOption, setDeliveryOption] = useState<'shipping' | 'shipping-install'>('shipping')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t, lang } = useTranslations()

  const locale = lang === 'vi' ? 'vi-VN' : 'en-US'
  const customerInfoTitle = lang === 'vi' ? 'Thông tin khách hàng' : 'Customer information'
  const namePlaceholder = lang === 'vi' ? 'Họ và tên *' : 'Full name *'
  const phonePlaceholder = lang === 'vi' ? 'Số điện thoại *' : 'Phone number *'
  const emailPlaceholder = 'Email'
  const addressPlaceholder = lang === 'vi' ? 'Địa chỉ giao hàng *' : 'Shipping address *'
  const deliveryTitle = lang === 'vi' ? 'Tùy chọn giao hàng' : 'Delivery options'
  const deliveryShippingTitle = lang === 'vi' ? 'Chỉ giao hàng' : 'Shipping only'
  const deliveryShippingDesc =
    lang === 'vi' ? 'Nhận hàng tại địa chỉ của bạn' : 'Receive the kit at your address'
  const deliveryInstallTitle =
    lang === 'vi' ? 'Giao hàng + Lắp đặt tại Nha Trang' : 'Shipping + Installation in Nha Trang'
  const deliveryInstallDesc =
    lang === 'vi'
      ? '+{price} (Bao gồm lắp đặt chuyên nghiệp)'
      : '+{price} (Professional installation included)'
  const paymentTitle = lang === 'vi' ? 'Phương thức thanh toán' : 'Payment methods'
  const totalProductLabel = lang === 'vi' ? 'Giá sản phẩm:' : 'Product price:'
  const installationLabel = lang === 'vi' ? 'Phí lắp đặt:' : 'Installation fee:'
  const totalLabel = lang === 'vi' ? 'Tổng cộng:' : 'Total:'
  const successMessage =
    lang === 'vi'
      ? 'Đơn hàng đã được đặt thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.'
      : 'Order placed successfully! We will contact you shortly.'
  const errorMessage =
    lang === 'vi' ? 'Có lỗi xảy ra. Vui lòng thử lại.' : 'Something went wrong. Please try again.'
  const submitLabel = lang === 'vi' ? 'Đặt hàng ngay' : 'Place order'
  const submittingLabel = lang === 'vi' ? 'Đang xử lý...' : 'Processing...'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const installationFee = 200000
  const totalPrice = design.price + (deliveryOption === 'shipping-install' ? installationFee : 0)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: design.id,
          paymentMethod,
          deliveryOption,
          ...formData,
          totalPrice,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Handle success - redirect to payment or show confirmation
        if (paymentMethod === 'momo' || paymentMethod === 'zalopay') {
          window.location.href = data.paymentUrl
        } else {
          alert(successMessage)
          onClose()
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange =
    (field: 'name' | 'phone' | 'email' | 'address') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [field]: event.target.value })
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
            <h2 className="text-2xl font-bold text-gray-900">{t('checkout.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Design Summary */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative w-20 h-20">
                <Image
                  src={design.image}
                  alt={design.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="80px"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{design.name}</h3>
                <p className="text-primary-600 font-bold">{formatPrice(design.price)}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{customerInfoTitle}</h3>
              <input
                type="text"
                placeholder={namePlaceholder}
                required
                value={formData.name}
                onChange={handleFieldChange('name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              <input
                type="tel"
                placeholder={phonePlaceholder}
                required
                value={formData.phone}
                onChange={handleFieldChange('phone')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              <input
                type="email"
                placeholder={emailPlaceholder}
                value={formData.email}
                onChange={handleFieldChange('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              <textarea
                placeholder={addressPlaceholder}
                required
                value={formData.address}
                onChange={handleFieldChange('address')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Delivery Option */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{deliveryTitle}</h3>
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="delivery"
                  value="shipping"
                  checked={deliveryOption === 'shipping'}
                  onChange={() => setDeliveryOption('shipping')}
                  className="w-5 h-5 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-semibold">{deliveryShippingTitle}</div>
                  <div className="text-sm text-gray-600">{deliveryShippingDesc}</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="delivery"
                  value="shipping-install"
                  checked={deliveryOption === 'shipping-install'}
                  onChange={() => setDeliveryOption('shipping-install')}
                  className="w-5 h-5 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-semibold">{deliveryInstallTitle}</div>
                  <div className="text-sm text-gray-600">
                    {deliveryInstallDesc.replace('{price}', formatPrice(installationFee))}
                  </div>
                </div>
              </label>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{paymentTitle}</h3>

              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-5 h-5 text-primary-600"
                />
                <Banknote size={24} className="text-gray-600" />
                <span className="flex-1 font-medium">{t('checkout.cod')}</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={() => setPaymentMethod('momo')}
                  className="w-5 h-5 text-primary-600"
                />
                <Smartphone size={24} className="text-gray-600" />
                <span className="flex-1 font-medium">{t('checkout.momo')}</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="zalopay"
                  checked={paymentMethod === 'zalopay'}
                  onChange={() => setPaymentMethod('zalopay')}
                  className="w-5 h-5 text-primary-600"
                />
                <Smartphone size={24} className="text-gray-600" />
                <span className="flex-1 font-medium">{t('checkout.zalopay')}</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="w-5 h-5 text-primary-600"
                />
                <CreditCard size={24} className="text-gray-600" />
                <span className="flex-1 font-medium">{t('checkout.bankTransfer')}</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="w-5 h-5 text-primary-600"
                />
                <CreditCard size={24} className="text-gray-600" />
                <span className="flex-1 font-medium">{t('checkout.card')}</span>
              </label>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{totalProductLabel}</span>
                <span className="font-semibold">{formatPrice(design.price)}</span>
              </div>
              {deliveryOption === 'shipping-install' && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{installationLabel}</span>
                  <span className="font-semibold">{formatPrice(installationFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold text-primary-600 pt-2 border-t">
                <span>{totalLabel}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors min-h-[44px]"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
