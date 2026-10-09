import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { Button, ErrorMessage, Panel, SkeletonLines } from '@/components/ui'
import { routes } from '@/config'
import { useAuth } from '@/features/auth'
import { useCarQuery } from '@/features/cars'
import { useSmartBack } from '@/hooks'
import { fullNameOf, printElement } from '@/lib'

const PRINT_CSS = `
  body { padding: 10mm 12mm; color: #0f2430; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #1e293b; padding: 4px 8px; vertical-align: top; }
`

/** Eski `CarRoadCost` — yo‘l varaqasi. Chop etish `printElement` orqali. */
export function CarRoadCostPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(routes.cars)
  const { me } = useAuth()
  const query = useCarQuery(id)
  const sheetRef = useRef<HTMLDivElement>(null)
  const car = query.data
  const teacher = fullNameOf(car?.teacher)
  const address = me?.profession?.address?.trim() || ''

  return (
    <>
      <Header
        title={t('carsPage.roadTitle')}
        onBack={goBack}
        actions={
          car ? (
            <Button
              onClick={() =>
                printElement(sheetRef.current, t('carsPage.roadTitle'), { extraCss: PRINT_CSS })
              }
            >
              <Printer className="size-3.5" aria-hidden />
              {t('carsPage.print')}
            </Button>
          ) : undefined
        }
      />
      <PageMain>
        {query.isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={12} />
          </Panel>
        ) : query.isError || !car ? (
          <ErrorMessage />
        ) : (
          <div className="mx-auto w-full max-w-4xl rounded-xl border border-mist bg-white p-6 text-[13px] leading-6 text-deep shadow-sm">
            <div ref={sheetRef}>
              <div className="grid grid-cols-12 gap-4">
                <p className="col-span-3 text-[12px]">{address}</p>
                <div className="col-span-5">
                  <p className="mt-2 text-center text-base font-semibold">{t('carsPage.roadHeading')}</p>
                  <p className="mt-2">{t('carsPage.roadDate')}</p>
                  <Line label={t('carsPage.roadBrand')} value={[car.name, car.number].filter(Boolean).join(' · ')} />
                  <Line label={t('carsPage.roadMaster')} value={teacher || ''} />
                  <Line label={t('carsPage.roadLeave')} />
                  <Line label={t('carsPage.roadReturn')} />
                  <p>__________________________________________________</p>
                </div>
                <div className="col-span-4 text-[12px]">
                  <p>{t('carsPage.roadPermit')}</p>
                  <SignRow label={t('carsPage.roadMechanic')} />
                  <p className="mt-2">{t('carsPage.roadAccepted')}</p>
                  <SignRow label={t('carsPage.roadUsta')} />
                  <p className="mt-2">{t('carsPage.roadRealTime')}</p>
                  <p>{t('carsPage.roadLeaveTime')}</p>
                  <p>{t('carsPage.roadReturnTime')}</p>
                </div>
              </div>

              <table className="mt-4 w-full border-collapse text-[12px]">
                <tbody>
                  <tr>
                    <td className="w-[40%] border border-ink/70 px-2 py-1">{t('carsPage.roadRoute')}</td>
                    <td className="w-[40%] border border-ink/70 px-2 py-1">{t('carsPage.fuel')}</td>
                    <td className="w-[20%] border border-ink/70 px-2 py-1" />
                  </tr>
                  <tr>
                    <td className="h-6 border border-ink/70" />
                    <td className="border border-ink/70 px-2 text-center">{t('carsPage.roadTank')}</td>
                    <td className="border border-ink/70" />
                  </tr>
                  <tr>
                    <td className="h-6 border border-ink/70" />
                    <td className="border border-ink/70 px-2 text-right">{t('carsPage.roadTaken')}</td>
                    <td className="border border-ink/70" />
                  </tr>
                  <FuelRow n="1." />
                  <FuelRow n="2." />
                  <tr>
                    <td className="h-6 border border-ink/70" />
                    <td className="border border-ink/70" />
                    <td className="border border-ink/70" />
                  </tr>
                  <tr>
                    <td className="h-6 border border-ink/70" />
                    <td className="border border-ink/70" />
                    <td className="border border-ink/70" />
                  </tr>
                  <tr>
                    <td className="h-6 border border-ink/70" />
                    <td className="border border-ink/70 px-2">
                      <span className="flex justify-between">
                        <span>{t('carsPage.roadLeftInTank')}</span>
                        <span>{t('carsPage.roadFuelWord')}</span>
                      </span>
                    </td>
                    <td className="border border-ink/70" />
                  </tr>
                  <tr>
                    <td className="h-6 border border-ink/70" />
                    <td className="border border-ink/70" />
                    <td className="border border-ink/70" />
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 flex items-start justify-between gap-6">
                <div>
                  <p className="font-semibold">{t('carsPage.roadFuelReport')}</p>
                  <p className="flex justify-between gap-8">
                    <span>{t('carsPage.roadDaily')}</span>
                    <span>km</span>
                  </p>
                  <p>{t('carsPage.roadNorm')}</p>
                  <p>{t('carsPage.roadDailyFuel')}</p>
                </div>
                <SignRow label={t('carsPage.roadChief')} />
              </div>
            </div>
          </div>
        )}
      </PageMain>
    </>
  )
}

function Line({ label, value }: { label: string; value?: string }) {
  return (
    <p>
      {label}
      {value ? <span className="ml-2 font-semibold">{value}</span> : '____________________________________________'}
    </p>
  )
}

function SignRow({ label }: { label: string }) {
  const { t } = useTranslation()
  return (
    <div className="mt-1 flex items-start gap-3">
      <span>{label}</span>
      <span className="text-center">
        _________________
        <br />
        <span className="text-[11px] text-muted">({t('carsPage.roadSign')})</span>
      </span>
    </div>
  )
}

function FuelRow({ n }: { n: string }) {
  return (
    <tr>
      <td className="h-6 border border-ink/70" />
      <td className="border border-ink/70 px-2">
        <span className="flex justify-between">
          <span>{n}</span>
          <span>L</span>
        </span>
      </td>
      <td className="border border-ink/70" />
    </tr>
  )
}
