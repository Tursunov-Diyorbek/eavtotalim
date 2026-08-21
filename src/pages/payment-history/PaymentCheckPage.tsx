import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { Button, EmptyState, ErrorMessage, Skeleton } from '@/components/ui'
import { routes } from '@/config'
import { useAuth } from '@/features/auth'
import { usePaymentCheckQuery } from '@/features/payment-history'
import { useSmartBack } from '@/hooks'
import { fullNameOf, printElement } from '@/lib'
import { CheckBody } from './PrintCheckModal'

export function PaymentCheckPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(routes.paymentHistory)
  const { me } = useAuth()
  const query = usePaymentCheckQuery(id)
  const item = query.data
  const phone = me?.profession?.organization?.phone

  return (
    <>
      <Header
        title={t('paymentHistoryPage.checkTitle')}
        onBack={goBack}
        actions={
          item?.id ? (
            <Button
              onClick={() =>
                printElement(
                  document.getElementById('payment-check-sheet'),
                  t('paymentHistoryPage.checkTitle'),
                )
              }
            >
              <Printer className="size-3.5" aria-hidden />
              {t('paymentHistoryPage.printCheck')}
            </Button>
          ) : undefined
        }
      />
      <PageMain>
        {query.isLoading ? (
          <Skeleton className="mx-auto h-96 w-80" rounded="xl" />
        ) : query.isError || !item?.id ? (
          query.isError ? (
            <ErrorMessage />
          ) : (
            <EmptyState description={t('common.loadError')} />
          )
        ) : (
          <div className="mx-auto w-full max-w-md">
            <div id="payment-check-sheet">
              <CheckBody
                payload={{
                  id: item.id,
                  org: item.organization?.name,
                  group: item.group?.name_uz || item.group?.name,
                  student: fullNameOf(item.student),
                  paymentDate: item.payment_date,
                  payType: item.pay_type?.name,
                  amount: item.amount,
                }}
                phone={phone}
              />
            </div>
          </div>
        )}
      </PageMain>
    </>
  )
}
